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
            query["userId"] = user_id
        return list(coll.find(query))

    @staticmethod
    def create(notification_data):
        coll = Notification.get_collection()
        if 'id' in notification_data and '_id' not in notification_data:
            notification_data['_id'] = notification_data['id']
        result = coll.insert_one(notification_data)
        return coll.find_one({"_id": result.inserted_id})
