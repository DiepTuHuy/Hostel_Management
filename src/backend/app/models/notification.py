from bson import ObjectId
from db import get_db

class Notification:
    @staticmethod
    def get_collection():
        return get_db()["notifications"]

    @staticmethod
    def find_all(user_id=None):
        coll = Notification.get_collection()
        query = {}
        if user_id:
            from app.models.utils import try_object_id
            query["maNguoiDungId"] = try_object_id(user_id)
        return list(coll.find(query))

    @staticmethod
    def create(notification_data):
        coll = Notification.get_collection()
        from app.models.utils import try_object_id
        
        mapped_data = {}
        mapped_data["maNguoiDungId"] = try_object_id(notification_data.get("userId") or notification_data.get("maNguoiDungId"))
        mapped_data["tieuDe"] = notification_data.get("title") or notification_data.get("tieuDe")
        mapped_data["noiDung"] = notification_data.get("body") or notification_data.get("content") or notification_data.get("noiDung")
        mapped_data["kenh"] = notification_data.get("channel") or notification_data.get("kenh") or "push"
        mapped_data["daDoc"] = notification_data.get("read") or notification_data.get("isRead") or notification_data.get("daDoc") or False
        
        if 'id' in notification_data and '_id' not in notification_data:
            mapped_data['_id'] = try_object_id(notification_data['id'])
        elif '_id' in notification_data:
            mapped_data['_id'] = try_object_id(notification_data['_id'])
            
        result = coll.insert_one(mapped_data)
        return coll.find_one({"_id": result.inserted_id})
