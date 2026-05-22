from flask import request, jsonify
from app.models.user import User
from app.models.utils import serialize_doc

class UserController:
    @staticmethod
    def list_users():
        try:
            role = request.args.get("role")
            users = User.find_all(role=role)
            serialized = serialize_doc(users)
            for u in serialized:
                if "password" in u:
                    del u["password"]
            return jsonify(serialized), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(user_id):
        try:
            user = User.find_by_id(user_id)
            if not user:
                return jsonify({"message": "Người dùng không tồn tại."}), 404
            u_doc = serialize_doc(user)
            if "password" in u_doc:
                del u_doc["password"]
            return jsonify(u_doc), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
