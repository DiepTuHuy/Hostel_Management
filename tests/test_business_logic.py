import unittest
import csv
import os
import re

# ==========================================
# MOCK SYSTEM IMPLEMENTATION TO BE TESTED
# ==========================================

class EVNElectricityCalculator:
    # EVN pricing tiers (sinh hoạt 6 bậc)
    TIERS = [
        {"max_qty": 50, "price": 1806},    # Bậc 1: 0 - 50 kWh
        {"max_qty": 100, "price": 1866},   # Bậc 2: 51 - 100 kWh
        {"max_qty": 200, "price": 2167},   # Bậc 3: 101 - 200 kWh
        {"max_qty": 300, "price": 2729},   # Bậc 4: 201 - 300 kWh
        {"max_qty": 400, "price": 3050},   # Bậc 5: 301 - 400 kWh
        {"max_qty": float('inf'), "price": 3157}  # Bậc 6: 401+ kWh
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
    def check_permission(role, action):
        permissions = {
            "ADMIN": ["lock_user", "configure_services", "assign_manager", "view_reports", "crud_rooms", "record_meters"],
            "MANAGER": ["crud_rooms", "record_meters", "approve_contracts", "create_invoice"],
            "TENANT": ["view_contracts", "sign_contract", "view_invoices", "pay_online"],
            "VISITOR": ["search_rooms", "register_account", "book_deposit"]
        }
        return action in permissions.get(role, [])

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

# ==========================================
# UNIT TESTS AND RESULTS COLLECTION
# ==========================================

# We will collect the execution results here
execution_results = []

class TestSystemBusinessLogic(unittest.TestCase):
    
    # --- Electricity calculation tests (UC24) ---
    def test_evn_calc_under_50(self):
        # 40 kWh should be 40 * 1806 = 72,240 VNĐ
        kwh = 40
        expected = 40 * 1806
        actual = EVNElectricityCalculator.calculate_bill(kwh)
        self.assertEqual(actual, expected)
        
    def test_evn_calc_exact_100(self):
        # 100 kWh should be:
        # Bậc 1: 50 * 1806 = 90,300 VNĐ
        # Bậc 2: 50 * 1866 = 93,300 VNĐ
        # Total = 183,600 VNĐ
        kwh = 100
        expected = 50 * 1806 + 50 * 1866
        actual = EVNElectricityCalculator.calculate_bill(kwh)
        self.assertEqual(actual, expected)

    def test_evn_calc_exact_200(self):
        # 200 kWh should be:
        # Bậc 1: 50 * 1806 = 90,300
        # Bậc 2: 50 * 1866 = 93,300
        # Bậc 3: 100 * 2167 = 216,700
        # Total = 400,300 VNĐ
        kwh = 200
        expected = 50 * 1806 + 50 * 1866 + 100 * 2167
        actual = EVNElectricityCalculator.calculate_bill(kwh)
        self.assertEqual(actual, expected)

    def test_evn_calc_negative_error(self):
        with self.assertRaises(ValueError):
            EVNElectricityCalculator.calculate_bill(-10)

    # --- User validation tests (UC01, UC08) ---
    def test_user_reg_success(self):
        res = UserValidation.validate_registration("Nguyễn Văn A", "0912345678", "vana@gmail.com", "123456")
        self.assertEqual(res, "SUCCESS")

    def test_user_reg_invalid_phone(self):
        res = UserValidation.validate_registration("Nguyễn Văn B", "123456789", "vanb@gmail.com", "123456")
        self.assertEqual(res, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0")

    def test_user_reg_short_password(self):
        res = UserValidation.validate_registration("Nguyễn Văn C", "0987654321", "vanc@gmail.com", "123")
        self.assertEqual(res, "Mật khẩu phải có ít nhất 6 ký tự")

    def test_admin_permissions(self):
        self.assertTrue(UserValidation.check_permission("ADMIN", "lock_user"))
        self.assertTrue(UserValidation.check_permission("ADMIN", "assign_manager"))
        self.assertFalse(UserValidation.check_permission("TENANT", "lock_user"))

    def test_tenant_permissions(self):
        self.assertTrue(UserValidation.check_permission("TENANT", "sign_contract"))
        self.assertFalse(UserValidation.check_permission("TENANT", "crud_rooms"))

    # --- Contract validation tests (UC16) ---
    def test_contract_success(self):
        res = ContractValidation.validate_contract(3500000, 3500000, 12)
        self.assertEqual(res, "SUCCESS")

    def test_contract_invalid_price(self):
        res = ContractValidation.validate_contract(-10000, 3500000, 12)
        self.assertEqual(res, "Giá thuê phải lớn hơn 0")


# Custom TestResult to capture tests and log them into the CSV format
class CSVTestResult(unittest.TestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.results = []

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
        # Map python test method name to readable Vietnamese attributes
        name = test._testMethodName
        
        # Determine details based on test name
        steps = "1. Gọi hàm nghiệp vụ tương ứng\n2. So sánh kết quả thực tế với giá trị mong đợi"
        
        if "calc" in name:
            func = "Tính toán tiền điện EVN bậc thang"
            if "50" in name:
                inputs = "Số điện: 40 kWh"
                expected = "Tổng tiền: 72.240 VNĐ"
            elif "100" in name:
                inputs = "Số điện: 100 kWh"
                expected = "Tổng tiền: 183.600 VNĐ"
            elif "200" in name:
                inputs = "Số điện: 200 kWh"
                expected = "Tổng tiền: 400.300 VNĐ"
            else:
                inputs = "Số điện: -10 kWh"
                expected = "Báo lỗi ValueError"
        elif "user_reg" in name:
            func = "Đăng ký tài khoản khách thuê"
            if "success" in name:
                inputs = "Tên: Nguyễn Văn A, SĐT: 0912345678, Email: vana@gmail.com, Pass: 123456"
                expected = "Trả về 'SUCCESS'"
            elif "phone" in name:
                inputs = "SĐT không hợp lệ: 123456789"
                expected = "Trả về thông báo lỗi định dạng SĐT"
            else:
                inputs = "Mật khẩu ngắn: 123"
                expected = "Trả về thông báo lỗi độ dài mật khẩu"
        elif "permissions" in name:
            func = "Phân quyền vai trò người dùng"
            if "admin" in name:
                inputs = "Vai trò: ADMIN, Hành động: lock_user, assign_manager"
                expected = "Trả về True"
            else:
                inputs = "Vai trò: TENANT, Hành động: sign_contract, crud_rooms"
                expected = "sign_contract: True, crud_rooms: False"
        elif "contract" in name:
            func = "Kiểm tra hợp đồng thuê"
            if "success" in name:
                inputs = "Giá: 3.500.000, Cọc: 3.500.000, Hạn: 12 tháng"
                expected = "Trả về 'SUCCESS'"
            else:
                inputs = "Giá âm: -10.000"
                expected = "Trả về lỗi 'Giá thuê phải lớn hơn 0'"
        else:
            func = "Hàm nghiệp vụ hệ thống"
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
    # Setup test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(TestSystemBusinessLogic)
    result = CSVTestResult()
    suite.run(result)

    # Output CSV path
    csv_dir = r"d:\Study\System_Design\tests"
    os.makedirs(csv_dir, exist_ok=True)
    csv_path = os.path.join(csv_dir, "ket_qua_kiem_thu_tu_dong.csv")

    headers = ["Test Case ID", "Function", "Test Steps", "Input Data", "Expected Result"]

    # Write using utf-8-sig
    with open(csv_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        for tc in result.results:
            writer.writerow(tc)

    print(f"Executed {len(result.results)} unit tests and wrote results to: {csv_path}")

if __name__ == "__main__":
    run_and_export()
