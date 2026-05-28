from bson import ObjectId
from db import get_db

class Contract:
    @staticmethod
    def get_collection():
        return get_db()["contracts"]

    @staticmethod
    def _map_contract_doc(c):
        if not c:
            return c
        db = get_db()
        from app.models.utils import try_object_id
        
        # Populate maPhongId (Room)
        ma_phong_id = c.get("maPhongId")
        if ma_phong_id and not isinstance(ma_phong_id, dict):
            try:
                room_doc = db["rooms"].find_one({"_id": try_object_id(ma_phong_id)})
                if room_doc:
                    ma_loai_phong_id = room_doc.get("maLoaiPhongId")
                    if ma_loai_phong_id and not isinstance(ma_loai_phong_id, dict):
                        rt_doc = db["roomtypes"].find_one({"_id": try_object_id(ma_loai_phong_id)})
                        if rt_doc:
                            room_doc["maLoaiPhongId"] = rt_doc
                    c["maPhongId"] = room_doc
            except Exception:
                pass
                
        # Populate maKhachThueIds (Users)
        ma_khach_thue_ids = c.get("maKhachThueIds") or []
        if ma_khach_thue_ids:
            populated_tenants = []
            for tid in ma_khach_thue_ids:
                if not isinstance(tid, dict):
                    try:
                        u_doc = db["users"].find_one({"_id": try_object_id(tid)})
                        if u_doc:
                            populated_tenants.append(u_doc)
                        else:
                            populated_tenants.append({"_id": tid})
                    except Exception:
                        populated_tenants.append({"_id": tid})
                else:
                    populated_tenants.append(tid)
            c["maKhachThueIds"] = populated_tenants
            
        return c

    @staticmethod
    def find_all(property_id=None, tenant_id=None, status=None):
        coll = Contract.get_collection()
        query = {}
        if property_id:
            from app.models.utils import resolve_property_id
            resolved_prop = resolve_property_id(property_id)
            if resolved_prop:
                db = get_db()
                rooms = list(db["rooms"].find({"maNhaTroId": resolved_prop}))
                room_ids = [r["_id"] for r in rooms]
                query["maPhongId"] = {"$in": room_ids}
                
        if tenant_id:
            from app.models.utils import try_object_id
            resolved_tenant = try_object_id(tenant_id)
            tenant_vals = [resolved_tenant, str(resolved_tenant)]
            query["maKhachThueIds"] = {"$in": tenant_vals}
            
        if status:
            query["trangThai"] = status
            
        results = list(coll.find(query))
        return [Contract._map_contract_doc(c) for c in results]

    @staticmethod
    def find_by_id(contract_id):
        coll = Contract.get_collection()
        doc = None
        from app.models.utils import try_object_id
        resolved_id = try_object_id(contract_id)
        try:
            doc = coll.find_one({"_id": resolved_id})
        except Exception:
            pass
        if not doc:
            doc = coll.find_one({"_id": contract_id})
        if not doc:
            doc = coll.find_one({"id": contract_id})
        return Contract._map_contract_doc(doc)

    @staticmethod
    def create(contract_data):
        coll = Contract.get_collection()
        from app.models.utils import try_object_id
        
        mapped_data = {}
        mapped_data["maPhongId"] = try_object_id(contract_data.get("roomId") or contract_data.get("maPhongId"))
        
        tenants = contract_data.get("tenantIds") or contract_data.get("maKhachThueIds") or []
        if contract_data.get("tenantId"):
            tenants.append(contract_data.get("tenantId"))
            
        unique_tenants = []
        for t in tenants:
            o_id = try_object_id(t)
            if o_id not in unique_tenants:
                unique_tenants.append(o_id)
        mapped_data["maKhachThueIds"] = unique_tenants
        
        from datetime import datetime
        start_date = contract_data.get("startDate") or contract_data.get("ngayBatDau")
        if isinstance(start_date, str):
            try:
                start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            except Exception:
                pass
        mapped_data["ngayBatDau"] = start_date
        
        end_date = contract_data.get("endDate") or contract_data.get("ngayKetThuc")
        if isinstance(end_date, str):
            try:
                end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            except Exception:
                pass
        mapped_data["ngayKetThuc"] = end_date
        
        mapped_data["tienCoc"] = contract_data.get("deposit") or contract_data.get("tienCoc") or 0
        mapped_data["trangThai"] = contract_data.get("status") or contract_data.get("trangThai") or "draft"
        mapped_data["duongDanPdf"] = contract_data.get("pdfUrl") or contract_data.get("duongDanPdf")
        
        if 'id' in contract_data and '_id' not in contract_data:
            mapped_data['_id'] = try_object_id(contract_data['id'])
        elif '_id' in contract_data:
            mapped_data['_id'] = try_object_id(contract_data['_id'])
            
        result = coll.insert_one(mapped_data)
        doc = coll.find_one({"_id": result.inserted_id})
        return Contract._map_contract_doc(doc)
