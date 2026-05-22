from flask import request, jsonify
from app.models.notification import Notification
from app.models.utils import serialize_doc

class NotificationController:
    @staticmethod
    def list_notifications():
        try:
            user_id = request.args.get("userId")
            notifications = Notification.find_all(user_id=user_id)
            return jsonify(serialize_doc(notifications)), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
