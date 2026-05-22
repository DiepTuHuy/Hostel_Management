import os
import datetime
from flask import jsonify
import bcrypt
import jwt
from app.models.user import User
from app.models.utils import serialize_doc

class AuthController:
    @staticmethod
    def register(data):
        fullName = data.get("fullName")
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone")
        role = data.get("role", "tenant")
        tenantProfile = data.get("tenantProfile")

        if not fullName or not email or not password or not phone:
            return jsonify({"message": "Vui lòng nhập đầy đủ các thông tin bắt buộc."}), 400

        existing_user = User.find_by_email(email)
        if existing_user:
            return jsonify({"message": "Email này đã tồn tại trong hệ thống."}), 400

        try:
            new_user = User.create({
                "fullName": fullName,
                "email": email.lower(),
                "password": password,
                "phone": phone,
                "role": role,
                "status": "active",
                "tenantProfile": tenantProfile if role == 'tenant' else None
            })

            response_user = serialize_doc(new_user)
            if "password" in response_user:
                del response_user["password"]

            return jsonify({
                "message": "Đăng ký tài khoản thành công!",
                "user": response_user
            }), 201
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống khi đăng ký tài khoản: {str(e)}"}), 500

    @staticmethod
    def login(data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Vui lòng nhập email và mật khẩu."}), 400

        user = User.find_by_email(email)
        if not user:
            return jsonify({"message": "Tài khoản không tồn tại."}), 404

        hashed_pw = user.get("password", "")
        is_match = False
        try:
            if bcrypt.checkpw(password.encode('utf-8'), hashed_pw.encode('utf-8')):
                is_match = True
        except Exception:
            # Fallback for plain text password comparison or password == role
            if password == hashed_pw or password == user.get("role"):
                is_match = True

        if not is_match:
            return jsonify({"message": "Mật khẩu không chính xác."}), 400

        user_id = str(user["_id"])
        
        # Generate JWT token
        secret = os.getenv("JWT_SECRET", "supersecretkey")
        payload = {
            "sub": user_id,
            "role": user.get("role"),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
            "iat": datetime.datetime.utcnow()
        }
        token = jwt.encode(payload, secret, algorithm="HS256")
        # In PyJWT < 2.0, jwt.encode might return bytes, in 2.0+ it returns str
        if isinstance(token, bytes):
            token = token.decode('utf-8')

        response_user = serialize_doc(user)
        if "password" in response_user:
            del response_user["password"]

        return jsonify({
            "token": token,
            "user": response_user
        }), 200
