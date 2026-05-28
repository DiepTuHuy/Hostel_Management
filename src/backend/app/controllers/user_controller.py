from flask import request, jsonify
from app.models.user import User
from app.models.utils import map_user

class UserController:
    @staticmethod
    def list_users():
        try:
            role = request.args.get("role")
            users = User.find_all(role=role)
            mapped = [map_user(u) for u in users if u]
            for u in mapped:
                if u and "password" in u:
                    del u["password"]
            return jsonify(mapped), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(user_id):
        try:
            user = User.find_by_id(user_id)
            if not user:
                return jsonify({"message": "Người dùng không tồn tại."}), 404
            u_doc = map_user(user)
            if u_doc and "password" in u_doc:
                del u_doc["password"]
            return jsonify(u_doc), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
