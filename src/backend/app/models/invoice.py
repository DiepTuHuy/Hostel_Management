from bson import ObjectId
from db import get_db

class Invoice:
    @staticmethod
    def get_collection():
        return get_db()["invoices"]

    @staticmethod
    def _map_invoice_doc(invoice):
        if not invoice:
            return invoice
        
        # Populate meterReadings from readings collection for the invoice period and room
        try:
            db = get_db()
            room_id = invoice.get("roomId")
            period = invoice.get("period")
            if room_id and period:
                from bson import ObjectId
                from app.models.utils import try_object_id
                r_id = try_object_id(room_id)
                query_room_ids = [r_id]
                if isinstance(r_id, ObjectId):
                    query_room_ids.append(str(r_id))
                
                readings = list(db["readings"].find({
                    "roomId": {"$in": query_room_ids},
                    "period": period
                }))
                
                meter_readings = {}
                for rd in readings:
                    service_id = rd.get("serviceId")
                    if service_id:
                        srv = db["services"].find_one({"_id": try_object_id(service_id)})
                        if srv:
                            name_lower = srv.get("name", "").lower()
                            if "điện" in name_lower or "electric" in name_lower:
                                meter_readings["electricity"] = {
                                    "previous": rd.get("oldValue", 0),
                                    "current": rd.get("newValue", 0)
                                }
                            elif "nước" in name_lower or "water" in name_lower:
                                meter_readings["water"] = {
                                    "previous": rd.get("oldValue", 0),
                                    "current": rd.get("newValue", 0)
                                }
                
                if meter_readings:
                    invoice["meterReadings"] = meter_readings
        except Exception:
            pass
            
        return invoice

    @staticmethod
    def find_all(tenant_id=None, property_id=None, status=None, period=None):
        coll = Invoice.get_collection()
        query = {}
        if tenant_id:
            from app.models.utils import try_object_id
            resolved_tenant = try_object_id(tenant_id)
            if resolved_tenant:
                query["tenantId"] = {"$in": [resolved_tenant, str(resolved_tenant)]}
            else:
                query["tenantId"] = tenant_id
        if property_id:
            from app.models.utils import resolve_property_id
            resolved_prop = resolve_property_id(property_id)
            if resolved_prop:
                query["propertyId"] = {"$in": [resolved_prop, str(resolved_prop)]}
            else:
                query["propertyId"] = property_id
        if status:
            query["status"] = status
        if period:
            query["period"] = period
        
        results = list(coll.find(query))
        return [Invoice._map_invoice_doc(inv) for inv in results]

    @staticmethod
    def find_by_id(invoice_id):
        coll = Invoice.get_collection()
        doc = None
        try:
            doc = coll.find_one({"_id": ObjectId(invoice_id)})
        except Exception:
            pass
        if not doc:
            doc = coll.find_one({"_id": invoice_id})
        if not doc:
            doc = coll.find_one({"id": invoice_id})
        return Invoice._map_invoice_doc(doc)

    @staticmethod
    def create(invoice_data):
        coll = Invoice.get_collection()
        if 'id' in invoice_data and '_id' not in invoice_data:
            invoice_data['_id'] = invoice_data['id']
        result = coll.insert_one(invoice_data)
        doc = coll.find_one({"_id": result.inserted_id})
        return Invoice._map_invoice_doc(doc)

    @staticmethod
    def update(invoice_id, update_data):
        coll = Invoice.get_collection()
        try:
            res = coll.update_one({"_id": ObjectId(invoice_id)}, {"$set": update_data})
            if res.matched_count > 0:
                return Invoice.find_by_id(invoice_id)
        except Exception:
            pass
        coll.update_one({"_id": invoice_id}, {"$set": update_data})
        coll.update_one({"id": invoice_id}, {"$set": update_data})
        return Invoice.find_by_id(invoice_id)
