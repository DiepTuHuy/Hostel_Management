from flask import Blueprint
from app.controllers.room_controller import RoomController

room_bp = Blueprint('room', __name__)

@room_bp.route('', methods=['GET'])
@room_bp.route('/', methods=['GET'])
def list_rooms():
    return RoomController.list_rooms()

@room_bp.route('/search', methods=['GET'])
def search_rooms():
    return RoomController.search_rooms()

@room_bp.route('/<id>', methods=['GET'])
def get_by_id(id):
    return RoomController.get_by_id(id)
