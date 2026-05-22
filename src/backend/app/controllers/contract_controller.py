from flask import request, jsonify
from app.models.contract import Contract
from app.models.utils import serialize_doc

class ContractController:
    @staticmethod
    def list_contracts():
        try:
            property_id = request.args.get("propertyId")
            tenant_id = request.args.get("tenantId")
            status = request.args.get("status")
            
            contracts = Contract.find_all(property_id=property_id, tenant_id=tenant_id, status=status)
            return jsonify(serialize_doc(contracts)), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(contract_id):
        try:
            contract = Contract.find_by_id(contract_id)
            if not contract:
                return jsonify({"message": "Hợp đồng không tồn tại."}), 404
            return jsonify(serialize_doc(contract)), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
