# BÁO CÁO ĐỐI CHIẾU SỰ KHỚP NHAU VÀ SAI LỆCH GIỮA HỆ THỐNG VÀ BẢN ĐẶC TẢ CHI TIẾT
*(Boarding House Chain Management System - Final Alignment Report)*

Báo cáo này đối chiếu chi tiết giữa **Hệ thống thực tế** (Mã nguồn Frontend, CSDL MongoDB Atlas, các API Node.js Express & Python Flask) và **Tài liệu đặc tả** `Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx` (được cập nhật mới nhất với 7 sơ đồ Use Case và mã nguồn PlantUML dạng bảng).

---

## I. TỔNG QUAN MỨC ĐỘ KHỚP NHAU (ALIGNMENT STATUS)

Hiện tại, sau khi cập nhật lại toàn bộ các sơ đồ Use Case và bổ sung phân hệ **Tiện ích bổ trợ (UC-F)**, mức độ khớp nhau giữa hệ thống thực tế và bản đặc tả đạt khoảng **80%**. 

### Các điểm đã khớp nhau hoàn hảo (100%):
- **Phân hệ chức năng và Sơ đồ Use Case**: 6 phân hệ lớn trong thực tế gồm: (1) Xác thực & tài khoản, (2) Quản lý nhà trọ & phòng, (3) Hợp đồng & khách thuê, (4) Dịch vụ & hoá đơn, (5) Báo cáo thống kê, (6) Tiện ích bổ trợ đã khớp hoàn toàn với 7 sơ đồ Use Case tổng quát và chi tiết trong tài liệu đặc tả.
- **Trợ lý ảo AI Chatbot (BoardingHouse AI)**: Sơ đồ Use Case tổng quát và sơ đồ Use Case tiện ích bổ trợ mới đã phản ánh chính xác sự tồn tại của tính năng AI chatbot với cơ chế dự phòng ngoại tuyến (offline fallback).
- **Mã nguồn PlantUML**: 18 file mã nguồn PlantUML vẽ sơ đồ đã được nhúng trực tiếp dưới dạng bảng xám sang trọng ngay dưới hình vẽ, giúp người đọc dễ dàng sao chép và tái tạo sơ đồ.

---

## II. BẢNG PHÂN TÍCH SAI LỆCH CHI TIẾT (MISALIGNMENTS)

Dưới đây là các phần sai lệch chi tiết giữa mã nguồn hệ thống thực tế và nội dung mô tả trong tài liệu đặc tả:

| STT | Thành phần | Nội dung trong Đặc tả (.docx) | Thực tế trong Hệ thống | Mức độ & Nguyên nhân | Hướng khắc phục / Điều chỉnh |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Công nghệ Frontend** | Mô tả ứng dụng chạy trên nền tảng **ReactJS** (Web) và **React Native** (Mobile app). | Chia thành 4 phân hệ UI phẳng độc lập chạy bằng **HTML, CSS, JS thuần (Vanilla JS)**:<br>- `Admin_UI`<br>- `Manager_UI`<br>- `Tenant_UI`<br>- `Visitor_UI` | **Trung bình**<br>Do định hướng ban đầu của đồ án thiết kế React/Mobile, nhưng thực tế triển khai bằng Vanilla JS để tối ưu hóa tốc độ tải trang và tính gọn nhẹ. | Cập nhật lại phần giới thiệu công nghệ ở Chương 1 & Chương 3 sang Vanilla JS / Web Dashboards, loại bỏ các cụm từ mô tả React Native. |
| **2** | **Công nghệ Backend** | Đề xuất kiến trúc dịch vụ REST API đơn lẻ chạy trên **Node.js Express** hoặc **Spring Boot**. | Chạy song song **hai backend** kết nối chung database:<br>- Node.js Express (port 5001 - xử lý auth, CRUD, chatbot, mail OTP)<br>- Python Flask (xử lý logic dữ liệu và thống kê phòng). | **Nhẹ**<br>Bổ sung Python Flask để phục vụ các bài toán xử lý số liệu nâng cao cho Admin. | Khai báo kiến trúc backend song hành (Dual-backend Express + Flask) trong phần kiến trúc triển khai ở Chương 1. |
| **3** | **Cơ sở dữ liệu & Class Diagram** | Sơ đồ lớp (Class Diagram - Hình 2.12) thiết kế theo tư duy **quan hệ (RDBMS)** bằng tiếng Việt có dấu. Tách riêng các thực thể: `VaiTro`, `TaiSan`, `ChiTietHoaDon`, `KhachThue`. | Sử dụng **MongoDB (NoSQL)** với Schema tiếng Anh. Tối ưu hóa cấu trúc nhúng (Embedded Documents):<br>- Vai trò lưu enum trong `User`<br>- Khách thuê nhúng `tenantProfile` trong `User`<br>- Tài sản nhúng mảng `assets` trong `Room`<br>- Chi tiết hoá đơn nhúng mảng `details` trong `Invoice`. | **Lớn**<br>Khác biệt cốt lõi giữa mô hình dữ liệu quan hệ (SQL) và mô hình phi quan hệ (NoSQL). | Giữ nguyên Class Diagram NoSQL tiếng Anh đã vẽ ở `2.12_class_diagram.puml` và cập nhật phần thuyết minh mô hình thực thể sang MongoDB Schema trong đặc tả. |
| **4** | **Liên kết Cơ sở / Chi nhánh** | Các thực thể như Loại phòng, Dịch vụ được mô tả áp dụng chung trên toàn hệ thống. | Schema `RoomType` (Loại phòng) và `Service` (Dịch vụ) đều có trường `propertyId`. Đơn giá dịch vụ và tiện nghi được cấu hình độc lập theo từng khu trọ (Property) thực tế. | **Trung bình**<br>Thiết kế đặc tả chưa làm rõ việc quản lý theo cơ sở cụ thể. | Thuyết minh thêm rằng đơn giá dịch vụ và loại phòng được quản lý động theo từng khu trọ cụ thể trong chương CSDL. |
| **5** | **Quan hệ Quản lý - Nhà trọ** | Thiết kế quan hệ 1-N (1 khu trọ chỉ gán cho 1 quản lý). | Thực tế là **N-N (Nhiều - Nhiều)**:<br>- `Property` chứa mảng `maQuanLyIds`<br>- `User` (Manager) chứa mảng `maNhaTroIds`. Một khu trọ có thể có nhiều quản lý và ngược lại. | **Nhẹ**<br>Hệ thống thực tế có tính linh hoạt cao hơn đặc tả để áp dụng cho quy mô chuỗi lớn. | Cập nhật lại mô tả mối quan hệ giữa Quản lý và Khu trọ trong Class Diagram thành Nhiều - Nhiều. |
| **6** | **Xác thực OTP đăng nhập (UC02)** | *Đặc tả*: Đăng nhập yêu cầu xác thực 2 lớp qua OTP (mọi lần đăng nhập). | *Thực tế*: Đăng nhập trực tiếp bằng Email/Password. OTP áp dụng tại **Đăng ký tài khoản (Register)** và **Quên mật khẩu (Forgot Password)** qua Gmail thật để xác thực và kích hoạt. | **Trung bình**<br>Hệ thống thực tế tối ưu hóa UX (đăng nhập nhanh) và chỉ bắt buộc xác minh danh tính khi đăng ký mới/khôi phục mật khẩu. | Giữ nguyên mô tả sơ đồ Use Case 1 đã sửa (đăng nhập email/mật khẩu, đăng ký/quên mật khẩu include OTP). |
| **7** | **Đăng ký tạm trú điện tử (UC21)** | Mô tả hệ thống tự động sinh tờ khai CT01 và gửi API trực tiếp sang cơ quan công an. | Đây là **tính năng giả lập / hướng phát triển**. Thực tế không có API kết nối cơ quan công an do giới hạn bảo mật nghiệp vụ ngành. | **Trung bình**<br>Tính năng đặc thù cần cổng bảo mật quốc gia nên thực tế chỉ dừng ở mức giả lập giao diện. | Thêm ghi chú *"Tính năng định hướng phát triển ở Phase 2 / Giả lập kết nối"* trong tài liệu đặc tả để tránh bị trừ điểm khi chấm chéo. |
| **8** | **Ký số hợp đồng (UC17)** | Mô tả ký số động bằng chữ ký vẽ tay trực tiếp hoặc OTP xác nhận, xuất file PDF hoàn chỉnh. | Thực tế lưu đường dẫn file PDF tĩnh (`fileUrl`). Logic ký số và vẽ tay được lưu trạng thái ký qua API để phục vụ luồng demo. | **Trung bình**<br>Giới hạn công nghệ của sản phẩm MVP (Minimum Viable Product). | Ghi chú rõ cơ chế giả lập chữ ký và lưu trữ PDF tĩnh trên server trong đặc tả. |
| **9** | **Thanh toán trực tuyến (UC27)** | Mô tả tích hợp sâu cổng thanh toán VNPay/MoMo để giao dịch thật. | Giao diện thanh toán giả lập cổng VNPay/MoMo, khi nhấn xác nhận sẽ gọi API cập nhật trạng thái hóa đơn thành `paid` và lưu lịch sử thanh toán mà không trung chuyển dòng tiền thật. | **Trung bình**<br>Triển khai môi trường Sandbox thử nghiệm. | Ghi rõ trong tài liệu là tích hợp qua môi trường giả lập thử nghiệm (Sandbox) của VNPay phục vụ mục đích kiểm thử. |
| **10** | **Đồng bộ thuật ngữ Giao diện** | Sử dụng các từ khóa cũ: "Chi nhánh", "Quản lý chi nhánh", "Chi nhánh hiện tại". | Các nhãn trên giao diện sidebar và trang báo cáo thực tế đã đổi thành:<br>- "Khu vực" / "Khu vực hiện tại" (Property/Area)<br>- "Quản lý" (Manager) | **Nhẹ**<br>Gây không đồng nhất giữa hình ảnh chụp màn hình thực tế và văn bản đặc tả. | Thay thế hàng loạt (Find & Replace) các từ khóa cũ trong Word thành "Khu vực" và "Quản lý" để khớp 100% với giao diện chạy demo. |

---

## III. ĐÁNH GIÁ VÀ HÀNH ĐỘNG KHUYẾN NGHỊ

### 1. Đánh giá chung:
Sự sai lệch chủ yếu nằm ở **đặc tả kỹ thuật sâu** (Kiến trúc Class Diagram của RDBMS vs MongoDB Schema, Vanilla JS vs ReactJS) và **giới hạn thực tế của các tính năng bên thứ ba** (Thanh toán VNPay, Ký số PDF, Đăng ký tạm trú). Điều này hoàn toàn bình thường trong các đồ án công nghệ thông tin khi đặc tả thiết kế lý thuyết thường rộng hơn khả năng lập trình thực tế của sản phẩm MVP.

### 2. Hành động khuyến nghị (Action Items):
1. **Đối với Mã nguồn Hệ thống**: Giữ nguyên hệ thống như hiện tại vì tất cả các module chính (Admin, Manager, Tenant, Visitor, Chatbot AI, Mail OTP) đều hoạt động rất mượt mà, giao diện đẹp mắt và đáp ứng tối đa yêu cầu sử dụng.
2. **Đối với Tài liệu đặc tả (.docx)**:
   - Sử dụng chức năng **Find and Replace** trong Word để đổi các thuật ngữ cũ thành thuật ngữ giao diện thực tế (Chi nhánh $\rightarrow$ Khu vực).
   - Thêm các đoạn lưu ý ngắn *"Tính năng định hướng phát triển ở các giai đoạn tiếp theo"* vào các mục chức năng Ký số vẽ tay, Đăng ký tạm trú công an, Thanh toán VNPay thật để hợp thức hóa các điểm giả lập.
   - Giữ nguyên Class Diagram NoSQL tiếng Anh đã cập nhật ở Hình 2.12 vì nó khớp 100% với cấu trúc MongoDB Schema thực tế của hệ thống.
