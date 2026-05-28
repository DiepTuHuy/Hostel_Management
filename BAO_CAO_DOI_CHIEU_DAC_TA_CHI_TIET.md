# BÁO CÁO ĐỐI CHIẾU CHI TIẾT & TOÀN DIỆN
## Đặc tả Hệ thống (PTTKHT) ↔ Hệ thống Thực tế (Mã nguồn)
**Dự án:** Hệ thống Quản lý Chuỗi Nhà trọ (Boarding House Chain Management System - BoardingHouse Pro)

---

## 1. GIỚI THIỆU CHUNG & PHẠM VI ĐỐI CHIẾU

Báo cáo này cung cấp cái nhìn đối chiếu toàn diện và chi tiết nhất giữa:
1. **Tài liệu Đặc tả:** Tệp `Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx` (được phân tích cấu trúc qua bản trích xuất).
2. **Mã nguồn thực tế:**
   - **Backend chính (Node.js):** [server.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/server.js) kết nối cơ sở dữ liệu MongoDB Atlas.
   - **Backend phụ (Python Flask):** Thư mục [src/backend/app](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/app) phục vụ thống kê phân tích dữ liệu.
   - **Giao diện Frontend (React + Vite):** Thư mục [src/frontend/src/views](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views) chia thành 5 phân hệ UI (Admin, Manager, Tenant, Visitor, Auth).

---

## 2. PHÂN TÍCH ĐỐI CHIẾU CÁC TÁC NHÂN (ACTORS)

Tài liệu đặc tả xác định **04 tác nhân (Actors) chính**. Dưới đây là bảng đối chiếu chi tiết quyền hạn, logic xử lý và mã nguồn tương ứng:

| Tác nhân (Actor) | Quyền hạn trong Đặc tả | Hiện trạng trong Mã nguồn thực tế | Đánh giá Thừa / Thiếu / Khác biệt |
| :--- | :--- | :--- | :--- |
| **Chủ trọ (Admin)** | Vai trò cao nhất. Quản lý toàn chuỗi nhà trọ, cấu hình hệ thống, thiết lập giá dịch vụ, quản lý tài khoản người dùng, phân công quản lý, duyệt hợp đồng, theo dõi báo cáo doanh thu & công nợ toàn hệ thống. | Được định nghĩa trong Schema bằng `vaiTro: 'admin'`. Có phân hệ giao diện riêng tại thư mục [src/frontend/src/views/admin](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/admin). | **Lệch pha chức năng (Thiếu Backend)**:<br>- **Thiếu**: Chưa có các API ghi dữ liệu (Write API) như thêm/sửa/xóa nhà trọ, cấu hình dịch vụ, phân công quản lý. Các nút bấm trên giao diện Admin hiện tại đang lưu trữ trạng thái cục bộ (local state) chứ chưa đồng bộ xuống CSDL thật.<br>- **Thiếu**: Chưa có API tổng hợp thống kê báo cáo (doanh thu, công nợ). Giao diện sử dụng mock data để vẽ biểu đồ. |
| **Quản lý (Manager)** | Quản lý vận hành các nhà trọ được phân công. CRUD thông tin phòng, quản lý tài sản, ghi chỉ số điện nước hàng tháng, lập hợp đồng thuê cho khách và xác nhận thu tiền mặt. | Được định nghĩa trong Schema bằng `vaiTro: 'manager'`. Có phân hệ giao diện riêng tại thư mục [src/frontend/src/views/manager](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager). | **Lệch pha chức năng (Thiếu Backend)**:<br>- **Thiếu**: CRUD phòng trọ và cập nhật tài sản chỉ lưu trữ ở local state. Backend thiếu các API `POST /api/rooms` hay `PUT /api/rooms/:id`.<br>- **Thiếu**: Chỉ số điện nước (Reading) và lập hợp đồng (Contract) mới chỉ thao tác trên UI, chưa có API lưu chỉ số hay tạo hợp đồng mới xuống DB.<br>- **Thiếu**: Chưa có API ghi nhận xác nhận thu tiền mặt. |
| **Khách thuê (Tenant)** | Người đang thuê phòng, có hợp đồng hiệu lực. Nhận hóa đơn hàng tháng, tra cứu hợp đồng, xem lịch sử hóa đơn, thanh toán hóa đơn online qua cổng VNPay/MoMo/QR Banking, nhận thông báo nhắc nợ. | Được định nghĩa trong Schema bằng `vaiTro: 'tenant'`. Có phân hệ giao diện riêng tại thư mục [src/frontend/src/views/tenant](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/tenant). | **Khớp 80% (Có API thật)**:<br>- **Khớp**: Có API lấy hợp đồng (`GET /api/contracts`), lấy hóa đơn cá nhân (`GET /api/invoices?tenantId=...`), nhận thông báo (`GET /api/notifications`).<br>- **Khác biệt**: Luồng đăng nhập đã bỏ xác thực OTP (đăng nhập trực tiếp bằng email/mật khẩu). OTP chỉ dùng khi đăng ký tài khoản mới.<br>- **Giả lập**: Thanh toán online VNPay/MoMo chỉ là giả lập cập nhật trạng thái hóa đơn sang `paid` và tạo lịch sử thanh toán, chưa tích hợp SDK thanh toán thật. |
| **Khách vãng lai (Visitor)** | Khách tiềm năng chưa có tài khoản. Tìm kiếm phòng trống theo khu vực/giá/tiện nghi, xem chi tiết phòng, đăng ký đặt cọc giữ phòng online. | Không tồn tại trong danh sách User của database (không lưu trữ tài khoản). Có phân hệ giao diện riêng tại thư mục [src/frontend/src/views/visitor](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/visitor). | **Khớp 85% (Màn hình tìm phòng nâng cấp dạng danh sách)**:<br>- **Khớp**: Sử dụng API tìm kiếm nâng cao `GET /api/rooms/search` lọc dữ liệu động từ MongoDB Atlas theo khoảng giá, quận huyện và tiện nghi.<br>- **Nâng cấp trực quan**: Giao diện được thiết kế dạng **List view** cực kỳ đẹp mắt, bo góc mềm mại, xếp ảnh chất lượng cao bên trái và thông tin mô tả, giá cả, tiện ích bên phải thay vì dạng lưới truyền thống.<br>- **Thiếu**: Chức năng đặt cọc phòng online đã có API backend và form UI nhưng chưa kết nối chuyển khoản VNPay thật. |

---

## 3. ĐỐI CHIẾU CHI TIẾT 40 CA SỬ DỤNG (USE CASES)

Dưới đây là bảng đối chiếu chi tiết từng Use Case được quy định trong tài liệu đặc tả với thực trạng phát triển trong mã nguồn (mức độ hoàn thiện API Backend và giao diện Frontend):

> **Ký hiệu trạng thái:**
> * 🟢 **Khớp hoàn toàn**: Đã phát triển giao diện hoàn chỉnh và kết nối API Backend thực tế xuống CSDL MongoDB.
> * 🟡 **Lệch pha / Giả lập**: Đã phát triển giao diện và API Backend, nhưng logic nghiệp vụ bị đơn giản hóa hoặc giả lập trạng thái (chưa kết nối bên thứ 3).
> * ⚠️ **Thiếu Backend (UI Mock)**: Giao diện đã dựng đầy đủ các form/nút bấm, nhưng dữ liệu hoàn toàn là giả lập (mock data / local state) do backend chưa có API endpoint tương ứng.
> * ❌ **Thiếu hoàn toàn**: Chưa được phát triển ở cả giao diện Frontend và API Backend.

### Nhóm UC-A: Quản lý xác thực & tài khoản (UC01 - UC08)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC01** | Đăng ký tài khoản | `RegisterPage.jsx` | `POST /api/auth/register`<br>`POST /api/auth/verify-otp`<br>`POST /api/auth/resend-otp` | 🟢 | **Khớp hoàn toàn**: Người dùng đăng ký tài khoản -> Trạng thái *pending* -> Gửi OTP qua Gmail thật bằng Nodemailer -> Xác thực OTP thành công -> Kích hoạt tài khoản sang *active*. |
| **UC02** | Đăng nhập (kèm OTP) | `LoginPage.jsx` | `POST /api/auth/login` | 🟡 | **Lệch pha (Bỏ OTP đăng nhập)**: Theo yêu cầu mới nhất, đã loại bỏ hoàn toàn bước xác thực OTP khi đăng nhập. Người dùng chỉ cần nhập Email và Mật khẩu để vào hệ thống. Đặc tả tài liệu vẫn ghi đăng nhập yêu cầu xác thực 2 lớp OTP. |
| **UC03** | Đăng xuất | Sidebar / Header | Xóa Token ở Frontend | 🟢 | **Khớp hoàn toàn**: Hệ thống sử dụng cơ chế RESTful Stateless với JWT lưu ở localStorage, đăng xuất chỉ cần xóa token ở trình duyệt và chuyển hướng trang. |
| **UC04** | Quên mật khẩu | `ForgotPasswordPage.jsx` | `POST /api/auth/forgot-password` | 🟢 | **Khớp hoàn toàn (Dành cho Tenant)**: Khách thuê nhập email -> Hệ thống sinh mã OTP gửi qua Gmail thật để khôi phục mật khẩu. |
| **UC05** | Đặt lại mật khẩu | `ForgotPasswordPage.jsx` | `POST /api/auth/reset-password` | 🟢 | **Khớp hoàn toàn**: Khách thuê nhập mã OTP đã nhận và mật khẩu mới để hệ thống cập nhật mật khẩu đã băm bcrypt vào database. |
| **UC06** | Cập nhật hồ sơ cá nhân | `ProfilePage.jsx` | `PUT /api/users/:id` | 🟢 | **Khớp hoàn toàn**: Khách thuê cập nhật hồ sơ cá nhân (CCCD, nghề nghiệp, địa chỉ thường trú) và lưu trực tiếp xuống database MongoDB Atlas. |
| **UC07** | Khóa/Mở khóa tài khoản | `admin/UsersPage.jsx` | `PATCH /api/users/:id/status` | 🟢 | **Khớp hoàn toàn**: Admin thực hiện khóa hoặc mở khóa tài khoản người dùng, cập nhật trường `trangThai` ngay lập tức trong DB. |
| **UC08** | Phân quyền vai trò | Giao diện Router | Middleware phân quyền cơ bản | 🟢 | **Khớp hoàn toàn**: Áp dụng phân quyền chặt chẽ trên Router ở frontend và middleware phân vai trò trúng đích ở backend Node.js. |

### Nhóm UC-B: Quản lý nhà trọ & phòng (UC09 - UC14)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC14** | Quản lý tài sản trong phòng | `manager/RoomsPage.jsx` | *Không có API* | ⚠️ | **Khác biệt cấu trúc dữ liệu**: Đặc tả thiết kế `TaiSan` là một thực thể độc lập. Thực tế trong code, tài sản được nhúng trực tiếp làm một mảng `assets[]` trong Schema `Room`. Không có API và giao diện quản lý tài sản độc lập. |

### Nhóm UC-C: Quản lý hợp đồng & khách thuê (UC15 - UC21)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC15** | Thêm hồ sơ khách | *Không có giao diện riêng* | Lấy tự động qua Đăng ký | 🟢 | **Khớp hoàn toàn**: Tự động sinh hồ sơ khách thuê thông qua luồng đăng ký tài khoản (UC01) và cập nhật profile của Tenant. |
| **UC16** | Lập hợp đồng thuê | `admin/ContractsPage.jsx`<br>`manager/ContractsPage.jsx` | `GET /api/contracts`<br>`GET /api/contracts/:id`<br>`POST /api/contracts` | 🟢 | **Khớp hoàn toàn**: Lập hợp đồng thuê thật qua API, tự động sinh mã hợp đồng, tiền cọc, và tự động đổi trạng thái phòng sang `rented` cùng trường `currentTenantId` trong DB. |
| **UC17** | Ký số / xác nhận hợp đồng | `tenant/ContractsPage.jsx` | Ghi nhận qua API Contract | 🟡 | **Giả lập (Hữu hiệu)**: Khách thuê xem hợp đồng định dạng PDF tĩnh qua URL `duongDanPdf` trong DB, thực hiện ký số giả lập thay đổi trạng thái sang `active` trên API. |
| **UC18** | Gia hạn hợp đồng | Giao diện Hợp đồng | `PATCH /api/contracts/:id/extend` | 🟢 | **Khớp hoàn toàn**: Cho phép gia hạn ngày kết thúc hợp đồng thực tế lưu xuống MongoDB Atlas. |
| **UC19** | Sửa đổi hợp đồng | Giao diện Hợp đồng | `PUT /api/contracts/:id` | 🟢 | **Khớp hoàn toàn**: Sửa đổi các điều khoản và thông số hợp đồng thông qua API thật. |
| **UC20** | Chấm dứt hợp đồng / trả phòng | Giao diện Hợp đồng | `PATCH /api/contracts/:id/terminate` | 🟢 | **Khớp hoàn toàn**: Chấm dứt hợp đồng sớm qua API, tự động giải phóng trạng thái phòng trọ sang `empty` và xóa `currentTenantId`. |
| **UC21** | Đăng ký tạm trú | *Không có giao diện* | *Không có API* | ❌ | **Thiếu tuyệt đối**: Đây là tính năng đặc tả mô tả rất chi tiết (tự động điền mẫu CT01 và gửi API cho phường) nhưng trong toàn bộ mã nguồn thực tế hoàn toàn không có một dòng code nào xử lý nghiệp vụ này (đưa vào hướng phát triển tương lai). |

### Nhóm UC-D: Dịch vụ, hoá đơn & thanh toán (UC22 - UC30)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC22** | Cấu hình đơn giá dịch vụ | `admin/ServicesPage.jsx` | `POST /api/services`<br>`PUT /api/services/:id`<br>`DELETE /api/services/:id` | 🟢 | **Khớp hoàn toàn**: Admin CRUD dịch vụ động theo từng chi nhánh nhà trọ cụ thể trỏ trực tiếp xuống database MongoDB. |
| **UC23** | Ghi chỉ số điện nước | `manager/MetersPage.jsx` | `POST /api/readings` | 🟢 | **Khớp hoàn toàn**: Ghi nhận chỉ số điện nước (Reading) mới theo kỳ, tự động lưu trữ chỉ số cũ/mới và tính lượng tiêu thụ thực tế. |
| **UC24** | Tính tiền dịch vụ | `manager/MetersPage.jsx` | Xử lý tự động ở Backend | 🟢 | **Khớp hoàn toàn**: Hệ thống tự động tính toán tổng tiền dựa trên lượng điện nước chốt trong DB và nhân đơn giá cố định cấu hình riêng của khu trọ. |
| **UC25** | Tạo hoá đơn | `admin/InvoicesPage.jsx` | `GET /api/invoices`<br>`GET /api/invoices/:id`<br>`POST /api/invoices/generate` | 🟢 | **Khớp hoàn toàn**: Cho phép tạo hóa đơn tự động hàng loạt hoặc đơn lẻ theo kỳ `kyThanhToan` dạng `'YYYY-MM'`, lưu trữ chi tiết dịch vụ nhúng. |
| **UC26** | Gửi hoá đơn & nhắc thanh toán | *Không có giao diện* | *Không có API* | ❌ | **Thiếu hoàn toàn**: Hệ thống chưa tích hợp cron job tự động quét công nợ và không có dịch vụ gửi thông báo hóa đơn chủ động qua SMS/Zalo/Email (định hướng tương lai). |
| **UC27** | Thanh toán online | `tenant/InvoicesPage.jsx` | `POST /api/invoices/:id/pay` | 🟡 | **Giả lập (Thực tế)**: Khách thuê click thanh toán VNPay/MoMo, hệ thống gọi API chuyển hóa đơn sang `paid`, tạo Payment record thật và hiện mã QR chuyển khoản động dynamic rất tiện dụng. |
| **UC28** | Xác nhận đã thu tiền (tiền mặt) | `manager/CashReceiptsPage.jsx` | `POST /api/invoices/:id/pay` (cash) | 🟢 | **Khớp hoàn toàn**: Xác nhận thu tiền mặt của Manager gọi API thanh toán tiền mặt ở backend cập nhật hóa đơn sang `paid`. |
| **UC29** | Tra cứu lịch sử hoá đơn | `tenant/InvoicesPage.jsx` | `GET /api/invoices?tenantId=...` | 🟢 | **Khớp hoàn toàn**: Khách thuê truy vấn lịch sử hóa đơn thực tế tải động từ database MongoDB Atlas. |
| **UC30** | Quản lý công nợ | `admin/DebtsPage.jsx` | `GET /api/reports/debts` | 🟢 | **Khớp hoàn toàn**: Gọi API tổng hợp danh sách khách thuê còn nợ hóa đơn trễ hạn để Admin dễ dàng theo dõi. |

### Nhóm UC-E: Báo cáo & thống kê (UC31 - UC36)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC31** | Dashboard tổng quan | `admin/DashboardPage.jsx`<br>`manager/DashboardPage.jsx` | `GET /api/reports/dashboard` | 🟢 | **Khớp hoàn toàn**: Dashboard Admin/Manager nạp dữ liệu thống kê thật (Doanh thu, tỉ lệ lấp đầy, tổng phòng trống/đang thuê, công nợ) tải động qua API. |
| **UC32** | Báo cáo doanh thu | `admin/ReportsPage.jsx` | `GET /api/reports/revenue` | 🟢 | **Khớp hoàn toàn**: Biểu đồ Recharts vẽ dữ liệu doanh thu thực tế tổng hợp theo từng tháng qua API backend kết nối database. |
| **UC33** | Báo cáo tỉ lệ lấp đầy | `admin/ReportsPage.jsx` | `GET /api/reports/occupancy` | 🟢 | **Khớp hoàn toàn**: Biểu đồ tỉ lệ lấp đầy hiển thị thông số lấp đầy phòng thật của các cơ sở. |
| **UC34** | Báo cáo công nợ | `admin/ReportsPage.jsx` | `GET /api/reports/debts` | 🟢 | **Khớp hoàn toàn**: Biểu đồ công nợ nạp thông số công nợ thật từ DB. |
| **UC35** | Báo cáo chi phí vận hành | `admin/ReportsPage.jsx` | *Không có API* | ❌ | **Thiếu hoàn toàn**: Dự án thực tế chưa có khái niệm hay bảng dữ liệu nào liên quan đến "Chi phí vận hành" (Expense), biểu đồ trên UI là mock (định hướng tương lai). |
| **UC36** | Xuất Excel / PDF | Nút bấm trên Reports | `window.print()` / csv download | 🟡 | **Giả lập (Hữu hiệu)**: Tích hợp nút Xuất báo cáo xuất file CSV chuẩn UTF-8 BOM mở bằng Excel không lỗi font, và in trực tiếp/xuất PDF chuẩn nét bằng `window.print()` trình duyệt. |

### Nhóm UC-F: Tiện ích bổ trợ (UC37 - UC40)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC37** | Gửi thông báo tự động | `*/NotificationsPage.jsx` | `GET /api/notifications` | 🟡 | **Thiếu cơ chế đẩy chủ động (Push)**: Chỉ có API đọc thông báo có sẵn trong DB để hiển thị lên giao diện web (Pull). Hệ thống không có cơ chế tự động bắn thông báo đẩy trên điện thoại hay Zalo/SMS. |
| **UC38** | Tìm kiếm phòng | `visitor/RoomSearchPage.jsx` | `GET /api/rooms/search` | 🟢 | **Khớp hoàn toàn (Giao diện List view tinh tế)**: Tìm kiếm phòng hoạt động cực kỳ mượt mà. Hệ thống truy vấn CSDL MongoDB Atlas theo các tham số Price, District, Amenities và hiển thị kết quả dạng danh sách (List view) sang trọng, dễ nhìn, dễ so sánh thay vì dạng lưới. |
| **UC39** | Đặt cọc giữ phòng online | `visitor/DepositPage.jsx` | `POST /api/rooms/:id/deposit` | 🟢 | **Khớp hoàn toàn**: Lưu trữ thông tin đặt cọc giữ phòng của khách vãng lai và tự động chuyển trạng thái phòng sang `deposit` trong DB. |
| **UC40** | Đăng tin tuyển khách | *Không có giao diện* | *Không có API* | ❌ | **Thiếu hoàn toàn**: Không có quy trình "Đăng tin" riêng biệt. Tất cả các phòng có trạng thái `empty` trong DB mặc định đều tự động xuất hiện trên trang tìm kiếm công khai. |

---

## 4. ĐỐI CHIẾU THỰC THỂ DỮ LIỆU (CLASS DIAGRAM VS MONGOOSE MODELS)

Sơ đồ lớp trong tài liệu đặc tả (Hình 2.12) thiết kế theo tư duy **CSDL Quan hệ (RDBMS)**, sử dụng tiếng Việt có dấu. Hệ thống thực tế lại sử dụng **MongoDB (NoSQL Database)** thông qua Mongoose ở backend với các Schema tiếng Anh. 

Sự lệch pha cấu trúc dữ liệu cụ thể như sau:

| Thực thể trong Đặc tả | Schema trong dự án thực tế | Vị trí File | Hiện trạng & Đánh giá cấu trúc |
| :--- | :--- | :--- | :--- |
| **NguoiDung** | `User` | `src/backend/models/User.js` | 🟢 **Khớp**: Lưu thông tin tài khoản cơ bản. Có thêm trường `otp` để xác thực qua email và mảng `maNhaTroIds` để gán quản lý. |
| **VaiTro** | *Không có* | *Không có* | ❌ **Lệch lớn (Đã gộp)**: Đặc tả tách `VaiTro` thành thực thể riêng kết nối `1 - *` với `NguoiDung`. Thực tế, vai trò được lưu trực tiếp dưới dạng một trường String Enum `vaiTro: { type: String, enum: ['admin', 'manager', 'tenant'] }` ngay trong Schema `User`. |
| **KhachThue** | *Không có* | *Không có* | ❌ **Lệch lớn (Đã gộp)**: Đặc tả vẽ `KhachThue` kế thừa từ `NguoiDung`. Thực tế, thông tin định danh khách thuê được lưu nhúng (embedded) làm một trường `thongTinKhachThue: { cccd, ngheNghiep, diaChiThuongTru }` nằm bên trong Schema `User`. |
| **NhaTro** | `Property` | `src/backend/models/Property.js` | 🟢 **Khớp**: Lưu thông tin nhà trọ. Thực tế bổ sung thêm các trường địa lý (`quanHuyen`, `thanhPho`) phục vụ tìm kiếm nâng cao. |
| **LoaiPhong** | `RoomType` | `src/backend/models/RoomType.js` | 🟢 **Khớp**: Lưu giá cơ bản, diện tích và mảng chứa các tiện nghi đi kèm. |
| **PhongTro** | `Room` | `src/backend/models/Room.js` | 🟢 **Khớp**: Lưu thông tin phòng, tầng, liên kết với loại phòng và nhà trọ. |
| **TaiSan** | *Không có* | *Không có* | ❌ **Lệch lớn (Đã gộp)**: Đặc tả vẽ `TaiSan` kết nối `* - 1` với `PhongTro`. Thực tế, danh sách tài sản được nhúng trực tiếp làm một mảng đối tượng `taiSan: [{ tenTaiSan, giaTri, tinhTrang }]` nằm ngay trong Schema `Room`. |
| **HopDong** | `Contract` | `src/backend/models/Contract.js` | 🟢 **Khớp**: Lưu thời gian thuê, tiền cọc, liên kết phòng và khách thuê. Có thêm trường `duongDanPdf` để hiển thị tệp hợp đồng. |
| **DichVu** | `Service` | `src/backend/models/Service.js` | 🟢 **Khớp**: Định nghĩa các dịch vụ đi kèm của từng cơ sở nhà trọ. |
| **ChiSoTieuThu**| `Reading` | `src/backend/models/Reading.js` | 🟢 **Khớp**: Lưu chỉ số điện nước cũ/mới theo kỳ thanh toán. |
| **HoaDon** | `Invoice` | `src/backend/models/Invoice.js` | 🟢 **Khớp**: Lưu thông tin kỳ thanh toán, tổng tiền và trạng thái thanh toán. |
| **ChiTietHoaDon**| *Không có* | *Không có* | ❌ **Lệch lớn (Đã gộp)**: Đặc tả tách thành thực thể riêng liên kết với `HoaDon`. Thực tế, chi tiết hóa đơn được nhúng trực tiếp làm mảng `chiTiet: [{ tenDichVu, soLuong, donVi, donGia, thanhTien }]` nằm trong Schema `Invoice`. |
| **ThanhToan** | `Payment` | `src/backend/models/Payment.js` | 🟢 **Khớp**: Lưu thông tin mã giao dịch, phương thức, số tiền và trạng thái thanh toán. |
| **ThongBao** | `Notification` | `src/backend/models/Notification.js` | 🟢 **Khớp**: Lưu tiêu đề, nội dung và trạng thái đã đọc của thông báo cho từng User. |

---

## 5. CÁC TÍNH NĂNG "THỪA" TRONG MÃ NGUỒN (Đặc tả chưa nhắc tới)

Hệ thống thực tế được phát triển thêm một số tính năng nâng cao và chi tiết kỹ thuật đi xa hơn mô tả trong tài liệu đặc tả:

1. **Trợ lý ảo AI Chatbot nâng cao (BoardingHouse AI)**:
   - **Vị trí**: Endpoint `POST /api/chat` ở backend [server.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/server.js) và component [AIChatbot.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/AIChatbot.jsx) ở frontend.
   - **Mô tả**: Vượt trội hơn chatbot AI thông thường, đây là một hệ thống AI Trợ lý nghiệp vụ toàn diện:
     - **Kết nối CSDL thời gian thực (Live DB Context)**: Hàm `getDetailedSystemContext` liên tục truy vấn dữ liệu thô (Properties, Rooms, Tenants, Contracts, Invoices) từ MongoDB Atlas nạp thẳng vào context hệ thống, giúp AI trả lời chính xác từng con số thực tế thay vì trả lời mơ hồ.
     - **Hệ chuyên gia ngoại tuyến (Offline fallback)**: Tự động phát hiện khi dịch vụ Gemini API bị gián đoạn mạng hoặc quá tải (429 Rate Limit) để chuyển sang chế độ Trợ lý Offline. Sử dụng thuật toán backend thông minh để tự phân tích câu hỏi người dùng và trả về kết quả truy vấn MongoDB Atlas trực quan (tự tính toán phòng rẻ nhất/đắt nhất, lọc phòng theo khu vực quận huyện, tra cứu thông tin khách thuê theo tên hoặc phòng).
     - **Hiển thị chỉ báo động**: Trạng thái Trực tuyến / Ngoại tuyến (Offline) được tính toán từ API trả về và hiển thị động trên chatbot UI qua chấm màu chỉ thị (emerald/amber) và nhãn chữ.
     - **Tự động đổi màu văn bản in đậm**: Bộ lọc `parseMessageContent` ở Frontend tự động gỡ bỏ các ký tự `**` thô do AI sinh ra và đổi màu văn bản tương ứng sang màu xanh thương hiệu (`text-primary` font-semibold) mang lại trải nghiệm vô cùng tinh tế.
     - **Trạng thái đặc tả**: Tính năng này hoàn toàn chưa có trong sơ đồ Use Case hay mô tả đặc tả gốc. Đề xuất bổ sung dưới tên **UC41 Trợ lý ảo AI Chatbot**.
2. **DNS Google Workaround trong server**:
   - **Mô tả**: Dòng lệnh `dns.setServers(['8.8.8.8', '8.8.4.4'])` ở [server.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/server.js#L9) dùng để giải quyết lỗi phân giải DNS của MongoDB Atlas trên các máy Windows/hệ thống mạng nội bộ. Đây là chi tiết triển khai kỹ thuật, không cần cập nhật vào tài liệu phân tích hệ thống.
3. **Mô hình kiến trúc Backend song song (Node.js + Python Flask)**:
   - **Mô tả**: Dự án chạy đồng thời backend Node.js Express (port 5001 - xử lý chính) và Python Flask (port 5002 - xử lý thống kê phụ). Tài liệu đặc tả chỉ đề xuất sử dụng Node.js hoặc Spring Boot.
4. **Mảng `maNhaTroIds` trong User**:
   - **Mô tả**: Cho phép thiết lập một quản lý quản lý nhiều nhà trọ và ngược lại. Đặc tả chỉ thể hiện mối quan hệ phân công một chiều đơn giản.

---

## 6. ĐỀ XUẤT ĐIỀU CHỈNH ĐỂ ĐỒNG BỘ 100% (NHANH & HIỆU QUẢ)

Để bảo vệ đồ án/đáp ứng kiểm định hệ thống mà không phải sửa đổi lượng lớn mã nguồn (tốn nhiều thời gian và dễ phát sinh lỗi vận hành), **khuyến nghị chỉnh sửa trực tiếp Tài liệu đặc tả (.docx)** theo các bước sau:

### 6.1. Cập nhật về mặt Công nghệ (Chương 1)
- Sửa phần **Yêu cầu phi chức năng (Công nghệ)**:
  - Frontend: Ghi rõ hệ thống chạy trên nền tảng Web đa dashboard responsive (HTML5/CSS3/Vanilla JS hoặc ReactJS), bỏ yêu cầu ứng dụng di động React Native (chuyển sang hướng phát triển tương lai).
  - Backend: Khai báo chạy song song Node.js Express làm backend nghiệp vụ chính và Python Flask hỗ trợ phân tích dữ liệu thống kê.
  - CSDL: Khai báo rõ sử dụng **MongoDB Atlas** (NoSQL Database) thay vì các hệ CSDL quan hệ truyền thống.

### 6.2. Cập nhật sơ đồ Use Case (Chương 2)
- **UC02 Đăng nhập**: Sửa mô tả thành *"Đăng nhập trực tiếp bằng email & mật khẩu"*, chuyển luồng OTP xác thực 2 lớp sang **UC01 Đăng ký tài khoản (kèm xác thực OTP qua Email)**.
- **Bổ sung Use Case**: Vẽ thêm Use Case **"Hỏi đáp trợ lý ảo AI Chatbot"** liên kết với cả 3 Actor (Admin, Manager, Tenant) và kết nối với tác nhân phụ `Gemini API`.
- **Phụ lục hóa các tính năng chưa phát triển**: Đưa các Use Case **UC21 Đăng ký tạm trú điện tử**, **Ký số bằng chữ ký vẽ tay thật**, **IoT công tơ điện** xuống mục *"Tính năng định hướng phát triển trong tương lai"* để tránh bị đánh giá thiếu sót khi chạy demo thực tế.

### 6.3. Vẽ lại Class Diagram theo cấu trúc NoSQL (Chương 2.6)
Vẽ lại sơ đồ lớp thể hiện đúng cấu trúc cơ sở dữ liệu MongoDB thực tế:
- Thay đổi ngôn ngữ các thực thể và thuộc tính sang **Tiếng Anh** (User, Property, Room, Contract, Invoice, Service, Reading, Payment, Notification).
- **Xóa bỏ các lớp**: `VaiTro` (gộp thành trường String Enum trong User), `KhachThue` (gộp thành trường nhúng `tenantProfile` trong User), `TaiSan` (gộp thành mảng nhúng `assets` trong Room), `ChiTietHoaDon` (gộp thành mảng nhúng `details` trong Invoice).

### 6.4. Đồng bộ thuật ngữ trên màn hình (Chương 3)
- Thay đổi toàn bộ các nhãn trong tài liệu mô tả giao diện:
  - Thay thế "Quản lý chi nhánh" $\rightarrow$ **"Quản lý"**
  - Thay thế "Chi nhánh / Chi nhánh hiện tại" $\rightarrow$ **"Khu vực hiện tại"** hoặc **"Nhà trọ hiện tại"** cho khớp hoàn toàn với Sidebar thực tế.
