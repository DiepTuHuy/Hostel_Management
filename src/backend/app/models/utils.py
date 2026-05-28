from bson import ObjectId
from datetime import datetime

def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    doc = dict(doc)
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
        
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, datetime):
            doc[k] = v.isoformat()
        elif isinstance(v, list):
            new_list = []
            for item in v:
                if isinstance(item, ObjectId):
                    new_list.append(str(item))
                elif isinstance(item, dict):
                    new_list.append(serialize_doc(item))
                else:
                    new_list.append(item)
            doc[k] = new_list
        elif isinstance(v, dict):
            doc[k] = serialize_doc(v)
            
    return doc

def try_object_id(val):
    if not val:
        return val
    from bson import ObjectId
    try:
        if isinstance(val, ObjectId):
            return val
        if len(str(val)) == 24:
            return ObjectId(val)
    except Exception:
        pass
    return val

def resolve_property_id(property_id):
    if not property_id:
        return None
        
    from bson import ObjectId
    from db import get_db
    
    # 1. Try converting to ObjectId
    try:
        if isinstance(property_id, ObjectId):
            return property_id
        if len(str(property_id)) == 24:
            return ObjectId(property_id)
    except Exception:
        pass
        
    # 2. Lookup property database
    db = get_db()
    try:
        doc = db["properties"].find_one({"_id": property_id})
        if doc:
            return doc["_id"]
        doc = db["properties"].find_one({"id": property_id})
        if doc:
            return doc["_id"]
            
        primary = db["properties"].find_one({"maNhaTro": "NT-Q1-01"})
        if primary:
            return primary["_id"]
            
        first = db["properties"].find_one({})
        if first:
            return first["_id"]
    except Exception:
        pass
        
    return property_id

def map_user(u):
    if not u:
        return None
    return {
        "id": str(u.get("_id")) if "_id" in u else u.get("id"),
        "fullName": u.get("hoTen"),
        "email": u.get("email"),
        "phone": u.get("sdt"),
        "role": u.get("vaiTro"),
        "avatar": u.get("avatar") or None,
        "status": u.get("trangThai"),
        "propertyIds": [str(p) for p in u.get("maNhaTroIds", [])] if u.get("maNhaTroIds") else [],
        "createdAt": u.get("createdAt").isoformat() if hasattr(u.get("createdAt"), "isoformat") else u.get("createdAt")
    }

def map_property(p):
    if not p:
        return None
    
    manager_ids = p.get("maQuanLyIds", [])
    managers = []
    for m in manager_ids:
        if isinstance(m, dict):
            managers.append(map_user(m))
        else:
            managers.append(str(m))

    return {
        "id": str(p.get("_id")) if "_id" in p else p.get("id"),
        "code": p.get("maNhaTro"),
        "name": p.get("tenNhaTro"),
        "address": p.get("diaChi"),
        "district": p.get("quanHuyen"),
        "city": p.get("thanhPho"),
        "image": p.get("hinhAnh"),
        "totalRooms": p.get("tongSoPhong", 0),
        "occupiedRooms": p.get("soPhongDaThue", 0),
        "managerIds": managers,
        "ownerId": str(p.get("maChuTroId")) if p.get("maChuTroId") else None,
        "status": p.get("trangThai")
    }

def map_room(r):
    if not r:
        return None
    room_type = r.get("maLoaiPhongId") or {}
    if not isinstance(room_type, dict):
        room_type = {}
        
    ten_loai = room_type.get("tenLoai", "")
    r_type = "private"
    if ten_loai:
        name_lower = ten_loai.lower()
        if any(w in name_lower for w in ["studio", "đôi", "vip", "penthouse", "cao cấp"]):
            r_type = "studio"
        elif any(w in name_lower for w in ["ký túc xá", "shared", "ghép"]):
            r_type = "shared"

    return {
        "id": str(r.get("_id")) if "_id" in r else r.get("id"),
        "code": r.get("soPhong") or r.get("maPhong"),
        "propertyId": str(r.get("maNhaTroId")) if r.get("maNhaTroId") else None,
        "floor": r.get("tang"),
        "type": r_type,
        "area": r.get("dienTich") or room_type.get("dienTich") or 0,
        "price": r.get("giaThue") or r.get("giaThueHienTai") or room_type.get("giaCoBan") or 0,
        "amenities": room_type.get("tienNghi") or [],
        "status": r.get("trangThai"),
        "currentTenantId": str(r.get("currentTenantId")) if r.get("currentTenantId") else None,
        "photos": r.get("hinhAnh") or [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"
        ],
        "description": r.get("moTa") or f"Phòng sạch sẽ, thoáng mát tại {ten_loai or 'nhà trọ'}. Đầy đủ tiện nghi cơ bản.",
        "roomNumber": r.get("soPhong"),
        "roomTypeId": str(room_type.get("_id")) if "_id" in room_type else (str(r.get("maLoaiPhongId")) if r.get("maLoaiPhongId") else None),
        "tenantName": r.get("tenantName"),
        "tenantPhone": r.get("tenantPhone"),
        "checkInDate": r.get("checkInDate")
    }

def map_contract(c):
    if not c:
        return None
    
    room = c.get("maPhongId") or {}
    tenant = (c.get("maKhachThueIds") or [{}])[0] if isinstance(c.get("maKhachThueIds"), list) and len(c.get("maKhachThueIds", [])) > 0 else {}
    
    room_id_str = str(room.get("_id")) if isinstance(room, dict) and "_id" in room else (str(c.get("maPhongId")) if c.get("maPhongId") else None)
    tenant_id_str = str(tenant.get("_id")) if isinstance(tenant, dict) and "_id" in tenant else (str(c.get("maKhachThueIds")[0]) if isinstance(c.get("maKhachThueIds"), list) and len(c.get("maKhachThueIds", [])) > 0 else None)
    
    property_id_str = str(room.get("maNhaTroId")) if isinstance(room, dict) and room.get("maNhaTroId") else None
    room_number_str = room.get("soPhong") or room.get("maPhong") or room_id_str
    tenant_name_str = tenant.get("hoTen") or tenant_id_str

    return {
        "id": str(c.get("_id")) if "_id" in c else c.get("id"),
        "code": c.get("code") or f"HD-{str(c.get('_id'))[18:].upper()}" if "_id" in c else None,
        "propertyId": property_id_str,
        "roomId": room_number_str,
        "tenantId": tenant_name_str,
        "tenantIds": [str(t_id) for t_id in c.get("maKhachThueIds", [])] if isinstance(c.get("maKhachThueIds"), list) else [],
        "startDate": c.get("ngayBatDau").isoformat() if hasattr(c.get("ngayBatDau"), "isoformat") else c.get("ngayBatDau"),
        "endDate": c.get("ngayKetThuc").isoformat() if hasattr(c.get("ngayKetThuc"), "isoformat") else c.get("ngayKetThuc"),
        "deposit": c.get("tienCoc"),
        "monthlyRent": room.get("giaThue") or room.get("giaThueHienTai") or 3500000 if isinstance(room, dict) else 3500000,
        "services": [
            { "name": "Điện", "price": 3500, "unit": "kWh" },
            { "name": "Nước", "price": 15000, "unit": "m3" },
            { "name": "Internet", "price": 100000, "unit": "phòng" }
        ],
        "status": c.get("trangThai"),
        "pdfUrl": c.get("duongDanPdf") or None,
        "createdAt": c.get("createdAt").isoformat() if hasattr(c.get("createdAt"), "isoformat") else c.get("createdAt")
    }

def map_invoice(inv):
    if not inv:
        return None
        
    room = inv.get("maPhongId") or {}
    contract = inv.get("maHopDongId") or {}
    tenant = (contract.get("maKhachThueIds") or [{}])[0] if isinstance(contract, dict) and isinstance(contract.get("maKhachThueIds"), list) and len(contract.get("maKhachThueIds", [])) > 0 else {}
    
    room_id_str = str(room.get("_id")) if isinstance(room, dict) and "_id" in room else (str(inv.get("maPhongId")) if inv.get("maPhongId") else None)
    contract_id_str = str(contract.get("_id")) if isinstance(contract, dict) and "_id" in contract else (str(inv.get("maHopDongId")) if inv.get("maHopDongId") else None)
    tenant_name_str = tenant.get("hoTen") or (str(tenant.get("_id")) if "_id" in tenant else None)

    return {
        "id": str(inv.get("_id")) if "_id" in inv else inv.get("id"),
        "code": inv.get("code") or f"HD-{str(inv.get('_id'))[18:].upper()}" if "_id" in inv else None,
        "contractId": contract_id_str,
        "propertyId": str(room.get("maNhaTroId")) if isinstance(room, dict) and room.get("maNhaTroId") else None,
        "roomId": room.get("soPhong") or room.get("maPhong") or room_id_str,
        "tenantId": tenant_name_str,
        "period": inv.get("kyThanhToan"),
        "dueDate": inv.get("hanThanhToan").isoformat() if hasattr(inv.get("hanThanhToan"), "isoformat") else inv.get("hanThanhToan"),
        "deadline": inv.get("hanThanhToan").isoformat() if hasattr(inv.get("hanThanhToan"), "isoformat") else inv.get("hanThanhToan"),
        "items": [
            {
                "name": d.get("tenDichVu"),
                "qty": d.get("soLuong", 1),
                "unit": d.get("donVi", "phần"),
                "price": d.get("donGia"),
                "total": d.get("thanhTien") or (d.get("donGia", 0) * d.get("soLuong", 1))
            } for d in inv.get("chiTiet", [])
        ],
        "details": [
            {
                "name": d.get("tenDichVu"),
                "quantity": d.get("soLuong"),
                "price": d.get("donGia"),
                "amount": d.get("thanhTien")
            } for d in inv.get("chiTiet", [])
        ],
        "subtotal": inv.get("tongTien"),
        "total": inv.get("tongTien"),
        "totalAmount": inv.get("tongTien"),
        "status": inv.get("trangThai"),
        "paidAt": inv.get("updatedAt").isoformat() if hasattr(inv.get("updatedAt"), "isoformat") else inv.get("updatedAt"),
        "paymentMethod": inv.get("paymentMethod") or None,
        "receiptUrl": inv.get("receiptUrl") or None,
        "meterReadings": inv.get("meterReadings") or None
    }

def map_notification(n):
    if not n:
        return None
    return {
        "id": str(n.get("_id")) if "_id" in n else n.get("id"),
        "userId": str(n.get("maNguoiDungId")) if n.get("maNguoiDungId") else None,
        "title": n.get("tieuDe"),
        "body": n.get("noiDung"),
        "content": n.get("noiDung"),
        "channel": n.get("kenh"),
        "read": n.get("daDoc", False),
        "isRead": n.get("daDoc", False),
        "createdAt": n.get("createdAt").isoformat() if hasattr(n.get("createdAt"), "isoformat") else n.get("createdAt")
    }
