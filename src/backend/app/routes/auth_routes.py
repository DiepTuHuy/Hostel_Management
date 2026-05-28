from flask import Blueprint, request
from app.controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    return AuthController.register(request.json or {})

@auth_bp.route('/login', methods=['POST'])
def login():
    return AuthController.login(request.json or {})
