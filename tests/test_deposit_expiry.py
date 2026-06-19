import os
import time
import requests
from pymongo import MongoClient
from bson import ObjectId
import dotenv
from datetime import datetime, timedelta

# Load environment variables
env_path = "/Users/dieptuhuy/Documents/System Design/src/backend/.env"
dotenv.load_dotenv(env_path)

MONGO_URI = os.getenv("MONGODB_URI")
BACKEND_URL = "http://localhost:5001"

def main():
    print("=== BẮT ĐẦU KIỂM THỬ TÍNH NĂNG ĐẶT CỌC VÀ HẾT HẠN 24H ===")
    
    # 1. Kết nối DB
    client = MongoClient(MONGO_URI)
    db = client.get_database("boardinghouse_db")
    
    # 2. Tạo một nhà trọ, loại phòng và phòng trống thử nghiệm
    print("\n1. Khởi tạo dữ liệu phòng thử nghiệm...")
    prop_id = ObjectId()
    db.properties.insert_one({
        "_id": prop_id,
        "maNhaTro": "TEST_PROP_DEPOSIT",
        "tenNhaTro": "Nhà trọ test Đặt Cọc",
        "diaChi": "456 Đường Test",
        "quanHuyen": "Quận Gò Vấp",
        "thanhPho": "TP. Hồ Chí Minh",
        "tongSoPhong": 1,
        "soPhongDaThue": 0,
        "trangThai": "active"
    })
    
    rt_id = ObjectId()
    db.roomtypes.insert_one({
        "_id": rt_id,
        "maNhaTroId": prop_id,
        "tenLoai": "Phòng test VIP",
        "dienTich": 25.0,
        "giaCoBan": 4000000,
        "tienNghi": ["Wifi", "Máy lạnh"]
    })
    
    room_id = ObjectId()
    db.rooms.insert_one({
        "_id": room_id,
        "maNhaTroId": prop_id,
        "maLoaiPhongId": rt_id,
        "soPhong": "P999_TEST",
        "tang": 1,
        "giaThueHienTai": 4000000,
        "giaThue": 4000000,
        "dienTich": 25.0,
        "trangThai": "empty"
    })
    print(f"-> Đã tạo phòng trống thử nghiệm ID: {room_id}")

    try:
        # 3. Gửi yêu cầu đặt cọc lần 1 (Thành công)
        print("\n2. Đặt cọc lần 1 cho phòng trống...")
        url = f"{BACKEND_URL}/api/rooms/{room_id}/deposit"
        payload = {
            "fullName": "Nguyễn Văn Test",
            "phone": "0987654321",
            "cccd": "123456789012",
            "depositAmount": 1000000
        }
        res1 = requests.post(url, json=payload)
        print(f"Status code: {res1.status_code}")
        print(f"Response: {res1.text}")
        assert res1.status_code == 200, "Đặt cọc lần 1 thất bại!"
        
        # Kiểm tra DB xem trạng thái đã chuyển sang 'deposit' và có 'depositAt' chưa
        room_db = db.rooms.find_one({"_id": room_id})
        print(f"DB Status: {room_db.get('trangThai')}")
        print(f"DB depositAt: {room_db.get('depositAt')}")
        assert room_db.get("trangThai") == "deposit", "Trạng thái phòng trong DB phải là 'deposit'!"
        assert room_db.get("depositAt") is not None, "Trường depositAt phải tồn tại trong DB!"
        
        # 4. Gửi yêu cầu đặt cọc lần 2 (Bị chặn - 409 Conflict)
        print("\n3. Đặt cọc lần 2 cho phòng đó (Kỳ vọng bị chặn)...")
        payload2 = {
            "fullName": "Trần Thị Trùng",
            "phone": "0912345678",
            "cccd": "987654321098",
            "depositAmount": 1000000
        }
        res2 = requests.post(url, json=payload2)
        print(f"Status code (kỳ vọng 409): {res2.status_code}")
        print(f"Response: {res2.text}")
        assert res2.status_code == 409, "Đặt cọc lần 2 đáng lẽ phải bị chặn (409 Conflict)!"
        
        # 5. Giả lập quá hạn: Chỉnh sửa depositAt trong DB về 25 giờ trước
        print("\n4. Giả lập đặt cọc quá hạn (quay ngược thời gian depositAt về 25 giờ trước)...")
        past_time = datetime.utcnow() - timedelta(hours=25)
        db.rooms.update_one({"_id": room_id}, {"$set": {"depositAt": past_time}})
        
        # 6. Gửi truy vấn lấy chi tiết phòng để trigger giải phóng hết hạn (Lazy Evaluation)
        print("\n5. Gửi GET request lấy chi tiết phòng để kích hoạt tự động giải phóng...")
        get_url = f"{BACKEND_URL}/api/rooms/{room_id}"
        res3 = requests.get(get_url)
        print(f"Status code: {res3.status_code}")
        room_data = res3.json()
        print(f"Phòng lấy từ API có trạng thái: {room_data.get('status')}")
        
        # Kiểm tra DB xem trạng thái đã quay lại 'empty' chưa
        room_db_after = db.rooms.find_one({"_id": room_id})
        print(f"DB Status sau khi tự động giải phóng: {room_db_after.get('trangThai')}")
        print(f"DB depositAt sau khi giải phóng: {room_db_after.get('depositAt')}")
        assert room_db_after.get("trangThai") == "empty", "Trạng thái phòng phải chuyển về 'empty'!"
        assert room_db_after.get("depositAt") is None, "depositAt phải được xóa khi giải phóng!"
        
        # 7. Đặt cọc lại sau khi đã giải phóng (Thành công)
        print("\n6. Đặt cọc lại sau khi phòng được tự động giải phóng...")
        res4 = requests.post(url, json=payload)
        print(f"Status code: {res4.status_code}")
        assert res4.status_code == 200, "Đặt cọc lại thất bại!"
        
        print("\n=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ THÀNH CÔNG (PASS) ===")
        
    finally:
        # Dọn dẹp dữ liệu test
        print("\n7. Dọn dẹp dữ liệu thử nghiệm...")
        db.rooms.delete_one({"_id": room_id})
        db.roomtypes.delete_one({"_id": rt_id})
        db.properties.delete_one({"_id": prop_id})
        db.payments.delete_many({"maPhongId": room_id})
        print("-> Đã xóa sạch dữ liệu test.")

if __name__ == "__main__":
    main()
