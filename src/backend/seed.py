import os
import datetime
import bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables first
load_dotenv()

HCMC_DISTRICTS_DATA = [
    { "name": "Quận 1", "code": "Q1", "streets": ["Nguyễn Huệ", "Lê Lợi", "Nguyễn Du", "Trần Hưng Đạo", "Bùi Viện", "Nguyễn Cư Trinh", "Mạc Đĩnh Chi", "Lê Thánh Tôn"] },
    { "name": "Quận 3", "code": "Q3", "streets": ["Võ Văn Tần", "Cách Mạng Tháng 8", "Điện Biên Phủ", "Nam Kỳ Khởi Nghĩa", "Lê Văn Sỹ", "Nguyễn Đình Chiểu", "Trần Quốc Thảo"] },
    { "name": "Quận 4", "code": "Q4", "streets": ["Hoàng Diệu", "Khánh Hội", "Bến Vân Đồn", "Tôn Đản", "Đoàn Văn Bơ", "Vĩnh Hội"] },
    { "name": "Quận 5", "code": "Q5", "streets": ["Trần Hưng Đạo", "An Dương Vương", "Nguyễn Trãi", "Hồng Bàng", "Lão Tử", "Hải Thượng Lãn Ông"] },
    { "name": "Quận 6", "code": "Q6", "streets": ["Hậu Giang", "Bình Phú", "Lê Quang Sung", "Minh Phụng", "An Dương Vương", "Kinh Dương Vương"] },
    { "name": "Quận 7", "code": "Q7", "streets": ["Nguyễn Văn Linh", "Huỳnh Tấn Phát", "Nguyễn Thị Thập", "Lâm Văn Bền", "Trần Xuân Soạn", "Lê Văn Lương"] },
    { "name": "Quận 8", "code": "Q8", "streets": ["Phạm Thế Hiển", "Tạ Quang Bửu", "Hưng Phú", "Dương Bá Trạc", "Cao Lỗ", "Liên Tỉnh 5"] },
    { "name": "Quận 10", "code": "Q10", "streets": ["Ba Tháng Hai", "Tô Hiến Thành", "Sư Vạn Hạnh", "Lý Thường Kiệt", "Thất Sơn", "Ngô Gia Tự", "Vĩnh Viễn"] },
    { "name": "Quận 11", "code": "Q11", "streets": ["Lãnh Binh Thăng", "Lê Đại Hành", "Hòa Bình", "Minh Phụng", "Đội Cung", "Tôn Thất Hiệp"] },
    { "name": "Quận 12", "code": "Q12", "streets": ["Trường Chinh", "Tô Ký", "Phan Văn Hớn", "Hà Huy Giáp", "Nguyễn Ảnh Thủ", "Lê Văn Khương"] },
    { "name": "Quận Bình Tân", "code": "BTan", "streets": ["Tên Lửa", "Kinh Dương Vương", "Mã Lò", "Lê Văn Quới", "Hồ Học Lãm", "Tỉnh Lộ 10"] },
    { "name": "Quận Bình Thạnh", "code": "BThanh", "streets": ["Xô Viết Nghệ Tĩnh", "Điện Biên Phủ", "Bạch Đằng", "Lê Quang Định", "Nơ Trang Long", "Phan Văn Trị", "D2"] },
    { "name": "Quận Gò Vấp", "code": "GV", "streets": ["Quang Trung", "Nguyễn Oanh", "Phan Văn Trị", "Lê Đức Thọ", "Phạm Văn Chiêu", "Thống Nhất"] },
    { "name": "Quận Phú Nhuận", "code": "PN", "streets": ["Phan Xích Long", "Nguyễn Văn Trỗi", "Huỳnh Văn Bánh", "Lê Văn Sỹ", "Thích Quảng Đức", "Phan Đăng Lưu"] },
    { "name": "Quận Tân Bình", "code": "TB", "streets": ["Cộng Hòa", "Trường Chinh", "Hoàng Văn Thụ", "Út Tịch", "Phổ Quang", "Bạch Đằng", "Âu Cơ"] },
    { "name": "Quận Tân Phú", "code": "TP", "streets": ["Lũy Bán Bích", "Tân Sơn Nhì", "Độc Lập", "Hòa Bình", "Thoại Ngọc Hầu", "Tây Thạnh"] },
    { "name": "Thành phố Thủ Đức", "code": "TD", "streets": ["Võ Văn Ngân", "Xa Lộ Hà Nội", "Lê Văn Việt", "Kha Vạn Cân", "Đỗ Xuân Hợp", "Phạm Văn Đồng", "Hiệp Bình"] },
    { "name": "Huyện Bình Chánh", "code": "BChanh", "streets": ["Quốc Lộ 1A", "Nguyễn Văn Linh", "Trần Đại Nghĩa", "Trung Sơn", "Phạm Hùng"] },
    { "name": "Huyện Cần Giờ", "code": "CG", "streets": ["Duyên Hải", "Rừng Sác", "Tắc Xuất", "Thạnh Thới"] },
    { "name": "Huyện Củ Chi", "code": "CC", "streets": ["Tỉnh Lộ 8", "Quốc Lộ 22", "Nguyễn Văn Khạ", "Liêu Bình Hương"] },
    { "name": "Huyện Hóc Môn", "code": "HM", "streets": ["Tô Ký", "Lý Thường Kiệt", "Quốc Lộ 22", "Nguyễn Ảnh Thủ", "Lê Thị Hà"] },
    { "name": "Huyện Nhà Bè", "code": "NB", "streets": ["Huỳnh Tấn Phát", "Nguyễn Hữu Thọ", "Lê Văn Lương", "Phạm Hữu Lầu"] }
]

mockUsers = [
    {
        "fullName": "Nguyễn Văn An",
        "email": "admin@boardinghouse.vn",
        "password": "admin",
        "phone": "0901111111",
        "role": "admin",
        "status": "active"
    },
    {
        "fullName": "Trần Thị Bích",
        "email": "manager.q1@boardinghouse.vn",
        "password": "manager",
        "phone": "0902222222",
        "role": "manager",
        "status": "active"
    },
    {
        "fullName": "Lê Hoàng Cường",
        "email": "manager.q3@boardinghouse.vn",
        "password": "manager",
        "phone": "0903333333",
        "role": "manager",
        "status": "active"
    },
    {
        "fullName": "Phạm Minh Đức",
        "email": "duc.pm@gmail.com",
        "password": "tenant",
        "phone": "0904444444",
        "role": "tenant",
        "status": "active",
        "tenantProfile": {
            "cccd": "079096001234",
            "occupation": "Lập trình viên",
            "permanentAddress": "123 Đường 3/2, Quận 10, TP.HCM"
        }
    },
    {
        "fullName": "Hoàng Thuỳ Linh",
        "email": "linh.ht@gmail.com",
        "password": "tenant",
        "phone": "0905555555",
        "role": "tenant",
        "status": "active",
        "tenantProfile": {
            "cccd": "079096005678",
            "occupation": "Sinh viên",
            "permanentAddress": "456 Lê Lợi, TP. Huế"
        }
    },
    {
        "fullName": "Vũ Quang Huy",
        "email": "huy.vq@gmail.com",
        "password": "tenant",
        "phone": "0906666666",
        "role": "tenant",
        "status": "active",
        "tenantProfile": {
            "cccd": "079096009999",
            "occupation": "Kinh doanh tự do",
            "permanentAddress": "789 Quốc Lộ 1A, Biên Hòa, Đồng Nai"
        }
    }
]

def seed_db_instance(db):
    print("Cleaning existing database collections...")
    db["users"].delete_many({})
    db["properties"].delete_many({})
    db["roomtypes"].delete_many({})
    db["rooms"].delete_many({})
    db["services"].delete_many({})
    db["contracts"].delete_many({})
    db["invoices"].delete_many({})
    db["readings"].delete_many({})
    db["payments"].delete_many({})
    db["notifications"].delete_many({})
    print("Database cleared!")

    # 1. Seed Users (with secure hashing)
    print("Seeding users...")
    seeded_users = []
    for u in mockUsers:
        salt = bcrypt.gensalt(10)
        hashed_password = bcrypt.hashpw(u["password"].encode('utf-8'), salt).decode('utf-8')
        user_data = u.copy()
        user_data["password"] = hashed_password
        user_data["propertyIds"] = []
        
        res = db["users"].insert_one(user_data)
        user_data["_id"] = res.inserted_id
        seeded_users.append(user_data)
        
    print(f"Successfully seeded {len(seeded_users)} users.")

    admin_user = next(u for u in seeded_users if u["role"] == 'admin')
    manager_q1 = next(u for u in seeded_users if u["email"] == 'manager.q1@boardinghouse.vn')
    manager_q3 = next(u for u in seeded_users if u["email"] == 'manager.q3@boardinghouse.vn')
    tenant_1 = next(u for u in seeded_users if u["email"] == 'duc.pm@gmail.com')

    # 2. Seed 220 Properties (10 per district in HCMC)
    print("Seeding 220 hostel facilities (10 per HCMC district)...")
    seeded_properties = []
    branch_counter = 0

    for dist in HCMC_DISTRICTS_DATA:
        for i in range(1, 11):
            branch_counter += 1
            street = dist["streets"][(i - 1) % len(dist["streets"])]
            address_no = i * 15 + (i % 3)
            address = f"{address_no} {street}, Phường {i + 1}"
            code_suffix = f"0{i}" if i < 10 else f"{i}"
            code = f"NT-{dist['code']}-{code_suffix}"
            name = f"Nhà trọ {dist['name']} — Cơ sở {code_suffix}"
            
            # Randomly assign managers to some branches
            assigned_managers = []
            if dist["code"] == 'Q1' and i == 1:
                assigned_managers = [manager_q1["_id"]]
            elif dist["code"] == 'Q3' and i == 1:
                assigned_managers = [manager_q3["_id"]]

            prop_data = {
                "code": code,
                "name": name,
                "address": address,
                "district": dist["name"],
                "city": "TP. Hồ Chí Minh",
                "image": f"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&sig={branch_counter}",
                "totalRooms": 20,
                "occupiedRooms": 1 if (dist["code"] == 'Q1' and i == 1) else 0,
                "managerIds": assigned_managers,
                "ownerId": admin_user["_id"],
                "status": "active"
            }
            
            res = db["properties"].insert_one(prop_data)
            prop_data["_id"] = res.inserted_id
            
            # Link manager properties back
            if dist["code"] == 'Q1' and i == 1:
                db["users"].update_one({"_id": manager_q1["_id"]}, {"$push": {"propertyIds": prop_data["_id"]}})
            elif dist["code"] == 'Q3' and i == 1:
                db["users"].update_one({"_id": manager_q3["_id"]}, {"$push": {"propertyIds": prop_data["_id"]}})

            seeded_properties.append(prop_data)

    print(f"Successfully seeded {len(seeded_properties)} facilities across HCMC.")

    # 3. Seed Services, Room Types, and Rooms for primary property NT-Q1-01
    primary_prop = next(p for p in seeded_properties if p["code"] == 'NT-Q1-01')
    if primary_prop:
        print(f"Setting up sample rooms and services for primary property: {primary_prop['name']}...")
        
        # Seed default Services
        electric_service = {
            "propertyId": primary_prop["_id"],
            "name": "Điện",
            "unit": "kWh",
            "price": 3500,
            "type": "metered"
        }
        res_e = db["services"].insert_one(electric_service)
        electric_service["_id"] = res_e.inserted_id
        
        water_service = {
            "propertyId": primary_prop["_id"],
            "name": "Nước",
            "unit": "m3",
            "price": 15000,
            "type": "metered"
        }
        res_w = db["services"].insert_one(water_service)
        water_service["_id"] = res_w.inserted_id
        
        internet_service = {
            "propertyId": primary_prop["_id"],
            "name": "Internet",
            "unit": "phòng",
            "price": 100000,
            "type": "fixed"
        }
        res_i = db["services"].insert_one(internet_service)
        internet_service["_id"] = res_i.inserted_id
        
        trash_service = {
            "propertyId": primary_prop["_id"],
            "name": "Vệ sinh",
            "unit": "người",
            "price": 30000,
            "type": "fixed"
        }
        res_t = db["services"].insert_one(trash_service)
        trash_service["_id"] = res_t.inserted_id

        # Seed Room Types
        single_room_type = {
            "propertyId": primary_prop["_id"],
            "name": "Phòng đơn Standard",
            "area": 18,
            "basePrice": 3500000,
            "amenities": ["Máy lạnh", "Gác lửng", "Kệ bếp"]
        }
        res_sr = db["roomtypes"].insert_one(single_room_type)
        single_room_type["_id"] = res_sr.inserted_id

        double_room_type = {
            "propertyId": primary_prop["_id"],
            "name": "Phòng đôi Studio",
            "area": 25,
            "basePrice": 5000000,
            "amenities": ["Máy lạnh", "Tủ lạnh", "Gác lửng", "Tủ quần áo", "Máy giặt chung"]
        }
        res_dr = db["roomtypes"].insert_one(double_room_type)
        double_room_type["_id"] = res_dr.inserted_id

        # Seed 20 Rooms
        seeded_rooms = []
        for floor in range(1, 5):
            for r in range(1, 6):
                room_number = f"{floor}0{r}"
                is_studio = (floor >= 3)
                room_type = double_room_type if is_studio else single_room_type
                status = 'rented' if (floor == 1 and r == 1) else 'empty'
                
                room_obj = {
                    "propertyId": primary_prop["_id"],
                    "roomTypeId": room_type["_id"],
                    "roomNumber": room_number,
                    "floor": floor,
                    "currentPrice": room_type["basePrice"],
                    "price": room_type["basePrice"], # For compatibility with frontend queries
                    "area": room_type["area"],
                    "status": status,
                    "description": f"Phòng {room_number} lầu {floor}",
                    "code": f"NT-Q1-01-{room_number}",
                    "amenities": room_type["amenities"],
                    "assets": [
                        { "name": "Máy lạnh Daikin", "value": 8000000, "condition": "Tốt" },
                        { "name": "Công tơ điện tử", "value": 500000, "condition": "Tốt" }
                    ]
                }
                res_room = db["rooms"].insert_one(room_obj)
                room_obj["_id"] = res_room.inserted_id
                seeded_rooms.append(room_obj)
                
        print(f"Seeded {len(seeded_rooms)} rooms for {primary_prop['name']}.")

        # 4. Create Contract, Readings, Invoice and Payment for the rented room (Room 101)
        rented_room = next(r for r in seeded_rooms if r["roomNumber"] == '101')
        if rented_room and tenant_1:
            print("Setting up active contract, meter reading, and invoice for Room 101...")
            
            # Active contract
            start_date = datetime.datetime.utcnow() - datetime.timedelta(days=90) # ~3 months ago
            end_date = start_date + datetime.timedelta(days=365) # 1 year lease
            
            contract_obj = {
                "roomId": rented_room["_id"],
                "propertyId": primary_prop["_id"],
                "tenantId": tenant_1["_id"], # Support tenantId as single string/id
                "tenantIds": [tenant_1["_id"]], # Support tenantIds array
                "startDate": start_date.isoformat() + "Z",
                "endDate": end_date.isoformat() + "Z",
                "deposit": rented_room["currentPrice"] * 2,
                "status": "active",
                "fileUrl": "/contracts/NT-Q1-01-101-signed.pdf"
            }
            res_c = db["contracts"].insert_one(contract_obj)
            contract_obj["_id"] = res_c.inserted_id

            # Readings
            reading_period = "2026-05"
            elect_reading = {
                "roomId": rented_room["_id"],
                "serviceId": electric_service["_id"],
                "period": reading_period,
                "oldValue": 1240,
                "newValue": 1390,
                "consumption": 150
            }
            db["readings"].insert_one(elect_reading)

            water_reading = {
                "roomId": rented_room["_id"],
                "serviceId": water_service["_id"],
                "period": reading_period,
                "oldValue": 85,
                "newValue": 95,
                "consumption": 10
            }
            db["readings"].insert_one(water_reading)

            # Generate Invoice
            rent_amount = rented_room["currentPrice"]
            elect_cost = elect_reading["consumption"] * electric_service["price"]
            water_cost = water_reading["consumption"] * water_service["price"]
            internet_cost = internet_service["price"]
            trash_cost = trash_service["price"] * 1 # 1 person
            total_amount = rent_amount + elect_cost + water_cost + internet_cost + trash_cost

            deadline = datetime.datetime.utcnow() + datetime.timedelta(days=5)

            invoice_obj = {
                "contractId": contract_obj["_id"],
                "roomId": rented_room["_id"],
                "propertyId": primary_prop["_id"],
                "tenantId": tenant_1["_id"], # Link directly to tenant
                "period": reading_period,
                "totalAmount": total_amount,
                "deadline": deadline.isoformat() + "Z",
                "status": "pending",
                "details": [
                    { "serviceId": None, "name": f"Tiền phòng tháng {reading_period}", "quantity": 1, "price": rent_amount, "amount": rent_amount },
                    { "serviceId": electric_service["_id"], "name": "Tiền Điện", "quantity": elect_reading["consumption"], "price": electric_service["price"], "amount": elect_cost },
                    { "serviceId": water_service["_id"], "name": "Tiền Nước", "quantity": water_reading["consumption"], "price": water_service["price"], "amount": water_cost },
                    { "serviceId": internet_service["_id"], "name": "Internet", "quantity": 1, "price": internet_service["price"], "amount": internet_cost },
                    { "serviceId": trash_service["_id"], "name": "Phí vệ sinh", "quantity": 1, "price": trash_service["price"], "amount": trash_cost }
                ]
            }
            res_inv = db["invoices"].insert_one(invoice_obj)
            invoice_obj["_id"] = res_inv.inserted_id

            # Notification for invoice
            notif_obj = {
                "userId": tenant_1["_id"],
                "title": "Thông báo hoá đơn tháng 05/2026",
                "content": f"Hoá đơn tiền phòng tháng 05/2026 của phòng 101 là {total_amount:,.0f}đ đã được tạo. Hạn thanh toán: {deadline.strftime('%d/%m/%Y')}.",
                "channel": "push",
                "isRead": False,
                "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
            }
            db["notifications"].insert_one(notif_obj)

            print(f"Seeded contract, readings, and pending invoice (Total: {total_amount:,.0f}đ) for Room 101.")

def seed_database():
    try:
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/boardinghouse_db")
        print(f"Connecting to MongoDB at: {mongo_uri}")
        
        # Connect to database using URI
        if "?" in mongo_uri or "mongodb+srv" in mongo_uri:
            client = MongoClient(mongo_uri)
        else:
            client = MongoClient(mongo_uri)
            
        # Parse db name from URI or default
        db_name = "boardinghouse_db"
        if "/" in mongo_uri:
            parts = mongo_uri.split("/")
            last_part = parts[-1]
            if "?" in last_part:
                last_part = last_part.split("?")[0]
            if last_part:
                db_name = last_part
                
        db = client[db_name]
        print(f"Using database: {db_name}")

        seed_db_instance(db)
        
        print("\nDatabase seeding completed successfully!")
        client.close()
    except Exception as e:
        print(f"Database seeding failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    seed_database()
