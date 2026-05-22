from bson import ObjectId
from db import get_db

class Contract:
    @staticmethod
    def get_collection():
        return get_db()["contracts"]

    @staticmethod
    def find_all(property_id=None, tenant_id=None, status=None):
        coll = Contract.get_collection()
        query = {}
        if property_id:
            from app.models.utils import resolve_property_id
            resolved = resolve_property_id(property_id)
            if resolved:
                query["propertyId"] = {"$in": [resolved, str(resolved)]}
            else:
                query["propertyId"] = property_id
                
        if tenant_id:
            from app.models.utils import try_object_id
            resolved_tenant = try_object_id(tenant_id)
            tenant_vals = [resolved_tenant, str(resolved_tenant)]
            # Support both tenantId (from mock) and tenantIds array (from mongo schema)
            query["$or"] = [
                {"tenantId": {"$in": tenant_vals}},
                {"tenantIds": {"$in": tenant_vals}},
                {"tenantIds": resolved_tenant}
            ]
        if status:
            query["status"] = status
        return list(coll.find(query))

    @staticmethod
    def find_by_id(contract_id):
        coll = Contract.get_collection()
        try:
            doc = coll.find_one({"_id": ObjectId(contract_id)})
            if doc:
                return doc
        except Exception:
            pass
        doc = coll.find_one({"_id": contract_id})
        if doc:
            return doc
        return coll.find_one({"id": contract_id})

    @staticmethod
    def create(contract_data):
        coll = Contract.get_collection()
        if 'id' in contract_data and '_id' not in contract_data:
            contract_data['_id'] = contract_data['id']
        result = coll.insert_one(contract_data)
        return coll.find_one({"_id": result.inserted_id})
