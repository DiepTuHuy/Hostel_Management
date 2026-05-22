from bson import ObjectId
from db import get_db
import bcrypt

class User:
    @staticmethod
    def get_collection():
        return get_db()["users"]

    @staticmethod
    def find_by_email(email):
        return User.get_collection().find_one({"email": email.lower()})

    @staticmethod
    def find_by_id(user_id):
        coll = User.get_collection()
        # Try finding by ObjectId first
        try:
            doc = coll.find_one({"_id": ObjectId(user_id)})
            if doc:
                return doc
        except Exception:
            pass
        # Fallback to string id (for seeded mock data)
        doc = coll.find_one({"_id": user_id})
        if doc:
            return doc
        return coll.find_one({"id": user_id})

    @staticmethod
    def create(user_data):
        coll = User.get_collection()
        # Hash password if plaintext is provided
        password = user_data.get("password")
        if password and not password.startswith("$2b$"):  # Avoid re-hashing already hashed password in seeds
            salt = bcrypt.gensalt(10)
            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
            user_data["password"] = hashed_pw
            
        user_data["email"] = user_data.get("email", "").lower()
        user_data.setdefault("role", "tenant")
        user_data.setdefault("status", "active")
        user_data.setdefault("propertyIds", [])
        
        if 'id' in user_data and '_id' not in user_data:
            user_data['_id'] = user_data['id']
            
        result = coll.insert_one(user_data)
        return coll.find_one({"_id": result.inserted_id})

    @staticmethod
    def find_all(role=None):
        coll = User.get_collection()
        query = {}
        if role:
            query["role"] = role
        return list(coll.find(query))
