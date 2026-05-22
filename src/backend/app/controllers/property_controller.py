from flask import jsonify
from app.models.property import Property
from app.models.user import User
from app.models.utils import serialize_doc

class PropertyController:
    @staticmethod
    def list_all():
        try:
            properties = Property.find_all()
            serialized = []
            for prop in properties:
                prop_doc = serialize_doc(prop)
                # Populate manager details for compatibility
                manager_ids = prop.get("managerIds", [])
                managers = []
                for m_id in manager_ids:
                    m = User.find_by_id(m_id)
                    if m:
                        m_doc = serialize_doc(m)
                        if "password" in m_doc:
                            del m_doc["password"]
                        managers.append(m_doc)
                prop_doc["managerIds"] = managers
                serialized.append(prop_doc)
                
            return jsonify(serialized), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500

    @staticmethod
    def get_by_id(property_id):
        try:
            prop = Property.find_by_id(property_id)
            if not prop:
                return jsonify({"message": "Cơ sở không tồn tại."}), 404
                
            prop_doc = serialize_doc(prop)
            manager_ids = prop.get("managerIds", [])
            managers = []
            for m_id in manager_ids:
                m = User.find_by_id(m_id)
                if m:
                    m_doc = serialize_doc(m)
                    if "password" in m_doc:
                        del m_doc["password"]
                    managers.append(m_doc)
            prop_doc["managerIds"] = managers
            
            return jsonify(prop_doc), 200
        except Exception as e:
            return jsonify({"message": f"Lỗi hệ thống: {str(e)}"}), 500
