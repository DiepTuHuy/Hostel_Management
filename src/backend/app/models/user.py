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
        from app.models.utils import try_object_id
        resolved_id = try_object_id(user_id)
        try:
            doc = coll.find_one({"_id": resolved_id})
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
        from app.models.utils import try_object_id
        
        # Map English to Vietnamese fields
        mapped_data = {}
        
        fullname = user_data.get("fullName") or user_data.get("hoTen")
        email = user_data.get("email", "").lower()
        password = user_data.get("password") or user_data.get("matKhau")
        phone = user_data.get("phone") or user_data.get("sdt")
        role = user_data.get("role") or user_data.get("vaiTro") or "tenant"
        status = user_data.get("status") or user_data.get("trangThai") or "active"
        prop_ids = user_data.get("propertyIds") or user_data.get("maNhaTroIds") or []
        
        mapped_prop_ids = []
        for pid in prop_ids:
            mapped_prop_ids.append(try_object_id(pid))
            
        tp = user_data.get("tenantProfile") or user_data.get("thongTinKhachThue")
        mapped_tp = None
        if tp:
            mapped_tp = {
                "cccd": tp.get("cccd"),
                "ngheNghiep": tp.get("occupation") or tp.get("ngheNghiep"),
                "diaChiThuongTru": tp.get("permanentAddress") or tp.get("diaChiThuongTru")
            }
            
        mapped_data["hoTen"] = fullname
        mapped_data["email"] = email
        mapped_data["sdt"] = phone
        mapped_data["vaiTro"] = role
        mapped_data["trangThai"] = status
        mapped_data["maNhaTroIds"] = mapped_prop_ids
        if mapped_tp:
            mapped_data["thongTinKhachThue"] = mapped_tp
            
        # Hash password if plaintext is provided
        if password and not password.startswith("$2b$"):  # Avoid re-hashing already hashed password
            salt = bcrypt.gensalt(10)
            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
            mapped_data["matKhau"] = hashed_pw
        elif password:
            mapped_data["matKhau"] = password

        if 'id' in user_data and '_id' not in user_data:
            mapped_data['_id'] = try_object_id(user_data['id'])
        elif '_id' in user_data:
            mapped_data['_id'] = try_object_id(user_data['_id'])
            
        result = coll.insert_one(mapped_data)
        return coll.find_one({"_id": result.inserted_id})

    @staticmethod
    def find_all(role=None):
        coll = User.get_collection()
        query = {}
        if role:
            query["vaiTro"] = role
        return list(coll.find(query))
