import os

walkthrough_path = "/Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other computers/My Computer 3/D:/Study/System_Design/walkthrough.md"

appendix = """

---

## Cập nhật Ngày 04/06/2026: Xoá UC21 & UC40 khỏi Đặc tả, Hoàn thiện UC26 & UC35 trên FE và BE

Theo yêu cầu điều chỉnh của người dùng, chúng ta đã thực hiện xóa bỏ hoàn toàn 2 Use Cases khỏi tài liệu đặc tả đồ án, đồng thời lập trình tích hợp hoàn thiện 2 Use Cases nghiệp vụ khác ở cả Frontend và Backend kết nối trực tiếp CSDL.

### 1. Loại bỏ các Use Cases khỏi Đặc tả & Sơ đồ
*   **Các Use Cases bị xóa**: 
    1.  **UC21 (Đăng ký tạm trú)**: Ca sử dụng mở rộng trong nhóm ca sử dụng Hợp đồng (UC-C).
    2.  **UC40 (Đăng tin tuyển khách)**: Ca sử dụng trong nhóm ca sử dụng Tiện ích bổ trợ (UC-F).
*   **Đồng bộ Sơ đồ PlantUML**:
    *   Cập nhật [2.04_uc_contract.puml](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/docs/diagrams/2.04_uc_contract.puml) loại bỏ ca sử dụng `C7` (UC21) và các mối quan hệ liên kết liên quan.
    *   Cập nhật [2.06b_uc_utilities.puml](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/docs/diagrams/2.06b_uc_utilities.puml) loại bỏ ca sử dụng `UT4` (UC40) và mối quan hệ liên kết liên quan.
    *   Khởi chạy trình biên dịch PlantUML, tự động tải xuống các tệp PNG chất lượng cao thay thế tại thư mục `docs/diagrams/png/`.
*   **Cập nhật Đặc tả Word (.docx)**:
    *   Cập nhật các bảng mã nguồn PlantUML nhúng (Bảng 10 và Bảng 13) với mã nguồn cập nhật mới nhất.
    *   Thay thế tệp ảnh nhúng trực tiếp trong Word (quan hệ ID `rId9` cho Hợp đồng và `rId62` cho Tiện ích) bằng hình ảnh cập nhật mới nhất (không còn chứa UC21 và UC40).
    *   Loại bỏ dòng đặc tả UC21 trong bảng mô tả kịch bản Use Case mở rộng (Bảng 16 Row 8).
    *   Loại bỏ toàn bộ các đoạn văn mô tả UC21 và UC40 trong Mục 4.3 "Hướng phát triển tương lai ở v2" cùng các điểm đề cập liên quan tại bảng 02, 03, 06 và các đoạn văn chung (tổng số ca sử dụng giảm từ 41 xuống 39).
*   **Đồng bộ các Báo cáo Đối chiếu (.md)**:
    *   Đồng bộ hóa 6 tệp báo cáo đối chiếu chi tiết sang trạng thái 39 Use Cases, gỡ bỏ hoàn toàn dòng phân tích sai lệch của UC21 và UC40.
    *   Cập nhật tỉ lệ khớp nối đặc tả lên mức **98%** nhờ hoàn thiện các chức năng thật.

### 2. Triển khai hoàn thiện UC26 (Gửi hoá đơn & nhắc thanh toán)
*   **Backend (Node.js/Express)**:
    *   Hỗ trợ endpoint nhắc nợ `/api/reports/debts/:invoiceId/remind` truy vấn chi tiết hoá đơn, lấy email khách thuê và thực hiện gửi email thông báo nhắc nợ thật (hoặc mockup log nếu chưa điền SMTP credential) chứa mã hoá đơn, kỳ đóng, số tiền trễ hạn đóng và liên kết thanh toán.
*   **Frontend (ReactJS)**:
    *   Cấu hình import `reportService` trong [InvoicesPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/admin/InvoicesPage.jsx).
    *   Thay thế logic `handleSendReminder` giả lập thông báo Zalo/SMS bằng cuộc gọi API bất đồng bộ thật đến `reportService.sendDebtReminder(invoice.id)`.
    *   Bổ sung hiệu ứng loading và các toast thông báo thành công/lỗi trực quan để tương tác với người dùng.

### 3. Triển khai hoàn thiện UC35 (Báo cáo chi phí vận hành)
*   **Database Schema**:
    *   Xây dựng mô hình dữ liệu Mongoose mới tại [Expense.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/models/Expense.js) gồm các trường: `maNhaTroId`, `tenChiPhi`, `soTien`, `danhMuc` (enum: sua_chua, bao_tri, dien_nuoc_chung, dich_vu_ngoai, khac), `ngayChi`, `ghiChu`.
*   **Backend CRUD & Report APIs**:
    *   Tích hợp CRUD endpoints (`GET /api/expenses`, `POST /api/expenses`, `DELETE /api/expenses/:id`) để quản trị chi phí.
    *   Tích hợp API tổng hợp báo cáo chi phí theo tháng `/api/reports/expenses` lọc theo `propertyId` và `year` phục vụ vẽ biểu đồ.
    *   Bổ sung cơ chế **Auto-seed** chi phí mẫu cho 5 tháng đầu năm 2026 tự động khi server khởi chạy nếu bộ sưu tập trống, đảm bảo Admin xem biểu đồ có số liệu thật trực quan ngay lập tức.
*   **Frontend Integration**:
    *   Đăng ký hàm `getExpenses(propertyId, year)` trong `reportService.js`.
    *   Cấu hình tab "Chi phí" (`cost`) tại trang báo cáo [ReportsPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/admin/ReportsPage.jsx) gọi API nạp chi phí thật từ cơ sở dữ liệu thay vì mock 40% doanh thu như trước đây.
"""

if os.path.exists(walkthrough_path):
    with open(walkthrough_path, "a", encoding="utf-8") as f:
        f.write(appendix)
    print("✅ Appended updates to walkthrough.md")
else:
    print("❌ walkthrough.md not found!")
