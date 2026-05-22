from flask import Blueprint
from app.controllers.property_controller import PropertyController

property_bp = Blueprint('property', __name__)

@property_bp.route('', methods=['GET'])
@property_bp.route('/', methods=['GET'])
def list_all():
    return PropertyController.list_all()

@property_bp.route('/<id>', methods=['GET'])
def get_by_id(id):
    return PropertyController.get_by_id(id)
