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
| **Khách vãng lai (Visitor)** | Khách tiềm năng chưa có tài khoản. Tìm kiếm phòng trống theo khu vực/giá/tiện nghi, xem chi tiết phòng, đăng ký đặt cọc giữ phòng online. | Không tồn tại trong danh sách User của database (không lưu trữ tài khoản). Có phân hệ giao diện riêng tại thư mục [src/frontend/src/views/visitor](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/visitor). | **Khớp 70% (Có API tìm kiếm phòng thật)**:<br>- **Khớp**: Sử dụng API tìm kiếm nâng cao `GET /api/rooms/search` lọc dữ liệu động từ MongoDB Atlas theo khoảng giá, quận huyện và tiện nghi.<br>- **Thiếu**: Chức năng đặt cọc phòng online mới chỉ dừng ở mức giao diện nhập liệu, chưa có API lưu thông tin đặt cọc và tự động chuyển trạng thái phòng sang "Đặt cọc". |

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
| **UC06** | Cập nhật hồ sơ cá nhân | `ProfilePage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Trang cập nhật hồ sơ khách thuê mới chỉ hoạt động trên local state của React, backend hoàn toàn thiếu API `PUT /api/users/:id`. |
| **UC07** | Khóa/Mở khóa tài khoản | `admin/UsersPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Giao diện Admin có nút bấm và hiển thị trạng thái khóa tài khoản nhưng không đồng bộ xuống database do thiếu API. |
| **UC08** | Phân quyền vai trò | Giao diện Router | Middleware phân quyền cơ bản | 🟡 | **Lệch pha nhẹ**: Frontend phân chia quyền truy cập qua Router. Tuy nhiên, ở backend chưa áp dụng các middleware kiểm tra quyền (Role-based Access Control - RBAC) nghiêm ngặt cho từng đầu API. |

### Nhóm UC-B: Quản lý nhà trọ & phòng (UC09 - UC14)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC09** | Thêm/sửa/ngừng nhà trọ | `admin/PropertiesPage.jsx` | `GET /api/properties`<br>`GET /api/properties/:id` | ⚠️ | **Thiếu CRUD Backend**: Chỉ hỗ trợ API đọc danh sách và chi tiết nhà trọ. Chức năng Thêm/Sửa/Ngừng hoạt động nhà trọ chỉ được mock ở local state của frontend. |
| **UC10** | Phân công quản lý | `admin/PropertiesPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Nút phân công quản lý cho cơ sở trên giao diện Admin chỉ thay đổi trạng thái tạm thời trên React, chưa cập nhật vào CSDL thực tế. |
| **UC11** | Quản lý loại phòng & tiện nghi | *Không có giao diện* | *Không có API* | ❌ | **Thiếu hoàn toàn**: Model `RoomType.js` có trong database nhưng không có giao diện thiết lập cũng như API CRUD tương ứng. Dự án đang sử dụng dữ liệu loại phòng được seed sẵn. |
| **UC12** | CRUD phòng trọ | `manager/RoomsPage.jsx` | `GET /api/rooms`<br>`GET /api/rooms/:id` | ⚠️ | **Thiếu CRUD Backend**: Chỉ có API lấy danh sách phòng. Thêm, sửa, xóa phòng trọ của Manager chỉ lưu ở local state. |
| **UC13** | Cập nhật trạng thái phòng | `manager/RoomsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Cập nhật trạng thái phòng (trống, đặt cọc, đang thuê, bảo trì) chỉ diễn ra cục bộ trên màn hình Rooms. |
| **UC14** | Quản lý tài sản trong phòng | `manager/RoomsPage.jsx` | *Không có API* | ⚠️ | **Khác biệt cấu trúc dữ liệu**: Đặc tả thiết kế `TaiSan` là một thực thể độc lập. Thực tế trong code, tài sản được nhúng trực tiếp làm một mảng `assets[]` trong Schema `Room`. Không có API và giao diện quản lý tài sản độc lập. |

### Nhóm UC-C: Quản lý hợp đồng & khách thuê (UC15 - UC21)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC15** | Thêm hồ sơ khách | *Không có giao diện riêng* | *Không có API riêng* | 🟡 | **Lấy từ luồng Đăng ký**: Không có chức năng tạo hồ sơ khách thuê độc lập từ phía Manager. Hồ sơ khách thuê được tạo tự động khi khách thuê tự đăng ký tài khoản (UC01) và điền thông tin profile. |
| **UC16** | Lập hợp đồng thuê | `admin/ContractsPage.jsx`<br>`manager/ContractsPage.jsx` | `GET /api/contracts`<br>`GET /api/contracts/:id` | ⚠️ | **Thiếu Backend**: Chỉ có API đọc danh sách hợp đồng. Form lập hợp đồng mới của Admin/Manager hoàn toàn là mock dữ liệu ở frontend. |
| **UC17** | Ký số / xác nhận hợp đồng | `tenant/ContractsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend (Giả lập)**: Khách thuê chỉ xem được file PDF hợp đồng tĩnh qua URL tĩnh có sẵn trong DB (`duongDanPdf`). Quy trình xác nhận ký số bằng OTP hay chữ ký vẽ tay chưa được lập trình. |
| **UC18** | Gia hạn hợp đồng | Giao diện Hợp đồng | *Không có API* | ⚠️ | **Thiếu Backend**: Nút gia hạn hợp đồng trên giao diện chỉ là giả lập. |
| **UC19** | Sửa đổi hợp đồng | Giao diện Hợp đồng | *Không có API* | ⚠️ | **Thiếu Backend**: Tính năng sửa đổi điều khoản hợp đồng chỉ là mock. |
| **UC20** | Chấm dứt hợp đồng / trả phòng | Giao diện Hợp đồng | *Không có API* | ⚠️ | **Thiếu Backend**: Trả phòng và kết thúc hợp đồng chưa có API để cập nhật trạng thái phòng thành trống và tất toán hợp đồng. |
| **UC21** | Đăng ký tạm trú | *Không có giao diện* | *Không có API* | ❌ | **Thiếu tuyệt đối**: Đây là tính năng đặc tả mô tả rất chi tiết (tự động điền mẫu CT01 và gửi API cho phường) nhưng trong toàn bộ mã nguồn thực tế hoàn toàn không có một dòng code nào xử lý nghiệp vụ này. |

### Nhóm UC-D: Dịch vụ, hoá đơn & thanh toán (UC22 - UC30)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC22** | Cấu hình đơn giá dịch vụ | `admin/ServicesPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Model `Service.js` tồn tại ở database nhưng không có endpoint API để CRUD dịch vụ. Trang Services của Admin hoàn toàn chạy bằng mock dữ liệu. |
| **UC23** | Ghi chỉ số điện nước | `manager/MetersPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Model `Reading.js` có sẵn nhưng không có API endpoint. Giao diện ghi chỉ số điện nước và tính tiền của Manager hoạt động hoàn toàn bằng local state của React. |
| **UC24** | Tính tiền dịch vụ | `manager/MetersPage.jsx` | *Không có API* | ⚠️ | **Khác biệt (Không có đơn giá bậc thang EVN)**: Đặc tả yêu cầu tính tiền điện nước theo đơn giá bậc thang EVN. Thực tế hệ thống đang tính theo đơn giá cố định trên giao diện Frontend. |
| **UC25** | Tạo hoá đơn | `admin/InvoicesPage.jsx` | `GET /api/invoices`<br>`GET /api/invoices/:id` | ⚠️ | **Thiếu Backend**: Chỉ hỗ trợ đọc hóa đơn có sẵn. Nút "Tạo hóa đơn hàng loạt" hoặc tạo thủ công trên UI chỉ hoạt động giả lập trên React state. |
| **UC26** | Gửi hoá đơn & nhắc thanh toán | *Không có giao diện* | *Không có API* | ❌ | **Thiếu hoàn toàn**: Hệ thống chưa tích hợp cron job tự động quét công nợ và không có dịch vụ gửi thông báo hóa đơn chủ động qua SMS/Zalo/Email. |
| **UC27** | Thanh toán online | `tenant/InvoicesPage.jsx` | `POST /api/invoices/:id/pay` | 🟡 | **Giả lập**: Khách thuê bấm nút thanh toán VNPay/MoMo -> Hệ thống gọi API chuyển trạng thái hóa đơn thành `paid` và tạo bản ghi lịch sử `Payment` để hoàn tất giả lập, chưa kết nối trực tiếp với cổng thanh toán thật. |
| **UC28** | Xác nhận đã thu tiền (tiền mặt) | `manager/CashReceiptsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Giao diện xác nhận thu tiền mặt của Manager chỉ là thay đổi trạng thái hiển thị cục bộ, không gửi API cập nhật hóa đơn. |
| **UC29** | Tra cứu lịch sử hoá đơn | `tenant/InvoicesPage.jsx` | `GET /api/invoices?tenantId=...` | 🟢 | **Khớp hoàn toàn**: Khách thuê truy cập trang hóa đơn -> Hệ thống truy vấn toàn bộ lịch sử hóa đơn thực tế của khách từ MongoDB Atlas và hiển thị chi tiết. |
| **UC30** | Quản lý công nợ | `admin/DebtsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Trang theo dõi công nợ của Admin tự động tính toán tổng số tiền nợ dựa trên danh sách hóa đơn thô lấy về trình duyệt, không có API quản lý công nợ chuyên biệt. |

### Nhóm UC-E: Báo cáo & thống kê (UC31 - UC36)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC31** | Dashboard tổng quan | `admin/DashboardPage.jsx`<br>`manager/DashboardPage.jsx` | *Không có API thống kê* | ⚠️ | **Thiếu API thống kê**: Giao diện Dashboard hiển thị số lượng phòng trống/đang thuê, doanh thu, công nợ... nhưng do frontend tự tính toán thủ công từ danh sách thô tải về hoặc dùng mock data, backend không có API hỗ trợ tổng hợp. |
| **UC32** | Báo cáo doanh thu | `admin/ReportsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Biểu đồ doanh thu sử dụng Recharts ở frontend lấy dữ liệu mẫu (mock data), backend chưa có API tính tổng doanh thu theo tháng/quý/năm. |
| **UC33** | Báo cáo tỉ lệ lấp đầy | `admin/ReportsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Biểu đồ tỉ lệ lấp đầy hiển thị dữ liệu giả lập. |
| **UC34** | Báo cáo công nợ | `admin/ReportsPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Biểu đồ công nợ hiển thị dữ liệu giả lập. |
| **UC35** | Báo cáo chi phí vận hành | `admin/ReportsPage.jsx` | *Không có API* | ❌ | **Thiếu hoàn toàn**: Dự án thực tế chưa có khái niệm hay bảng dữ liệu nào liên quan đến "Chi phí vận hành" (Expense), biểu đồ trên UI là mock. |
| **UC36** | Xuất Excel / PDF | Nút bấm trên Reports | *Không có API* | ❌ | **Thiếu hoàn toàn**: Nút bấm xuất báo cáo Excel/PDF trên giao diện chỉ mang tính chất trang trí, chưa tích hợp thư viện xuất file ở cả frontend và backend. |

### Nhóm UC-F: Tiện ích bổ trợ (UC37 - UC40)

| Mã UC | Tên Use Case | Giao diện Frontend | API Backend (Node.js) | Trạng thái | Nội dung Thừa / Thiếu / Khác biệt cụ thể |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **UC37** | Gửi thông báo tự động | `*/NotificationsPage.jsx` | `GET /api/notifications` | 🟡 | **Thiếu cơ chế đẩy chủ động (Push)**: Chỉ có API đọc thông báo có sẵn trong DB để hiển thị lên giao diện web (Pull). Hệ thống không có cơ chế tự động bắn thông báo đẩy trên điện thoại hay Zalo/SMS. |
| **UC38** | Tìm kiếm phòng | `visitor/RoomSearchPage.jsx` | `GET /api/rooms/search` | 🟢 | **Khớp hoàn toàn**: Tìm kiếm phòng hoạt động cực kỳ mượt mà. Hệ thống truy vấn CSDL MongoDB Atlas theo các tham số Price, District, Amenities và hiển thị kết quả động. |
| **UC39** | Đặt cọc giữ phòng online | `visitor/DepositPage.jsx` | *Không có API* | ⚠️ | **Thiếu Backend**: Form nhập thông tin đặt cọc phòng trống của khách vãng lai chỉ hoạt động giả lập trên giao diện, chưa có API lưu thông tin đặt cọc xuống database. |
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

1. **Trợ lý ảo AI Chatbot (Gemini API Integration)**:
   - **Vị trí**: Endpoint `POST /api/chat` ở backend Node.js và component [AIChatbot.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/AIChatbot.jsx) ở frontend.
   - **Mô tả**: Chatbot tích hợp trực tiếp API `gemini-2.5-flash` để hỗ trợ người dùng giải đáp nghiệp vụ. Đặc biệt, backend có hàm tự động truy vấn số lượng nhà trọ, tổng số phòng, số phòng đã thuê và số khách thuê hiện tại trong database để nạp vào Context cho AI trả lời số liệu thực tế. Tính năng này hoàn toàn **chưa có trong sơ đồ Use Case hay mô tả đặc tả**.
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
