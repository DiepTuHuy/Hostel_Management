from flask import Blueprint
from app.controllers.user_controller import UserController

user_bp = Blueprint('user', __name__)

@user_bp.route('', methods=['GET'])
@user_bp.route('/', methods=['GET'])
def list_users():
    return UserController.list_users()

@user_bp.route('/<id>', methods=['GET'])
def get_by_id(id):
    return UserController.get_by_id(id)
