from bson import ObjectId
from db import get_db
from app.models.property import Property

class Room:
    @staticmethod
    def get_collection():
        return get_db()["rooms"]

    @staticmethod
    def _map_room_doc(room):
        if not room:
            return room
        # Map database status to frontend status
        status = room.get("trangThai") or room.get("status")
        if status == "empty":
            room["status"] = "vacant"
        elif status == "rented":
            room["status"] = "occupied"
        elif status == "maintenance":
            room["status"] = "paused"
        else:
            room["status"] = status
            
        if "price" not in room and "giaThue" in room:
            room["price"] = room["giaThue"]
        elif "price" not in room and "giaThueHienTai" in room:
            room["price"] = room["giaThueHienTai"]

        # Populate maLoaiPhongId if it's an ObjectId or string ID
        ma_loai_phong_id = room.get("maLoaiPhongId")
        if ma_loai_phong_id and not isinstance(ma_loai_phong_id, dict):
            try:
                db = get_db()
                from app.models.utils import try_object_id
                rt_doc = db["roomtypes"].find_one({"_id": try_object_id(ma_loai_phong_id)})
                if rt_doc:
                    room["maLoaiPhongId"] = rt_doc
            except Exception:
                pass

        # Populate tenant details if occupied
        if room.get("status") == "occupied":
            try:
                db = get_db()
                room_id = room.get("_id") or room.get("id")
                query_room_ids = [room_id]
                if isinstance(room_id, ObjectId):
                    query_room_ids.append(str(room_id))
                elif isinstance(room_id, str) and len(room_id) == 24:
                    try:
                        query_room_ids.append(ObjectId(room_id))
                    except Exception:
                        pass
                
                contract = db["contracts"].find_one({
                    "maPhongId": {"$in": query_room_ids},
                    "trangThai": "active"
                })
                
                if contract:
                    tenant_id = None
                    if contract.get("maKhachThueIds"):
                        tenant_id = contract["maKhachThueIds"][0]
                    
                    if tenant_id:
                        tenant_query_ids = [tenant_id]
                        if isinstance(tenant_id, ObjectId):
                            tenant_query_ids.append(str(tenant_id))
                        elif isinstance(tenant_id, str) and len(tenant_id) == 24:
                            try:
                                tenant_query_ids.append(ObjectId(tenant_id))
                            except Exception:
                                pass
                                
                        tenant = db["users"].find_one({
                            "_id": {"$in": tenant_query_ids}
                        })
                        if tenant:
                            room["tenantName"] = tenant.get("hoTen", "")
                            room["tenantPhone"] = tenant.get("sdt", "")
                            start_date = contract.get("ngayBatDau", "")
                            if start_date:
                                if hasattr(start_date, "isoformat"):
                                    start_date = start_date.isoformat()
                                if "T" in str(start_date):
                                    room["checkInDate"] = str(start_date).split("T")[0]
                                else:
                                    room["checkInDate"] = str(start_date)
            except Exception:
                pass
                
        return room

    @staticmethod
    def find_all(property_id=None, status=None):
        coll = Room.get_collection()
        query = {}
        if property_id:
            from app.models.utils import resolve_property_id
            resolved = resolve_property_id(property_id)
            if resolved:
                query["maNhaTroId"] = {"$in": [resolved, str(resolved)]}
            else:
                query["maNhaTroId"] = property_id
                
        if status:
            db_status = status
            if status == "vacant":
                db_status = "empty"
            elif status == "occupied":
                db_status = "rented"
            elif status == "paused":
                db_status = "maintenance"
            query["trangThai"] = db_status
            
        rooms = list(coll.find(query))
        return [Room._map_room_doc(r) for r in rooms]

    @staticmethod
    def find_by_id(room_id):
        coll = Room.get_collection()
        doc = None
        from app.models.utils import try_object_id
        resolved_id = try_object_id(room_id)
        try:
            doc = coll.find_one({"_id": resolved_id})
        except Exception:
            pass
        if not doc:
            doc = coll.find_one({"_id": room_id})
        if not doc:
            doc = coll.find_one({"id": room_id})
        return Room._map_room_doc(doc)

    @staticmethod
    def search(keyword='', price_min=None, price_max=None, amenities=None, district=None):
        coll = Room.get_collection()
        query = {}
        
        # Filter rooms by district of their parent property
        if district:
            prop_coll = Property.get_collection()
            matching_props = prop_coll.find({"quanHuyen": {"$regex": district, "$options": "i"}})
            prop_ids = []
            for p in matching_props:
                prop_ids.append(str(p["_id"]))
                prop_ids.append(p["_id"])
            query["maNhaTroId"] = {"$in": prop_ids}
            
        # Price filtering (giaThue or giaThueHienTai field in DB)
        price_query = {}
        if price_min is not None:
            price_query["$gte"] = price_min
        if price_max is not None:
            price_query["$lte"] = price_max
            
        if price_query:
            query["$or"] = [
                {"giaThue": price_query},
                {"giaThueHienTai": price_query}
            ]
            
        # Amenities filtering
        if amenities:
            db = get_db()
            matching_rts = db["roomtypes"].find({"tienNghi": {"$all": amenities}})
            rt_ids = [rt["_id"] for rt in matching_rts]
            query["maLoaiPhongId"] = {"$in": rt_ids}
            
        # Keyword search
        if keyword:
            kw_regex = {"$regex": keyword, "$options": "i"}
            query["$or"] = [
                {"maPhong": kw_regex},
                {"soPhong": kw_regex},
                {"moTa": kw_regex}
            ]
            
        rooms = list(coll.find(query))
        return [Room._map_room_doc(r) for r in rooms]

    @staticmethod
    def create(room_data):
        coll = Room.get_collection()
        from app.models.utils import try_object_id
        
        mapped_data = {}
        mapped_data["maNhaTroId"] = try_object_id(room_data.get("propertyId") or room_data.get("maNhaTroId"))
        mapped_data["maLoaiPhongId"] = try_object_id(room_data.get("roomTypeId") or room_data.get("maLoaiPhongId"))
        mapped_data["soPhong"] = room_data.get("roomNumber") or room_data.get("soPhong") or room_data.get("code")
        mapped_data["tang"] = room_data.get("floor") or room_data.get("tang") or 1
        mapped_data["giaThueHienTai"] = room_data.get("price") or room_data.get("giaThueHienTai") or room_data.get("giaThue") or 0
        mapped_data["giaThue"] = room_data.get("price") or room_data.get("giaThue") or room_data.get("giaThueHienTai") or 0
        mapped_data["dienTich"] = room_data.get("area") or room_data.get("dienTich") or 0
        mapped_data["maPhong"] = room_data.get("code") or room_data.get("maPhong")
        mapped_data["trangThai"] = room_data.get("status") or room_data.get("trangThai") or "empty"
        mapped_data["hinhAnh"] = room_data.get("photos") or room_data.get("hinhAnh") or []
        mapped_data["moTa"] = room_data.get("description") or room_data.get("moTa")
        
        assets = room_data.get("assets") or room_data.get("taiSan") or []
        mapped_assets = []
        for asset in assets:
            mapped_assets.append({
                "tenTaiSan": asset.get("name") or asset.get("tenTaiSan"),
                "giaTri": asset.get("value") or asset.get("giaTri") or 0,
                "tinhTrang": asset.get("condition") or asset.get("tinhTrang") or "Tốt"
            })
        mapped_data["taiSan"] = mapped_assets
        
        if 'id' in room_data and '_id' not in room_data:
            mapped_data['_id'] = try_object_id(room_data['id'])
        elif '_id' in room_data:
            mapped_data['_id'] = try_object_id(room_data['_id'])
            
        result = coll.insert_one(mapped_data)
        doc = coll.find_one({"_id": result.inserted_id})
        return Room._map_room_doc(doc)
