from flask import Blueprint
from app.controllers.contract_controller import ContractController

contract_bp = Blueprint('contract', __name__)

@contract_bp.route('', methods=['GET'])
@contract_bp.route('/', methods=['GET'])
def list_contracts():
    return ContractController.list_contracts()

@contract_bp.route('/<id>', methods=['GET'])
def get_by_id(id):
    return ContractController.get_by_id(id)
