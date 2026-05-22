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
        if 'id' in property_data and '_id' not in property_data:
            property_data['_id'] = property_data['id']
        result = coll.insert_one(property_data)
        return coll.find_one({"_id": result.inserted_id})
