from bson import ObjectId
from db import get_db

class Property:
    @staticmethod
    def get_collection():
        return get_db()["properties"]

    @staticmethod
    def find_all():
        coll = Property.get_collection()
        return list(coll.find({}))

    @staticmethod
    def find_by_id(property_id):
        coll = Property.get_collection()
        try:
            doc = coll.find_one({"_id": ObjectId(property_id)})
            if doc:
                return doc
        except Exception:
            pass
        doc = coll.find_one({"_id": property_id})
        if doc:
            return doc
        return coll.find_one({"id": property_id})

    @staticmethod
    def create(property_data):
        coll = Property.get_collection()
        from app.models.utils import try_object_id
        
        mapped_data = {}
        mapped_data["maNhaTro"] = property_data.get("code") or property_data.get("maNhaTro")
        mapped_data["tenNhaTro"] = property_data.get("name") or property_data.get("tenNhaTro")
        mapped_data["diaChi"] = property_data.get("address") or property_data.get("diaChi")
        mapped_data["quanHuyen"] = property_data.get("district") or property_data.get("quanHuyen")
        mapped_data["thanhPho"] = property_data.get("city") or property_data.get("thanhPho") or 'TP. Hồ Chí Minh'
        mapped_data["hinhAnh"] = property_data.get("image") or property_data.get("hinhAnh")
        mapped_data["tongSoPhong"] = property_data.get("totalRooms") or property_data.get("tongSoPhong") or 0
        mapped_data["soPhongDaThue"] = property_data.get("occupiedRooms") or property_data.get("soPhongDaThue") or 0
        
        manager_ids = property_data.get("managerIds") or property_data.get("maQuanLyIds") or []
        mapped_data["maQuanLyIds"] = [try_object_id(m) for m in manager_ids]
        mapped_data["maChuTroId"] = try_object_id(property_data.get("ownerId") or property_data.get("maChuTroId"))
        mapped_data["trangThai"] = property_data.get("status") or property_data.get("trangThai") or "active"
        
        if 'id' in property_data and '_id' not in property_data:
            mapped_data['_id'] = try_object_id(property_data['id'])
        elif '_id' in property_data:
            mapped_data['_id'] = try_object_id(property_data['_id'])
            
        result = coll.insert_one(mapped_data)
        return coll.find_one({"_id": result.inserted_id})
