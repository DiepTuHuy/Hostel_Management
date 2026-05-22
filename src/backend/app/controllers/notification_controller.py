from flask import request, jsonify
from app.models.notification import Notification
from app.models.utils import map_notification

class NotificationController:
    @staticmethod
    def list_notifications():
        try:
            user_id = request.args.get("userId")
            notifications = Notification.find_all(user_id=user_id)
            return jsonify([map_notification(n) for n in notifications if n]), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
