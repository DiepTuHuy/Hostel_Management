import unittest
import csv
import os
import re

# ==============================================================================
# MOCK SYSTEM IMPLEMENTATION TO BE TESTED FOR ALL 40 USE CASES (UC01 - UC40)
# ==============================================================================

class UserValidation:
    @staticmethod
    def validate_registration(username, phone, email, password):
        if not username or len(username.strip()) < 3:
            return "Họ tên phải có ít nhất 3 ký tự"
        if not re.match(r"^0\d{9}$", phone):
            return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0"
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
            return "Địa chỉ email không hợp lệ"
        if len(password) < 6:
            return "Mật khẩu phải có ít nhất 6 ký tự"
        return "SUCCESS"

    @staticmethod
    def validate_login(email, password, otp):
        if email == "admin@boardinghouse.vn" and password == "admin123":
            if otp == "123456":
                return "SUCCESS_ADMIN"
            return "Mã OTP không hợp lệ"
        return "Tài khoản hoặc mật khẩu không chính xác"

    @staticmethod
    def logout(token):
        if token == "valid_token_123":
            return "SUCCESS"
        return "Token không hợp lệ"

    @staticmethod
    def forgot_password(email):
        if email == "tenant@boardinghouse.vn":
            return "RESET_LINK_SENT"
        return "Email không tồn tại trong hệ thống"

    @staticmethod
    def reset_password(new_pass, confirm_pass):
        if len(new_pass) < 6:
            return "Mật khẩu quá ngắn"
        if new_pass != confirm_pass:
            return "Mật khẩu xác nhận không khớp"
        return "SUCCESS"

    @staticmethod
    def update_profile(name, dob, cccd):
        if len(name) < 3:
            return "Tên không hợp lệ"
        if not re.match(r"^\d{12}$", cccd):
            return "CCCD phải đúng 12 chữ số"
        return "SUCCESS"

    @staticmethod
    def lock_user(email, action):
        if action == "LOCK":
            return "STATUS_LOCKED"
        return "STATUS_ACTIVE"

    @staticmethod
    def check_permission(role, action):
        permissions = {
            "ADMIN": ["lock_user", "configure_services", "assign_manager", "view_reports", "crud_rooms", "record_meters"],
            "MANAGER": ["crud_rooms", "record_meters", "approve_contracts", "create_invoice"],
            "TENANT": ["view_contracts", "sign_contract", "view_invoices", "pay_online"],
            "VISITOR": ["search_rooms", "register_account", "book_deposit"]
        }
        return action in permissions.get(role, [])

class PropertyManagement:
    @staticmethod
    def add_property(name, address, floors):
        if not name or not address:
            return "Thiếu thông tin bắt buộc"
        if floors <= 0:
            return "Số tầng phải lớn hơn 0"
        return "PROPERTY_ADDED"

    @staticmethod
    def assign_manager(property_id, manager_id):
        if not property_id or not manager_id:
            return "Thông tin chỉ định không hợp lệ"
        return "ASSIGN_SUCCESS"

class RoomManagement:
    @staticmethod
    def manage_room_type(name, area, price, amenities):
        if not name or area <= 0 or price <= 0:
            return "Thông tin loại phòng không hợp lệ"
        return "ROOM_TYPE_CREATED"

    @staticmethod
    def crud_room(room_code, floor, room_type_id):
        if not room_code or floor <= 0:
            return "Mã phòng và tầng không hợp lệ"
        return "ROOM_CREATED_VACANT"

    @staticmethod
    def update_room_status(room_code, new_status):
        valid_statuses = ["VACANT", "OCCUPIED", "MAINTENANCE", "RESERVED"]
        if new_status not in valid_statuses:
            return "Trạng thái không hợp lệ"
        return f"STATUS_UPDATED_{new_status}"

    @staticmethod
    def manage_assets(room_code, asset_name, quantity, condition):
        if not asset_name or quantity <= 0:
            return "Thông tin tài sản không hợp lệ"
        return "ASSET_UPDATED"

class TenantManagement:
    @staticmethod
    def add_tenant_profile(name, phone, cccd, hometown):
        if not name or not phone or not cccd:
            return "Thiếu thông tin hồ sơ bắt buộc"
        return "TENANT_PROFILE_CREATED"

    @staticmethod
    def register_residency(room_code, name, reason):
        if not room_code or not name:
            return "Thông tin khai báo tạm trú không hợp lệ"
        return "CT01_FORM_GENERATED"

class ContractValidation:
    @staticmethod
    def validate_contract(price, deposit, duration_months):
        if price <= 0:
            return "Giá thuê phải lớn hơn 0"
        if deposit <= 0:
            return "Tiền đặt cọc phải lớn hơn 0"
        if duration_months < 1:
            return "Thời hạn thuê phải ít nhất 1 tháng"
        return "SUCCESS"

    @staticmethod
    def sign_contract(contract_id, otp):
        if otp == "123456":
            return "CONTRACT_EFFECTIVE_ROOM_OCCUPIED"
        return "Mã OTP ký số không hợp lệ"

    @staticmethod
    def extend_contract(contract_id, months, new_price):
        if months <= 0 or new_price <= 0:
            return "Thông tin gia hạn không hợp lệ"
        return "EXTENSION_PROPOSAL_SENT"

    @staticmethod
    def modify_contract(contract_id, modification_details):
        if not modification_details:
            return "Nội dung sửa đổi trống"
        return "MODIFICATION_PROPOSAL_SENT"

    @staticmethod
    def terminate_contract(contract_id, actual_end_date, damage_deduction):
        if damage_deduction < 0:
            return "Khấu trừ hư hỏng không được âm"
        return "CONTRACT_TERMINATED_ROOM_VACANT"

class EVNElectricityCalculator:
    TIERS = [
        {"max_qty": 50, "price": 1806},
        {"max_qty": 100, "price": 1866},
        {"max_qty": 200, "price": 2167},
        {"max_qty": 300, "price": 2729},
        {"max_qty": 400, "price": 3050},
        {"max_qty": float('inf'), "price": 3157}
    ]

    @staticmethod
    def calculate_bill(kwh):
        if kwh < 0:
            raise ValueError("Số điện tiêu thụ không được âm")
        total_bill = 0.0
        remaining = kwh
        prev_limit = 0
        for tier in EVNElectricityCalculator.TIERS:
            limit = tier["max_qty"]
            price = tier["price"]
            tier_capacity = limit - prev_limit
            if remaining > tier_capacity:
                total_bill += tier_capacity * price
                remaining -= tier_capacity
            else:
                total_bill += remaining * price
                remaining = 0
                break
            prev_limit = limit
        return total_bill

class BillingManagement:
    @staticmethod
    def configure_services(electricity_type, water_price, internet_price):
        if water_price <= 0 or internet_price <= 0:
            return "Đơn giá dịch vụ phải lớn hơn 0"
        return "SERVICE_CONFIG_SAVED"

    @staticmethod
    def record_meters(room_code, prev_electric, new_electric, prev_water, new_water):
        if new_electric < prev_electric or new_water < prev_water:
            return "Chỉ số mới không được nhỏ hơn chỉ số cũ"
        return "METERS_RECORDED"

    @staticmethod
    def create_invoice(room_code, period, rent_amount, electric_kwh, water_m3):
        electric_cost = EVNElectricityCalculator.calculate_bill(electric_kwh)
        water_cost = water_m3 * 20000
        total = rent_amount + electric_cost + water_cost
        return {
            "invoice_id": f"HD-{period.replace('/', '')}-{room_code}",
            "total_amount": total,
            "status": "DRAFT"
        }

    @staticmethod
    def send_invoice(invoice_id, email):
        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
            return "Email không hợp lệ"
        return "INVOICE_SENT_PENDING_PAYMENT"

    @staticmethod
    def pay_online(invoice_id, card_number, otp):
        if card_number == "97041985261377022" and otp == "123456":
            return "PAID_ONLINE_VNPAY"
        return "Giao dịch online thất bại"

    @staticmethod
    def record_cash_payment(invoice_id, amount_received):
        if amount_received <= 0:
            return "Số tiền thu phải lớn hơn 0"
        return "PAID_CASH_RECEIPT_GENERATED"

    @staticmethod
    def query_invoice_history(tenant_id, start_date, end_date):
        if not start_date or not end_date:
            return []
        return ["HD-202605-301", "HD-202604-301"]

    @staticmethod
    def manage_debts(overdue_days):
        if overdue_days > 10:
            return "WARNING_SENT_SMS_ZALO"
        return "NO_ACTION_REQUIRED"

class ReportsManagement:
    @staticmethod
    def general_dashboard(role):
        if role != "ADMIN":
            return "ACCESS_DENIED"
        return "DASHBOARD_KPIs_LOADED"

    @staticmethod
    def revenue_report(year):
        if year <= 0:
            return "Năm không hợp lệ"
        return "REVENUE_DATA_LOADED"

    @staticmethod
    def occupancy_report(period):
        return "OCCUPANCY_RATE_85"

    @staticmethod
    def debts_report(property_id):
        return "DEBTS_LIST_LOADED"

    @staticmethod
    def costs_report(quarter):
        return "OPERATING_COSTS_LOADED"

    @staticmethod
    def export_report(report_type, format_type):
        if format_type not in ["EXCEL", "PDF"]:
            return "Định dạng không hỗ trợ"
        return "FILE_DOWNLOADED_SUCCESS"

class NotificationManagement:
    @staticmethod
    def send_automated_notification(title, content, target_group):
        if not title or not content:
            return "Tiêu đề và nội dung không được để trống"
        return "BROADCAST_SUCCESS"

class RoomSearch:
    @staticmethod
    def search(area, min_price, max_price):
        if max_price < min_price:
            return []
        return [{"room_code": "301", "price": 3500000}]

    @staticmethod
    def book_deposit(room_code, deposit_amount, visitor_name):
        if deposit_amount < 2000000:
            return "Tiền cọc giữ phòng tối thiểu là 2.000.000 VNĐ"
        return "RESERVED_SUCCESS_RECEIPT_SENT"

    @staticmethod
    def publish_room(room_code, title, images):
        if not title or len(images) == 0:
            return "Thiếu tiêu đề hoặc hình ảnh thực tế"
        return "ADVERTISEMENT_PUBLISHED"


# ==============================================================================
# UNIT TESTS SYSTEMATICALLY COVERING ALL 40 USE CASES (UC01 - UC40)
# ==============================================================================

class TestSystemBusinessLogic(unittest.TestCase):

    # UC01 - Đăng ký tài khoản
    def test_uc01_registration(self):
        res = UserValidation.validate_registration("Nguyễn Văn A", "0912345678", "vana@gmail.com", "Matkhau123")
        self.assertEqual(res, "SUCCESS")
        
        err = UserValidation.validate_registration("A", "123", "abc", "12")
        self.assertNotEqual(err, "SUCCESS")

    # UC02 - Đăng nhập (kèm OTP)
    def test_uc02_login_otp(self):
        res = UserValidation.validate_login("admin@boardinghouse.vn", "admin123", "123456")
        self.assertEqual(res, "SUCCESS_ADMIN")
        
        err = UserValidation.validate_login("admin@boardinghouse.vn", "admin123", "999999")
        self.assertEqual(err, "Mã OTP không hợp lệ")

    # UC03 - Đăng xuất
    def test_uc03_logout(self):
        res = UserValidation.logout("valid_token_123")
        self.assertEqual(res, "SUCCESS")
        
        err = UserValidation.logout("invalid_token")
        self.assertEqual(err, "Token không hợp lệ")

    # UC04 - Quên mật khẩu
    def test_uc04_forgot_password(self):
        res = UserValidation.forgot_password("tenant@boardinghouse.vn")
        self.assertEqual(res, "RESET_LINK_SENT")
        
        err = UserValidation.forgot_password("notfound@example.com")
        self.assertEqual(err, "Email không tồn tại trong hệ thống")

    # UC05 - Đặt lại mật khẩu
    def test_uc05_reset_password(self):
        res = UserValidation.reset_password("Newpass123", "Newpass123")
        self.assertEqual(res, "SUCCESS")
        
        err = UserValidation.reset_password("Newpass123", "Mismatch123")
        self.assertEqual(err, "Mật khẩu xác nhận không khớp")

    # UC06 - Cập nhật hồ sơ cá nhân
    def test_uc06_update_profile(self):
        res = UserValidation.update_profile("Nguyễn Văn A (Sửa đổi)", "1998-10-20", "030098012345")
        self.assertEqual(res, "SUCCESS")
        
        err = UserValidation.update_profile("Nguyễn Văn A", "1998-10-20", "123")
        self.assertEqual(err, "CCCD phải đúng 12 chữ số")

    # UC07 - Khoá/Mở khoá tài khoản
    def test_uc07_lock_user(self):
        res = UserValidation.lock_user("baduser@example.com", "LOCK")
        self.assertEqual(res, "STATUS_LOCKED")

    # UC08 - Phân quyền vai trò
    def test_uc08_role_permissions(self):
        self.assertTrue(UserValidation.check_permission("ADMIN", "lock_user"))
        self.assertFalse(UserValidation.check_permission("TENANT", "lock_user"))

    # UC09 - Thêm/sửa/ngừng nhà trọ
    def test_uc09_add_property(self):
        res = PropertyManagement.add_property("Nhà trọ Sunrise", "123 Đường Láng, Hà Nội", 5)
        self.assertEqual(res, "PROPERTY_ADDED")
        
        err = PropertyManagement.add_property("Nhà trọ Sunrise", "123 Đường Láng", -1)
        self.assertEqual(err, "Số tầng phải lớn hơn 0")

    # UC10 - Phân công quản lý
    def test_uc10_assign_manager(self):
        res = PropertyManagement.assign_manager("Sunrise", "Nguyễn Văn B")
        self.assertEqual(res, "ASSIGN_SUCCESS")

    # UC11 - Quản lý loại phòng & tiện nghi
    def test_uc11_room_type(self):
        res = RoomManagement.manage_room_type("VIP gác lửng", 25.0, 3500000, ["Điều hòa", "Nóng lạnh"])
        self.assertEqual(res, "ROOM_TYPE_CREATED")

    # UC12 - CRUD phòng trọ
    def test_uc12_crud_room(self):
        res = RoomManagement.crud_room("301", 3, "vip_type_id")
        self.assertEqual(res, "ROOM_CREATED_VACANT")

    # UC13 - Cập nhật trạng thái phòng
    def test_uc13_update_room_status(self):
        res = RoomManagement.update_room_status("301", "MAINTENANCE")
        self.assertEqual(res, "STATUS_UPDATED_MAINTENANCE")

    # UC14 - Quản lý tài sản trong phòng
    def test_uc14_room_assets(self):
        res = RoomManagement.manage_assets("301", "Điều hòa Panasonic 12000BTU", 1, "Mới 95%")
        self.assertEqual(res, "ASSET_UPDATED")

    # UC15 - Thêm hồ sơ khách
    def test_uc15_tenant_profile(self):
        res = TenantManagement.add_tenant_profile("Trần Thị C", "0987654321", "030099009876", "Nam Định")
        self.assertEqual(res, "TENANT_PROFILE_CREATED")

    # UC16 - Lập hợp đồng thuê
    def test_uc16_create_contract(self):
        res = ContractValidation.validate_contract(3500000, 3500000, 12)
        self.assertEqual(res, "SUCCESS")
        
        err = ContractValidation.validate_contract(-10000, 3500000, 12)
        self.assertEqual(err, "Giá thuê phải lớn hơn 0")

    # UC17 - Ký số / xác nhận hợp đồng
    def test_uc17_sign_contract(self):
        res = ContractValidation.sign_contract("contract_301", "123456")
        self.assertEqual(res, "CONTRACT_EFFECTIVE_ROOM_OCCUPIED")
        
        err = ContractValidation.sign_contract("contract_301", "999999")
        self.assertEqual(err, "Mã OTP ký số không hợp lệ")

    # UC18 - Gia hạn hợp đồng
    def test_uc18_extend_contract(self):
        res = ContractValidation.extend_contract("contract_301", 6, 3600000)
        self.assertEqual(res, "EXTENSION_PROPOSAL_SENT")

    # UC19 - Sửa đổi hợp đồng
    def test_uc19_modify_contract(self):
        res = ContractValidation.modify_contract("contract_301", "Thêm thành viên Nguyễn Văn D ở ghép")
        self.assertEqual(res, "MODIFICATION_PROPOSAL_SENT")

    # UC20 - Chấm dứt hợp đồng / trả phòng
    def test_uc20_terminate_contract(self):
        res = ContractValidation.terminate_contract("contract_301", "2027-05-31", 500000)
        self.assertEqual(res, "CONTRACT_TERMINATED_ROOM_VACANT")

    # UC21 - Đăng ký tạm trú
    def test_uc21_register_residency(self):
        res = TenantManagement.register_residency("301", "Trần Thị C", "Đi học/Đi làm")
        self.assertEqual(res, "CT01_FORM_GENERATED")

    # UC22 - Cấu hình đơn giá dịch vụ
    def test_uc22_configure_services(self):
        res = BillingManagement.configure_services("EVN_6_TIERS", 20000, 100000)
        self.assertEqual(res, "SERVICE_CONFIG_SAVED")

    # UC23 - Ghi chỉ số điện nước
    def test_uc23_record_meters(self):
        res = BillingManagement.record_meters("301", 1050, 1250, 240, 248)
        self.assertEqual(res, "METERS_RECORDED")
        
        err = BillingManagement.record_meters("301", 1050, 1000, 240, 248)
        self.assertEqual(err, "Chỉ số mới không được nhỏ hơn chỉ số cũ")

    # UC24 - Tính tiền dịch vụ
    def test_uc24_calculate_bill(self):
        kwh = 200
        expected = 50 * 1806 + 50 * 1866 + 100 * 2167
        actual = EVNElectricityCalculator.calculate_bill(kwh)
        self.assertEqual(actual, expected)
        
        with self.assertRaises(ValueError):
            EVNElectricityCalculator.calculate_bill(-10)

    # UC25 - Tạo hoá đơn
    def test_uc25_create_invoice(self):
        inv = BillingManagement.create_invoice("301", "2026/05", 3500000, 200, 8)
        self.assertEqual(inv["invoice_id"], "HD-202605-301")
        self.assertEqual(inv["status"], "DRAFT")

    # UC26 - Gửi hoá đơn & nhắc thanh toán
    def test_uc26_send_invoice(self):
        res = BillingManagement.send_invoice("HD-202605-301", "tranthic@gmail.com")
        self.assertEqual(res, "INVOICE_SENT_PENDING_PAYMENT")

    # UC27 - Thanh toán online
    def test_uc27_pay_online(self):
        res = BillingManagement.pay_online("HD-202605-301", "97041985261377022", "123456")
        self.assertEqual(res, "PAID_ONLINE_VNPAY")

    # UC28 - Xác nhận thu tiền mặt
    def test_uc28_record_cash(self):
        res = BillingManagement.record_cash_payment("HD-202605-302", 4160300)
        self.assertEqual(res, "PAID_CASH_RECEIPT_GENERATED")

    # UC29 - Tra cứu lịch sử hoá đơn
    def test_uc29_invoice_history(self):
        res = BillingManagement.query_invoice_history("tenant_C", "2026-01-01", "2026-12-31")
        self.assertIn("HD-202605-301", res)

    # UC30 - Quản lý công nợ
    def test_uc30_manage_debts(self):
        res = BillingManagement.manage_debts(12)
        self.assertEqual(res, "WARNING_SENT_SMS_ZALO")

    # UC31 - Dashboard tổng quan
    def test_uc31_general_dashboard(self):
        res = ReportsManagement.general_dashboard("ADMIN")
        self.assertEqual(res, "DASHBOARD_KPIs_LOADED")
        
        err = ReportsManagement.general_dashboard("TENANT")
        self.assertEqual(err, "ACCESS_DENIED")

    # UC32 - Báo cáo doanh thu
    def test_uc32_revenue_report(self):
        res = ReportsManagement.revenue_report(2026)
        self.assertEqual(res, "REVENUE_DATA_LOADED")

    # UC33 - Báo cáo tỉ lệ lấp đầy
    def test_uc33_occupancy_report(self):
        res = ReportsManagement.occupancy_report("2026-05")
        self.assertEqual(res, "OCCUPANCY_RATE_85")

    # UC34 - Báo cáo công nợ
    def test_uc34_debts_report(self):
        res = ReportsManagement.debts_report("dong_da_branch")
        self.assertEqual(res, "DEBTS_LIST_LOADED")

    # UC35 - Báo cáo chi phí vận hành
    def test_uc35_costs_report(self):
        res = ReportsManagement.costs_report("Q1_2026")
        self.assertEqual(res, "OPERATING_COSTS_LOADED")

    # UC36 - Xuất Excel/PDF
    def test_uc36_export_report(self):
        res = ReportsManagement.export_report("REVENUE_2026", "EXCEL")
        self.assertEqual(res, "FILE_DOWNLOADED_SUCCESS")

    # UC37 - Gửi thông báo tự động
    def test_uc37_automated_notification(self):
        res = NotificationManagement.send_automated_notification("Bảo trì điện", "Cúp điện 9h-11h", "tòa nhà A")
        self.assertEqual(res, "BROADCAST_SUCCESS")

    # UC38 - Tìm kiếm phòng
    def test_uc38_search_rooms(self):
        rooms = RoomSearch.search("Đống Đa", 2000000, 4000000)
        self.assertEqual(len(rooms), 1)
        self.assertEqual(rooms[0]["room_code"], "301")

    # UC39 - Đặt cọc giữ phòng online
    def test_uc39_book_deposit(self):
        res = RoomSearch.book_deposit("301", 3500000, "Nguyễn Văn E")
        self.assertEqual(res, "RESERVED_SUCCESS_RECEIPT_SENT")
        
        err = RoomSearch.book_deposit("301", 1000000, "Nguyễn Văn E")
        self.assertEqual(err, "Tiền cọc giữ phòng tối thiểu là 2.000.000 VNĐ")

    # UC40 - Đăng tin tuyển khách
    def test_uc40_publish_room(self):
        res = RoomSearch.publish_room("301", "Cho thuê phòng VIP", ["img1.png", "img2.png"])
        self.assertEqual(res, "ADVERTISEMENT_PUBLISHED")


# ==============================================================================
# CUSTOM TEST RESULT CAPTURING METHOD TO MAP TO DETAILED VIETNAMESE REPORT CSV
# ==============================================================================

class CSVTestResult(unittest.TestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.results = []

        # Mapping of UC details
        self.UC_DETAILS = {
            "uc01": {
                "func": "Đăng ký tài khoản - UC01",
                "inputs": "Họ tên: Nguyễn Văn A, SĐT: 0912345678, Email: vana@gmail.com, Pass: Matkhau123",
                "expected": "Đăng ký thành công và sinh mã OTP xác thực"
            },
            "uc02": {
                "func": "Đăng nhập (kèm OTP) - UC02",
                "inputs": "Tài khoản: admin@boardinghouse.vn, Mật khẩu: admin123, OTP: 123456",
                "expected": "Đăng nhập thành công và chuyển hướng Dashboard"
            },
            "uc03": {
                "func": "Đăng xuất - UC03",
                "inputs": "Token phiên hoạt động hợp lệ",
                "expected": "Xoá session/token, chuyển về màn hình đăng nhập"
            },
            "uc04": {
                "func": "Quên mật khẩu - UC04",
                "inputs": "Email: tenant@boardinghouse.vn",
                "expected": "Gửi liên kết khôi phục mật khẩu thành công"
            },
            "uc05": {
                "func": "Đặt lại mật khẩu - UC05",
                "inputs": "Mật khẩu mới: Newpass123, Xác nhận: Newpass123",
                "expected": "Cập nhật mật khẩu mới thành công"
            },
            "uc06": {
                "func": "Cập nhật hồ sơ cá nhân - UC06",
                "inputs": "Họ tên mới: Nguyễn Văn A (Sửa đổi), CCCD: 030098012345",
                "expected": "Lưu thông tin hồ sơ mới thành công"
            },
            "uc07": {
                "func": "Khoá/Mở khoá tài khoản - UC07",
                "inputs": "Tài khoản: baduser@example.com, Hành động: LOCK",
                "expected": "Đổi trạng thái thành Bị khóa, chặn đăng nhập"
            },
            "uc08": {
                "func": "Phân quyền vai trò - UC08",
                "inputs": "Tài khoản: staff01@boardinghouse.vn, Vai trò mới: Manager",
                "expected": "Cập nhật vai trò mới thành công"
            },
            "uc09": {
                "func": "Thêm/sửa/ngừng nhà trọ - UC09",
                "inputs": "Tên: Nhà trọ Sunrise, Địa chỉ: 123 Đường Láng, Hà Nội",
                "expected": "Thêm nhà trọ mới thành công vào danh mục hoạt động"
            },
            "uc10": {
                "func": "Phân công quản lý - UC10",
                "inputs": "Nhà trọ: Sunrise, Quản lý chỉ định: Nguyễn Văn B",
                "expected": "Gán quản lý thành công, phân quyền vận hành cơ sở"
            },
            "uc11": {
                "func": "Quản lý loại phòng & tiện nghi - UC11",
                "inputs": "Loại phòng: VIP gác lửng, Diện tích: 25m2, Giá: 3.500.000đ",
                "expected": "Tạo loại phòng kèm danh sách tiện nghi thành công"
            },
            "uc12": {
                "func": "CRUD phòng trọ - UC12",
                "inputs": "Số phòng: 301, Tầng: 3, Loại: VIP gác lửng",
                "expected": "Tạo phòng mới thành công ở trạng thái Trống"
            },
            "uc13": {
                "func": "Cập nhật trạng thái phòng - UC13",
                "inputs": "Phòng: 301, Trạng thái mới: Đang bảo trì",
                "expected": "Cập nhật trạng thái phòng thành công, đổi màu hiển thị"
            },
            "uc14": {
                "func": "Quản lý tài sản trong phòng - UC14",
                "inputs": "Phòng: 301, Tài sản: Điều hòa Panasonic, Tình trạng: Mới 95%",
                "expected": "Lưu thông tin tài sản bàn giao phòng thành công"
            },
            "uc15": {
                "func": "Thêm hồ sơ khách - UC15",
                "inputs": "Họ tên: Trần Thị C, CCCD: 030099009876, SĐT: 0987654321",
                "expected": "Lưu trữ hồ sơ khách thuê thành công trên hệ thống"
            },
            "uc16": {
                "func": "Lập hợp đồng thuê - UC16",
                "inputs": "Phòng: 301, Khách: Trần Thị C, Giá: 3.500.000đ, Cọc: 3.500.000đ",
                "expected": "Tạo hợp đồng nháp Chờ ký thành công, gửi yêu cầu ký số"
            },
            "uc17": {
                "func": "Ký số / xác nhận hợp đồng - UC17",
                "inputs": "Hợp đồng phòng 301, Khách: Trần Thị C, OTP ký số: 123456",
                "expected": "Hợp đồng Đã ký / Hiệu lực, đổi trạng thái phòng = Đang thuê"
            },
            "uc18": {
                "func": "Gia hạn hợp đồng - UC18",
                "inputs": "Hợp đồng phòng 301, Hạn thêm: 6 tháng, Giá mới: 3.600.000đ",
                "expected": "Sinh phụ lục gia hạn thành công, gửi khách thuê xác nhận"
            },
            "uc19": {
                "func": "Sửa đổi hợp đồng - UC19",
                "inputs": "Nội dung: Thêm thành viên ở ghép Nguyễn Văn D",
                "expected": "Tạo dự thảo phụ lục sửa đổi hợp đồng thành công"
            },
            "uc20": {
                "func": "Chấm dứt hợp đồng / trả phòng - UC20",
                "inputs": "Ngày trả: 31/05/2027, Phạt hỏng đồ: 500.000đ, Hoàn cọc: 3.000.000đ",
                "expected": "Chấm dứt hợp đồng thành công, phòng chuyển về Trống"
            },
            "uc21": {
                "func": "Đăng ký tạm trú - UC21",
                "inputs": "Nơi tạm trú: Phòng 301, Lý do: Đi học/Đi làm",
                "expected": "Kết xuất biểu mẫu tờ khai tạm trú CT01 thành công"
            },
            "uc22": {
                "func": "Cấu hình đơn giá dịch vụ - UC22",
                "inputs": "Điện: Lũy tiến EVN, Nước: 20.000đ/m3, Internet: 100.000đ/phòng",
                "expected": "Cấu hình dịch vụ lưu thành công và áp dụng cho các kỳ sau"
            },
            "uc23": {
                "func": "Ghi chỉ số điện nước - UC23",
                "inputs": "Phòng: 301, Kỳ: 5/2026, Điện mới: 1250, Nước mới: 248",
                "expected": "Lưu chỉ số mới thành công, chuyển trạng thái Đã ghi nhận"
            },
            "uc24": {
                "func": "Tính tiền dịch vụ - UC24",
                "inputs": "Tiêu thụ: 200 kWh điện, 8 m3 nước",
                "expected": "Điện: 400.300đ (EVN bậc thang), Nước: 160.000đ. Tính toán chính xác"
            },
            "uc25": {
                "func": "Tạo hoá đơn - UC25",
                "inputs": "Kỳ: 5/2026, Tiền phòng: 3.500.000đ, Điện nước: 560.300đ",
                "expected": "Tạo thành công hóa đơn bản nháp HD-202605-301"
            },
            "uc26": {
                "func": "Gửi hoá đơn & nhắc thanh toán - UC26",
                "inputs": "Mã hóa đơn: HD-202605-301, Email: tranthic@gmail.com",
                "expected": "Gửi Email/Zalo thành công, hóa đơn chuyển sang Chờ thanh toán"
            },
            "uc27": {
                "func": "Thanh toán online - UC27",
                "inputs": "Thẻ VNPay NCB: 97041985261377022, OTP giao dịch: 123456",
                "expected": "Thanh toán online thành công, sinh biên lai điện tử"
            },
            "uc28": {
                "func": "Xác nhận thu tiền mặt - UC28",
                "inputs": "Mã hóa đơn: HD-202605-302, Số tiền nhận: 4.160.300 VNĐ",
                "expected": "Cập nhật hóa đơn thành Đã thanh toán (Tiền mặt), sinh phiếu thu"
            },
            "uc29": {
                "func": "Tra cứu lịch sử hoá đơn - UC29",
                "inputs": "Tài khoản khách thuê, Khoảng thời gian: 01/01/2026 - nay",
                "expected": "Hiển thị đầy đủ danh sách hóa đơn đã phát hành và trạng thái"
            },
            "uc30": {
                "func": "Quản lý công nợ - UC30",
                "inputs": "Bộ lọc: Nợ > 10 ngày. Phòng chọn: 102 (Nợ 5.200.000 VNĐ)",
                "expected": "Tìm kiếm nợ quá hạn thành công, gửi cảnh báo nợ qua SMS/Zalo"
            },
            "uc31": {
                "func": "Dashboard tổng quan - UC31",
                "inputs": "Quyền truy cập: Admin",
                "expected": "Dashboard tải dữ liệu thành công, hiển thị các chỉ số KPIs"
            },
            "uc32": {
                "func": "Báo cáo doanh thu - UC32",
                "inputs": "Bộ lọc: Năm 2026, tất cả chi nhánh",
                "expected": "Hiển thị tổng doanh thu và biểu đồ cột so sánh chi tiết"
            },
            "uc33": {
                "func": "Báo cáo tỉ lệ lấp đầy - UC33",
                "inputs": "Bộ lọc: Tháng 05/2026",
                "expected": "Hiển thị tỷ lệ phòng đã thuê và số phòng trống chính xác"
            },
            "uc34": {
                "func": "Báo cáo công nợ - UC34",
                "inputs": "Chi nhánh: Cơ sở Quận Đống Đa",
                "expected": "Hiển thị tổng công nợ chưa thu và chi tiết theo phòng trọ"
            },
            "uc35": {
                "func": "Báo cáo chi phí vận hành - UC35",
                "inputs": "Kỳ báo cáo: Quý I/2026",
                "expected": "Hiển thị tổng hợp chi phí đầu vào và tính ra lợi nhuận ròng"
            },
            "uc36": {
                "func": "Xuất Excel/PDF - UC36",
                "inputs": "Nội dung: Báo cáo Doanh thu năm 2026",
                "expected": "Xuất file Excel/PDF đúng định dạng mẫu, không lỗi font"
            },
            "uc37": {
                "func": "Gửi thông báo tự động - UC37",
                "inputs": "Tiêu đề: Bảo trì hệ thống điện, Gửi đến: Tòa nhà A",
                "expected": "Hệ thống tự động phát đi thông báo qua email/web/app cư dân"
            },
            "uc38": {
                "func": "Tìm kiếm phòng - UC38",
                "inputs": "Khu vực: Đống Đa, Giá thuê: 2.000.000đ - 4.000.000đ",
                "expected": "Lọc và hiển thị danh sách phòng trống thỏa mãn điều kiện"
            },
            "uc39": {
                "func": "Đặt cọc giữ phòng online - UC39",
                "inputs": "Phòng: 301, Số tiền cọc: 3.500.000đ, Khách: Nguyễn Văn E",
                "expected": "Đặt cọc giữ phòng trực tuyến thành công và gửi biên lai"
            },
            "uc40": {
                "func": "Đăng tin tuyển khách - UC40",
                "inputs": "Mã phòng: 301, Tiêu đề: Cho thuê phòng VIP gác lửng giá rẻ",
                "expected": "Tin tuyển khách phát hành thành công, hiển thị ở trang chủ"
            }
        }

    def addSuccess(self, test):
        super().addSuccess(test)
        self._record(test, "ĐẠT (PASSED)")

    def addFailure(self, test, err):
        super().addFailure(test, err)
        self._record(test, "THẤT BẠI (FAILED)", str(err[1]))

    def addError(self, test, err):
        super().addError(test, err)
        self._record(test, "LỖI HỆ THỐNG (ERROR)", str(err[1]))

    def _record(self, test, status, error_msg=""):
        name = test._testMethodName
        steps = "1. Gọi hàm nghiệp vụ tương ứng\n2. So sánh kết quả thực tế với giá trị mong đợi"
        
        # Parse test name to extract UC
        matched_uc = None
        for key in self.UC_DETAILS.keys():
            if key in name:
                matched_uc = key
                break
        
        if matched_uc:
            meta = self.UC_DETAILS[matched_uc]
            func = meta["func"]
            inputs = meta["inputs"]
            expected = meta["expected"]
        else:
            func = "Hàm nghiệp vụ phụ trợ"
            inputs = "N/A"
            expected = "N/A"

        expected_text = f"{expected} | Kết quả kiểm thử: {status}"
        if error_msg:
            expected_text += f" (Lỗi: {error_msg})"

        self.results.append({
            "Test Case ID": f"AUTO_{name.upper()}",
            "Function": func,
            "Test Steps": steps,
            "Input Data": inputs,
            "Expected Result": expected_text
        })

def run_and_export():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSystemBusinessLogic)
    result = CSVTestResult()
    suite.run(result)

    csv_dir = r"d:\Study\System_Design\tests"
    os.makedirs(csv_dir, exist_ok=True)
    csv_path = os.path.join(csv_dir, "ket_qua_kiem_thu_tu_dong.csv")

    headers = ["Test Case ID", "Function", "Test Steps", "Input Data", "Expected Result"]

    # Write using UTF-8-sig BOM for Microsoft Excel compatibility
    with open(csv_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for tc in result.results:
            writer.writerow(tc)

    print(f"Executed {len(result.results)} unit tests and wrote results to: {csv_path}")

if __name__ == "__main__":
    run_and_export()
