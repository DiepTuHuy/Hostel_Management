from flask import Blueprint
from app.controllers.notification_controller import NotificationController

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('', methods=['GET'])
@notification_bp.route('/', methods=['GET'])
def list_notifications():
    return NotificationController.list_notifications()
