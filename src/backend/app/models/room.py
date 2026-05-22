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
        status = room.get("status")
        if status == "empty":
            room["status"] = "vacant"
        elif status == "rented":
            room["status"] = "occupied"
        elif status == "maintenance":
            room["status"] = "paused"
            
        if "price" not in room and "currentPrice" in room:
            room["price"] = room["currentPrice"]

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
                    "roomId": {"$in": query_room_ids},
                    "status": "active"
                })
                
                if contract:
                    tenant_id = contract.get("tenantId")
                    if not tenant_id and contract.get("tenantIds"):
                        tenant_id = contract["tenantIds"][0]
                    
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
                            room["tenantName"] = tenant.get("fullName", "")
                            room["tenantPhone"] = tenant.get("phone", "")
                            start_date = contract.get("startDate", "")
                            if start_date:
                                if "T" in start_date:
                                    room["checkInDate"] = start_date.split("T")[0]
                                else:
                                    room["checkInDate"] = start_date
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
                query["propertyId"] = {"$in": [resolved, str(resolved)]}
            else:
                query["propertyId"] = property_id
                
        if status:
            db_status = status
            if status == "vacant":
                db_status = "empty"
            elif status == "occupied":
                db_status = "rented"
            elif status == "paused":
                db_status = "maintenance"
            query["status"] = db_status
            
        rooms = list(coll.find(query))
        return [Room._map_room_doc(r) for r in rooms]

    @staticmethod
    def find_by_id(room_id):
        coll = Room.get_collection()
        doc = None
        try:
            doc = coll.find_one({"_id": ObjectId(room_id)})
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
            matching_props = prop_coll.find({"district": {"$regex": district, "$options": "i"}})
            prop_ids = []
            for p in matching_props:
                prop_ids.append(str(p["_id"]))
                prop_ids.append(p["_id"])
            query["propertyId"] = {"$in": prop_ids}
            
        # Price filtering (price or currentPrice field)
        price_query = {}
        if price_min is not None:
            price_query["$gte"] = price_min
        if price_max is not None:
            price_query["$lte"] = price_max
            
        if price_query:
            query["$or"] = [
                {"price": price_query},
                {"currentPrice": price_query}
            ]
            
        # Amenities filtering
        if amenities:
            query["amenities"] = {"$all": amenities}
            
        # Keyword search
        if keyword:
            kw_regex = {"$regex": keyword, "$options": "i"}
            query["$or"] = [
                {"code": kw_regex},
                {"roomNumber": kw_regex},
                {"description": kw_regex}
            ]
            
        rooms = list(coll.find(query))
        return [Room._map_room_doc(r) for r in rooms]

    @staticmethod
    def create(room_data):
        coll = Room.get_collection()
        if 'id' in room_data and '_id' not in room_data:
            room_data['_id'] = room_data['id']
        result = coll.insert_one(room_data)
        doc = coll.find_one({"_id": result.inserted_id})
        return Room._map_room_doc(doc)
