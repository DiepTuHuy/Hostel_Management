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
        
        db = get_db()
        from app.models.utils import try_object_id
        
        # 1. Populate room (maPhongId)
        room_id = invoice.get("maPhongId")
        if room_id and not isinstance(room_id, dict):
            try:
                room_doc = db["rooms"].find_one({"_id": try_object_id(room_id)})
                if room_doc:
                    invoice["maPhongId"] = room_doc
            except Exception:
                pass
                
        # 2. Populate contract (maHopDongId)
        contract_id = invoice.get("maHopDongId")
        if contract_id and not isinstance(contract_id, dict):
            try:
                contract_doc = db["contracts"].find_one({"_id": try_object_id(contract_id)})
                if contract_doc:
                    ma_khach_thue_ids = contract_doc.get("maKhachThueIds") or []
                    populated_tenants = []
                    for tid in ma_khach_thue_ids:
                        if not isinstance(tid, dict):
                            u_doc = db["users"].find_one({"_id": try_object_id(tid)})
                            if u_doc:
                                populated_tenants.append(u_doc)
                            else:
                                populated_tenants.append({"_id": tid})
                        else:
                            populated_tenants.append(tid)
                    contract_doc["maKhachThueIds"] = populated_tenants
                    invoice["maHopDongId"] = contract_doc
            except Exception:
                pass
                
        # 3. Populate meterReadings from readings collection for the invoice period and room
        try:
            room_val = invoice.get("maPhongId")
            r_id = room_val.get("_id") if isinstance(room_val, dict) else room_val
            period = invoice.get("kyThanhToan")
            if r_id and period:
                from bson import ObjectId
                r_id = try_object_id(r_id)
                query_room_ids = [r_id]
                if isinstance(r_id, ObjectId):
                    query_room_ids.append(str(r_id))
                
                readings = list(db["readings"].find({
                    "maPhongId": {"$in": query_room_ids},
                    "kyThanhToan": period
                }))
                
                meter_readings = {}
                for rd in readings:
                    service_id = rd.get("maDichVuId")
                    if service_id:
                        srv = db["services"].find_one({"_id": try_object_id(service_id)})
                        if srv:
                            name_lower = srv.get("tenDichVu", "").lower()
                            if "điện" in name_lower or "electric" in name_lower:
                                meter_readings["electricity"] = {
                                    "previous": rd.get("chiSoCu", 0),
                                    "current": rd.get("chiSoMoi", 0)
                                }
                            elif "nước" in name_lower or "water" in name_lower:
                                meter_readings["water"] = {
                                    "previous": rd.get("chiSoCu", 0),
                                    "current": rd.get("chiSoMoi", 0)
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
                db = get_db()
                contracts = list(db["contracts"].find({"maKhachThueIds": resolved_tenant}))
                contract_ids = [c["_id"] for c in contracts]
                query["maHopDongId"] = {"$in": contract_ids}
        if property_id:
            from app.models.utils import resolve_property_id
            resolved_prop = resolve_property_id(property_id)
            if resolved_prop:
                db = get_db()
                rooms = list(db["rooms"].find({"maNhaTroId": resolved_prop}))
                room_ids = [r["_id"] for r in rooms]
                query["maPhongId"] = {"$in": room_ids}
        if status:
            query["trangThai"] = status
        if period:
            query["kyThanhToan"] = period
        
        results = list(coll.find(query))
        return [Invoice._map_invoice_doc(inv) for inv in results]

    @staticmethod
    def find_by_id(invoice_id):
        coll = Invoice.get_collection()
        doc = None
        from app.models.utils import try_object_id
        resolved_id = try_object_id(invoice_id)
        try:
            doc = coll.find_one({"_id": resolved_id})
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
        from app.models.utils import try_object_id
        
        mapped_data = {}
        mapped_data["maHopDongId"] = try_object_id(invoice_data.get("contractId") or invoice_data.get("maHopDongId"))
        mapped_data["maPhongId"] = try_object_id(invoice_data.get("roomId") or invoice_data.get("maPhongId"))
        mapped_data["kyThanhToan"] = invoice_data.get("period") or invoice_data.get("kyThanhToan")
        mapped_data["tongTien"] = invoice_data.get("total") or invoice_data.get("tongTien") or 0
        
        from datetime import datetime
        due_date = invoice_data.get("dueDate") or invoice_data.get("deadline") or invoice_data.get("hanThanhToan")
        if isinstance(due_date, str):
            try:
                due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except Exception:
                pass
        mapped_data["hanThanhToan"] = due_date
        mapped_data["trangThai"] = invoice_data.get("status") or invoice_data.get("trangThai") or "pending"
        
        items = invoice_data.get("items") or invoice_data.get("details") or invoice_data.get("chiTiet") or []
        mapped_items = []
        for item in items:
            mapped_items.append({
                "maDichVuId": try_object_id(item.get("serviceId") or item.get("maDichVuId")),
                "tenDichVu": item.get("name") or item.get("tenDichVu"),
                "soLuong": item.get("qty") or item.get("quantity") or item.get("soLuong") or 1,
                "donGia": item.get("price") or item.get("donGia") or 0,
                "thanhTien": item.get("total") or item.get("amount") or item.get("thanhTien") or 0
            })
        mapped_data["chiTiet"] = mapped_items
        
        if 'id' in invoice_data and '_id' not in invoice_data:
            mapped_data['_id'] = try_object_id(invoice_data['id'])
        elif '_id' in invoice_data:
            mapped_data['_id'] = try_object_id(invoice_data['_id'])
            
        result = coll.insert_one(mapped_data)
        doc = coll.find_one({"_id": result.inserted_id})
        return Invoice._map_invoice_doc(doc)

    @staticmethod
    def update(invoice_id, update_data):
        coll = Invoice.get_collection()
        from app.models.utils import try_object_id
        
        mapped_update = {}
        if "status" in update_data or "trangThai" in update_data:
            mapped_update["trangThai"] = update_data.get("status") or update_data.get("trangThai")
        if "paymentMethod" in update_data:
            mapped_update["paymentMethod"] = update_data.get("paymentMethod")
        if "receiptUrl" in update_data:
            mapped_update["receiptUrl"] = update_data.get("receiptUrl")
            
        try:
            res = coll.update_one({"_id": try_object_id(invoice_id)}, {"$set": mapped_update})
            if res.matched_count > 0:
                return Invoice.find_by_id(invoice_id)
        except Exception:
            pass
        coll.update_one({"_id": invoice_id}, {"$set": mapped_update})
        coll.update_one({"id": invoice_id}, {"$set": mapped_update})
        return Invoice.find_by_id(invoice_id)
