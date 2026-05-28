# BÁO CÁO ĐỐI CHIẾU CHI TIẾT
# Đặc tả PTTKHT ↔ Hệ thống thực tế (src/backend + src/frontend)

**Tài liệu đặc tả:** *Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx*
**Mã nguồn:** `src/backend` (Node.js Express + Python Flask), `src/frontend` (React + Vite)
**Ngày đối chiếu:** 25/05/2026

---

## 0. TÓM TẮT NHANH (TL;DR)

Hệ thống thực tế **chỉ đáp ứng khoảng 25–30%** chức năng được mô tả trong đặc tả về mặt backend (API), trong khi **frontend xây ~80% giao diện** nhưng phần lớn các trang quản trị (Admin/Manager) đang dùng **mock data / state cục bộ** chứ chưa nối backend thật. Có một số mục **code đã làm nhưng đặc tả không nhắc tới**, và rất nhiều UC trong đặc tả **chưa có endpoint backend** hoặc chỉ làm "giả lập".

Mức độ liên kết tổng thể: **Trung bình – Yếu** (lệch cả 3 mặt: kiến trúc kỹ thuật, mô hình dữ liệu, danh sách chức năng).

---

## 1. ĐỐI CHIẾU KIẾN TRÚC & CÔNG NGHỆ

| Hạng mục | Đặc tả mô tả | Thực tế code | Đánh giá |
|---|---|---|---|
| Frontend | ReactJS (web) + React Native (mobile) | React + Vite (chỉ web). Không có React Native | **Lệch (thiếu mobile)** |
| Backend | Node.js **hoặc** Spring Boot | Chạy song song **Node.js Express** (`server.js`, port 5001) **và Python Flask** (`app/__init__.py`) | **Lệch (thừa Python Flask, không có Spring Boot)** |
| CSDL | Class Diagram dạng quan hệ (RDBMS) | **MongoDB Atlas** (NoSQL) với Mongoose | **Lệch lớn** |
| JWT | Cấp JWT chuẩn | Chuỗi giả `jwt.<userId>.<timestamp>` — không phải JWT thật, không thể verify | **Lệch** |
| Mã hoá mật khẩu | bcrypt | bcryptjs ✓ | Khớp |
| OTP | OTP qua **email & SMS** | OTP qua **Gmail** thật (Nodemailer). **Không có SMS** | Lệch nhẹ |
| Multi-tenant | Có | MongoDB single-tenant, mọi user/property chung một DB | Lệch (chưa thực sự multi-tenant) |
| HTTPS / SLA 99.5% / RPO ≤ 1h | Yêu cầu phi chức năng | Chưa thấy cấu hình triển khai sản phẩm | Chưa kiểm chứng |
| **Chatbot AI Gemini** (`/api/chat`) | **Không có** trong đặc tả | Xây dựng **BoardingHouse AI** (dùng `gemini-2.5-flash`) kết nối trực tiếp MongoDB Atlas thời gian thực, có chế độ **Offline fallback** (Hệ chuyên gia tự phục vụ dữ liệu từ DB khi gặp sự cố hoặc 429 Rate Limit) và chấm trạng thái online/offline động. | **Bổ sung vượt trội**. Cần thêm vào sơ đồ Use Case trong đặc tả dưới tên **UC41 Trợ lý ảo AI Chatbot**. |
| 3D Room view (three.js / @react-three) | Không nhắc | Frontend đã cài `three`, `@react-three/fiber`, `@react-three/drei` | Thừa so với đặc tả |

---

## 2. ĐỐI CHIẾU TÁC NHÂN (Actors)

Đặc tả: 4 tác nhân — **Chủ trọ (Admin)**, **Quản lý**, **Khách thuê**, **Khách vãng lai**.

| Actor | Đặc tả | Trong code | Nhận xét |
|---|---|---|---|
| Admin | ✓ | `vaiTro = 'admin'` | Khớp |
| Manager | ✓ | `vaiTro = 'manager'` | Khớp |
| Tenant | ✓ | `vaiTro = 'tenant'` | Khớp |
| **Visitor** | ✓ (actor chính thức) | **Không tồn tại trong enum `vaiTro`** (`User.js` chỉ có `['admin','manager','tenant']`). Visitor trong code thực ra là "khách chưa đăng nhập" truy cập trang public | **Lệch:** đặc tả coi Visitor là 1 vai trò, code không lưu Visitor vào DB |

---

## 3. ĐỐI CHIẾU SƠ ĐỒ LỚP (Class Diagram – Hình 2.12)

Đặc tả đề ra **14 lớp / 5 package**. Bảng đối chiếu với 10 Mongoose models trong `src/backend/models/`:

| # | Lớp trong đặc tả | Model trong code | Tên file | Trạng thái |
|---|---|---|---|---|
| 1 | NguoiDung | User | `User.js` | ✓ Có |
| 2 | **VaiTro** | — | — | **THIẾU** (chỉ là string enum `vaiTro`) |
| 3 | NhaTro | Property | `Property.js` | ✓ Có |
| 4 | LoaiPhong | RoomType | `RoomType.js` | ✓ Có |
| 5 | PhongTro | Room | `Room.js` | ✓ Có |
| 6 | **TaiSan** | — | — | **THIẾU** lớp riêng — bị nhúng (embedded) làm mảng `taiSan[]` bên trong `Room` |
| 7 | **KhachThue** | — | — | **THIẾU** lớp kế thừa NguoiDung — gộp vào `User.thongTinKhachThue` (cccd, nghềNghiệp, địa chỉ thường trú) |
| 8 | HopDong | Contract | `Contract.js` | ✓ Có |
| 9 | DichVu | Service | `Service.js` | ✓ Có |
| 10 | ChiSoTieuThu | Reading | `Reading.js` | ✓ Có (model có nhưng **không expose API** — xem mục 4.D) |
| 11 | HoaDon | Invoice | `Invoice.js` | ✓ Có |
| 12 | **ChiTietHoaDon** | — | — | **THIẾU** lớp riêng — nhúng làm mảng `chiTiet[]` bên trong `Invoice` |
| 13 | ThanhToan | Payment | `Payment.js` | ✓ Có |
| 14 | ThongBao | Notification | `Notification.js` | ✓ Có |

### Quan hệ thừa trong code mà đặc tả chưa mô tả

- `RoomType.maNhaTroId → Property`: code cho mỗi nhà trọ có loại phòng riêng, đặc tả chỉ vẽ `LoaiPhong 1—* PhongTro` chung chung.
- `Service.maNhaTroId → Property`: code cho phép mỗi nhà trọ cấu hình đơn giá dịch vụ riêng (bậc thang theo cơ sở), đặc tả không vẽ.
- `Property.maQuanLyIds[] → User` (nhiều quản lý/cơ sở): đặc tả không thể hiện rõ trên class diagram.
- `User.maNhaTroIds[] → Property` (1 quản lý quản nhiều cơ sở): đặc tả không vẽ.

### Thuộc tính lệch giữa đặc tả và code

| Lớp | Đặc tả | Code | Ghi chú |
|---|---|---|---|
| NguoiDung | `id, hoTen, email, matKhau, sdt, trangThai` | + `otp{maOtp, hanSuDung}`, `thongTinKhachThue{cccd, ngheNghiep, diaChiThuongTru}`, `maNhaTroIds[]` | Code có thêm OTP, profile khách thuê embedded, danh sách nhà trọ |
| NhaTro | `maNhaTro, tenNhaTro, diaChi, chuTro` | + `quanHuyen, thanhPho, hinhAnh, tongSoPhong, soPhongDaThue, maQuanLyIds[], trangThai` | Code phong phú hơn |
| PhongTro | `maPhong, tang, giaThueHienTai, trangThai` | + `soPhong, dienTich, hinhAnh[], moTa, giaThue, taiSan[]`, `maLoaiPhongId` | Trạng thái enum khác: spec gợi ý "trống/đang thuê/đặt cọc" — code: `empty/rented/deposit/maintenance` |
| HopDong | `tienCoc, ngayBatDau, ngayKetThuc, trangThai` | + `duongDanPdf` | OK |
| HoaDon | `maHoaDon, ky, tongTien, hanThanhToan, trangThai` | + `chiTiet[]` nhúng, dùng `kyThanhToan` thay vì `ky` | Đặt lại tên field |
| ThanhToan | `phuongThuc, soTien, ngayGiaoDich, trangThai` | + `maHoaDonId` | OK; enum phương thức: `vnpay/momo/cash/bank_transfer` (đặc tả ghi VNPay/MoMo/QR — code có thêm `bank_transfer`, **thiếu QR riêng biệt**) |
| DichVu | `donVi, donGia, loaiTinh` | + `maNhaTroId` | Code gắn dịch vụ theo nhà trọ |

---

## 4. ĐỐI CHIẾU USE CASE (40 UC trong đặc tả)

> **Kí hiệu:**
> ✅ Có cả backend API + frontend gọi thật
> ⚠️ Frontend có UI nhưng backend thiếu/mock — chỉ chạy trên state cục bộ
> ❌ Hoàn toàn không có
> ➕ Code làm tốt hơn đặc tả

### 4.A. Nhóm xác thực & tài khoản (UC01–UC08)

| UC | Tên | Backend (Node) | Frontend | Đánh giá |
|---|---|---|---|---|
| UC01 | Đăng ký tài khoản | ✅ `POST /api/auth/register` (kèm OTP qua Gmail thật) | `RegisterPage.jsx` (luồng 2 bước) | **Đạt chuẩn** (làm thật, không giả lập) |
| UC02 | Đăng nhập **+ OTP** | ⚠️ `POST /api/auth/login` chỉ kiểm email/mật khẩu, **không sinh OTP** | `LoginPage.jsx` giả lập OTP cứng `123456` ở frontend | **Lệch:** đặc tả nói login include OTP; thực tế chỉ register mới OTP |
| UC03 | Đăng xuất | ❌ Không có endpoint `/logout` | Frontend xoá localStorage | Chấp nhận được (REST stateless) nhưng spec ghi UC03 nên cần đặc tả lại |
| UC04 | Quên mật khẩu | ❌ | ❌ | **THIẾU** |
| UC05 | Đặt lại mật khẩu | ❌ | ❌ | **THIẾU** |
| UC06 | Cập nhật hồ sơ | ❌ Không có `PUT /users/:id` | `ProfilePage.jsx` chỉ là form mock | **THIẾU backend** |
| UC07 | Khoá/Mở khoá tài khoản | ❌ | ⚠️ UI Admin → Users có nút nhưng không call API | **THIẾU backend** |
| UC08 | Phân quyền vai trò | ❌ | ⚠️ UI có chọn role | **THIẾU backend** |

### 4.B. Nhóm quản lý nhà trọ & phòng (UC09–UC14)

| UC | Tên | Backend | Frontend | Đánh giá |
|---|---|---|---|---|
| UC09 | Thêm/sửa/ngừng nhà trọ | ❌ chỉ có `GET /api/properties` và `GET /:id`. **Không có POST/PUT/DELETE** | ⚠️ `PropertiesPage.jsx` (admin) có modal AddProperty/Detail nhưng chỉ cập nhật state | **THIẾU CRUD backend** |
| UC10 | Phân công quản lý | ❌ | ⚠️ UI Admin/Users có gán nhưng không persist | **THIẾU backend** |
| UC11 | Quản lý loại phòng & tiện nghi | ❌ Không có endpoint cho `RoomType` | ❌ Không có trang riêng | **THIẾU hoàn toàn** |
| UC12 | CRUD phòng trọ | ❌ chỉ GET. **Không POST/PUT/DELETE rooms** | ⚠️ `manager/RoomsPage.jsx` dùng `initialRoomsData` cứng | **THIẾU CRUD backend** |
| UC13 | Cập nhật trạng thái phòng | ❌ | ⚠️ UI có nhưng không API | **THIẾU backend** |
| UC14 | Quản lý tài sản trong phòng | ❌ | ⚠️ chỉ có ý niệm `taiSan[]` embedded | **THIẾU API + UI** |

### 4.C. Nhóm hợp đồng & khách thuê (UC15–UC21)

| UC | Tên | Backend | Frontend | Đánh giá |
|---|---|---|---|---|
| UC15 | Thêm hồ sơ khách | ❌ (chỉ thông qua /register tenant) | — | **THIẾU API riêng** |
| UC16 | Lập hợp đồng | ❌ chỉ `GET /api/contracts`. **Không POST** | ⚠️ `admin/ContractsPage.jsx` có `CreateContractModal` chỉ local state | **THIẾU backend** |
| UC17 | Ký số / Xác nhận hợp đồng | ❌ Không có API ký số. Chỉ lưu `duongDanPdf` URL tĩnh | ⚠️ `ViewPdfModal` chỉ xem | **Giả lập, lệch UC** |
| UC18 | Gia hạn hợp đồng | ❌ | ⚠️ UI mock | **THIẾU backend** |
| UC19 | Sửa đổi hợp đồng | ❌ | ⚠️ UI mock | **THIẾU backend** |
| UC20 | Chấm dứt hợp đồng | ❌ | ⚠️ UI mock | **THIẾU backend** |
| UC21 | Đăng ký tạm trú (CT01) | ❌ Hoàn toàn không có code | ❌ Không có UI | **THIẾU TUYỆT ĐỐI** (đặc tả mô tả rất chi tiết: gửi API cho cán bộ tổ dân phố) |

### 4.D. Nhóm dịch vụ, hoá đơn & thanh toán (UC22–UC30)

| UC | Tên | Backend | Frontend | Đánh giá |
|---|---|---|---|---|
| UC22 | Cấu hình đơn giá dịch vụ | ❌ Có model `Service` nhưng **không có endpoint** | ⚠️ `admin/ServicesPage.jsx` có modal, không call API | **THIẾU backend** |
| UC23 | Ghi chỉ số điện nước | ❌ Có model `Reading` nhưng **không có endpoint** (chỉ seed.js dùng) | ⚠️ `manager/MetersPage.jsx` chỉ tính local | **THIẾU backend** |
| UC24 | Tính tiền dịch vụ | ❌ (logic bậc thang EVN chưa code) | ⚠️ Trên MetersPage tính theo giá cố định | **THIẾU logic bậc thang** |
| UC25 | Tạo hoá đơn | ❌ Chỉ `GET /api/invoices`. **Không POST** | ⚠️ `admin/InvoicesPage.jsx` có `BatchPublishModal` chỉ local | **THIẾU backend** |
| UC26 | Gửi hoá đơn & nhắc thanh toán | ❌ Không có job/cron, không có sendInvoice | — | **THIẾU** |
| UC27 | Thanh toán online | ⚠️ `POST /api/invoices/:id/pay` chỉ đổi status="paid" và tạo `Payment` record. **Không tích hợp VNPay/MoMo thật** | `tenant/InvoicesPage.jsx` có gọi API | **Giả lập** |
| UC28 | Xác nhận thu tiền mặt | ❌ | ⚠️ `manager/CashReceiptsPage.jsx` chỉ local | **THIẾU backend** |
| UC29 | Tra cứu lịch sử hoá đơn | ✅ `GET /api/invoices?tenantId=` | ✅ Tenant Invoices page gọi thật | **Đạt** |
| UC30 | Quản lý công nợ | ❌ Không có endpoint riêng | ⚠️ `admin/DebtsPage.jsx` chỉ local | **THIẾU backend** |

### 4.E. Nhóm báo cáo & thống kê (UC31–UC36)

| UC | Tên | Backend | Frontend | Đánh giá |
|---|---|---|---|---|
| UC31 | Dashboard tổng quan | ⚠️ Không có endpoint thống kê — frontend tự `count` từ list | `admin/DashboardPage.jsx`, `manager/DashboardPage.jsx` | **THIẾU API thống kê** |
| UC32 | Báo cáo doanh thu (T/Q/N) | ❌ | ⚠️ `admin/ReportsPage.jsx` xài mock | **THIẾU** |
| UC33 | Báo cáo tỉ lệ lấp đầy | ❌ | ⚠️ mock | **THIẾU** |
| UC34 | Báo cáo công nợ | ❌ | ⚠️ mock | **THIẾU** |
| UC35 | Báo cáo chi phí vận hành | ❌ | ⚠️ mock | **THIẾU** (đặc tả nhắc nhưng code chưa có khái niệm "chi phí") |
| UC36 | Xuất Excel/PDF | ❌ | ❌ Không có nút xuất hoạt động thật | **THIẾU** |

### 4.F. Tiện ích bổ trợ (UC37–UC40)

| UC | Tên | Backend | Frontend | Đánh giá |
|---|---|---|---|---|
| UC37 | Gửi thông báo tự động (email/SMS/Zalo) | ❌ Chỉ có `emailService.sendOtpEmail`. Không có cron/Zalo/SMS | `*/NotificationsPage.jsx` đọc list | **THIẾU đẩy chủ động** |
| UC38 | Tìm kiếm phòng (visitor) | ✅ `GET /api/rooms/search` (lọc theo keyword, price, district, amenities) | ✅ `visitor/RoomSearchPage.jsx` | **Đạt** (Giao diện vừa được nâng cấp lên dạng danh sách - **List view** tinh tế, phân cấp thông tin trực quan hơn nhiều so với Grid view thô sơ gợi ý trong đặc tả) |
| UC39 | Đặt cọc giữ phòng online | ❌ Không có endpoint `POST /api/rooms/:id/deposit` | ⚠️ `visitor/DepositPage.jsx` chỉ form | **THIẾU backend** |
| UC40 | Đăng tin tuyển khách | ❌ | ❌ | **THIẾU** |

---

## 5. CHỨC NĂNG **THỪA** TRONG CODE (Spec không nhắc)

| Chức năng | Vị trí trong code | Ghi chú |
|---|---|---|
| **Chatbot AI Gemini** | `server.js POST /api/chat` + `services/chatService.js` + `components/common/AIChatbot.jsx` | Gọi `gemini-2.5-flash`, nạp live DB context (nhà trọ, phòng, khách thuê, hợp đồng, hóa đơn). Tự động chạy **Offline fallback** (Hệ chuyên gia tự động chốt giá phòng, thông tin khách thuê, công nợ trễ hạn trực tiếp từ database). Có chấm trạng thái online/offline động và tự động chuyển đổi in đậm `**` sang màu xanh thương hiệu (`text-primary`). **Cần bổ sung vào đặc tả dưới dạng UC41**. |
| **Backend Python Flask song song** | `src/backend/app/` | Phục vụ tương tự Node.js, chỉ read. Đặc tả chỉ nói Node.js/Spring Boot |
| **3D Room visualization (three.js)** | `frontend/node_modules` cài `three`, `@react-three/fiber`, `@react-three/drei`, `recharts` | Có lẽ dùng ở `manager/RoomsPage.jsx` (mảng `x/y/z`). Đặc tả phần Thiết kế giao diện chương 3 không nhắc 3D |
| **DNS workaround `8.8.8.8`** trong `server.js` | Lệnh `dns.setServers` | Là chi tiết triển khai, không cần ghi vào đặc tả |
| **`emailService.sendOtpEmail`** dùng Nodemailer + Gmail thực tế | `services/emailService.js` | Đặc tả gọi chung là "email/SMS" — nên ghi rõ kênh email Nodemailer/Gmail SMTP |
| **`maNhaTroIds[]` trong User** (1 quản lý ↔ nhiều cơ sở) | `User.js` | Đặc tả chỉ cho phép "phân công" 1 chiều từ Property → Manager; code làm 2 chiều |

---

## 6. THỐNG KÊ TỔNG HỢP

| Hạng mục | Số lượng |
|---|---|
| Tổng UC đặc tả | 40 |
| UC **đạt chuẩn** (cả BE + FE) | **4** (UC01, UC29, UC38, UC27 giả lập) |
| UC **thiếu backend** nhưng có UI mock | **~22** |
| UC **thiếu hoàn toàn** (cả BE và FE) | **~10** (UC04, UC05, UC11, UC14, UC15 (API), UC21, UC26, UC36, UC40, UC37 đẩy chủ động) |
| Lớp dữ liệu đặc tả | 14 |
| Model trong code | 10 |
| Lớp **thiếu** so với đặc tả | 4 (VaiTro, TaiSan, KhachThue, ChiTietHoaDon — đã gộp/nhúng) |
| Tổng API endpoint backend Node.js | 18 |
| Endpoint READ (GET) | 12 |
| Endpoint WRITE (POST/PUT/DELETE) | 6 (4 auth + 1 pay + 1 chat) |

---

## 7. ĐỀ XUẤT CHỈNH SỬA

Đề xuất chia thành **2 hướng**: (A) **Sửa đặc tả cho khớp với code đang chạy** — phù hợp khi mục tiêu là bảo vệ đồ án/demo trong thời gian ngắn; (B) **Sửa code cho khớp với đặc tả** — phù hợp nếu muốn hoàn thiện sản phẩm thực sự.

### 7.A. Hướng *"Hợp thức hoá tài liệu"* (sửa ĐẶC TẢ — ưu tiên cao, làm ngay)

Đây là những điểm **nên sửa đặc tả** vì code đã đi xa hơn hoặc khác hẳn:

1. **Chương 1.2.2 (Yêu cầu phi chức năng / Công nghệ)**
   - Thay "ReactJS + React Native + Node.js/Spring Boot" → ghi rõ:
     "Frontend: ReactJS + Vite (web only, mobile-first responsive). Backend chính: Node.js Express. Backend phụ phân tích: Python Flask. CSDL: MongoDB Atlas (NoSQL)".
   - Bỏ React Native khỏi yêu cầu cố định, chuyển sang phần "Hướng phát triển tương lai".

2. **Chương 2.1 (Tác nhân)**
   - Ghi rõ **Khách vãng lai là tác nhân ẩn danh** (không lưu trong DB) — chỉ truy cập trang public, không cần tài khoản.

3. **Chương 2.2 / 2.3 (Use Case)**
   - **UC02**: Sửa "Đăng nhập có xác thực 2 lớp" → "Đăng nhập bằng email + mật khẩu (OTP đã chuyển sang UC01 Đăng ký để kích hoạt tài khoản)".
   - **UC01**: Bổ sung rõ "kèm xác thực OTP qua email Nodemailer/Gmail (5 phút hiệu lực)".
   - **UC21 Đăng ký tạm trú, UC40 Đăng tin tuyển khách, UC36 Xuất Excel/PDF, UC11 Quản lý loại phòng**: chuyển sang **Phụ lục "Tính năng định hướng phát triển"** vì chưa có code.
   - **Bổ sung UC mới**: "**UC41 Trợ lý ảo AI Chatbot (BoardingHouse AI)**" mô tả chi tiết việc tích hợp Gemini API kết hợp MongoDB Atlas thời gian thực, có Hệ chuyên gia Offline fallback khi gián đoạn mạng/Rate Limit 429, cùng chấm màu hiển thị trạng thái Trực tuyến/Ngoại tuyến động và định dạng đổi màu in đậm sang màu xanh chủ đạo. Vẽ thêm vào sơ đồ UC tổng quát kết nối với cả 3 Actor Admin/Manager/Tenant.

4. **Chương 2.6 (Class Diagram – Hình 2.12) — viết lại theo NoSQL**
   - Đổi tên lớp sang tiếng Anh cho khớp code: `NguoiDung→User`, `NhaTro→Property`, `LoaiPhong→RoomType`, `PhongTro→Room`, `HopDong→Contract`, `DichVu→Service`, `ChiSoTieuThu→Reading`, `HoaDon→Invoice`, `ThanhToan→Payment`, `ThongBao→Notification`.
   - **Bỏ lớp `VaiTro`** → ghi là enum `vaiTro ∈ {admin, manager, tenant}` trong User.
   - **Bỏ lớp `KhachThue`** → ghi là `thongTinKhachThue` embedded trong User.
   - **Bỏ lớp `TaiSan` riêng** → vẽ là embedded array trong Room.
   - **Bỏ lớp `ChiTietHoaDon` riêng** → vẽ là embedded array `chiTiet[]` trong Invoice.
   - **Thêm các quan hệ**: `Service *→1 Property`, `RoomType *→1 Property`, `User *→* Property` (qua `maNhaTroIds`).
   - Bổ sung field `Property.quanHuyen, thanhPho, hinhAnh, tongSoPhong, soPhongDaThue`.

5. **Chương 2.7 (Sequence Diagram)**
   - Hình 2.13 — vẽ lại từ "Đăng nhập có OTP" → "Đăng ký + Kích hoạt OTP qua Email".
   - Hình 2.14 — ghi chú "Ký số = lưu URL PDF tĩnh, giả lập" hoặc đẩy sang phần định hướng.
   - Hình 2.16 — ghi chú "Thanh toán VNPay hiện đang giả lập (cập nhật trạng thái), tích hợp thật ở giai đoạn 2".

6. **Chương 3 (Thiết kế giao diện)**
    - Cập nhật danh sách trang thực tế: thêm mô tả `ServicesPage`, `DebtsPage`, `MetersPage`, `CashReceiptsPage` — đã có UI. Đặc biệt, cập nhật chi tiết thiết kế màn hình tìm phòng của Visitor dạng danh sách (List view) sang trọng thay cho dạng lưới (Grid view) đơn điệu.
    - Thay từ "Chi nhánh" → "Khu vực hiện tại / Khu vực" hoặc giữ "Nhà trọ" cho khớp sidebar.

7. **Bảng phương thức thanh toán (Table 2 / UC27)**: bỏ "QR" thành dòng riêng, thay bằng `bank_transfer` cho khớp enum code.

---

### 7.B. Hướng *"Hoàn thiện hệ thống"* (sửa CODE — nếu còn thời gian)

Sắp xếp theo **mức độ ưu tiên & độ rủi ro nếu bị hỏi khi demo**:

#### 🔴 P0 – Cần làm vì đặc tả nhấn mạnh và demo dễ bị hỏi:

1. **Đăng nhập có OTP thực sự (UC02)** — sửa `POST /api/auth/login`: sau khi check mật khẩu OK thì sinh OTP, gửi email, trả `{requireOtp:true, ticket}`; thêm `POST /api/auth/verify-login-otp`. Frontend `LoginPage.jsx` bỏ chuỗi `'123456'` cứng.

2. **JWT chuẩn** — thay chuỗi `jwt.<id>.<ts>` bằng `jsonwebtoken.sign({sub, role}, SECRET, {expiresIn:'12h'})`; thêm middleware verify ở route cần bảo vệ.

3. **CRUD Property (UC09)** — thêm `POST /api/properties`, `PUT /api/properties/:id`, `DELETE /:id`; nối `admin/PropertiesPage.jsx` (AddPropertyModal/PropertyDetailModal) bỏ state local.

4. **CRUD Room (UC12/UC13)** — `POST /api/rooms`, `PATCH /:id/status`; nối `manager/RoomsPage.jsx`.

5. **Lập + ký hợp đồng (UC16/UC17)** — `POST /api/contracts` để tạo bản nháp + sinh PDF (`pdfkit` hoặc `puppeteer`); `POST /api/contracts/:id/sign` cho khách thuê ký (lưu OTP signed_at + chữ ký dạng base64); cập nhật trạng thái phòng tự động.

6. **Ghi chỉ số + Tạo hoá đơn (UC23/UC25)** — `POST /api/readings` (batch nhập theo kỳ), `POST /api/invoices/generate?period=YYYY-MM`. Nối `manager/MetersPage.jsx` + `admin/InvoicesPage.jsx`.

7. **Thanh toán VNPay thật (UC27)** — tích hợp VNPay Sandbox: tạo URL với chữ ký HMAC-SHA512, endpoint `/api/payments/vnpay/return` và `/api/payments/vnpay/ipn`. Hiện code chỉ đổi status, sẽ rớt khi giảng viên check IPN.

#### 🟡 P1 – Cần để khớp đặc tả nhưng không cấp bách demo:

8. **Quên/Đặt lại mật khẩu (UC04/UC05)** — `POST /api/auth/forgot-password` gửi link reset (token 30 phút); `POST /api/auth/reset-password`.

9. **Cập nhật hồ sơ (UC06)** — `PUT /api/users/me`, `POST /api/users/me/avatar`.

10. **Cấu hình dịch vụ (UC22)** — CRUD `/api/services` (`GET/POST/PUT/DELETE`), thêm field `bậc thang` (`tiers: [{from, to, price}]`) để UC24 tính tiền điện EVN.

11. **Xác nhận tiền mặt (UC28)** — `POST /api/payments/cash` (manager xác nhận); nối `manager/CashReceiptsPage.jsx`.

12. **Công nợ (UC30)** — endpoint thống kê `GET /api/reports/debts?propertyId=`; nối `admin/DebtsPage.jsx`.

13. **Báo cáo (UC31–UC35)** — gom thành `GET /api/reports/dashboard`, `/revenue`, `/occupancy`, `/expenses` (aggregate pipeline MongoDB). Frontend `admin/ReportsPage.jsx` bỏ mock.

14. **Xuất Excel/PDF (UC36)** — dùng `exceljs` + `pdfkit` ở backend.

15. **Đặt cọc visitor (UC39)** — `POST /api/rooms/:id/deposit` → tạo `Payment` + đổi `Room.trangThai='deposit'`; nối `visitor/DepositPage.jsx`.

16. **Thông báo tự động (UC26/UC37)** — thêm `node-cron` chạy hằng ngày kiểm hợp đồng sắp hết hạn, hoá đơn quá hạn, gọi `emailService` + (tuỳ chọn) Zalo OA.

#### 🟢 P2 – Có thể đẩy xuống "future scope" trong đặc tả:

17. UC21 (CT01 đăng ký tạm trú với phường), UC40 (đăng tin marketplace), Zalo/SMS thực, ký số bằng nhà cung cấp CA (VNPT-CA/FPT-CA), IoT công tơ điện, app mobile React Native — **giữ trong "Hướng phát triển tương lai"** ở chương 4.3.

#### Bổ sung kỹ thuật:

- Thêm **role 'visitor'** vào enum `User.vaiTro` *nếu* muốn lưu khách vãng lai có lịch sử đặt cọc; hoặc tạo collection riêng `VisitorDeposit`.
- Đồng bộ tên trường: code đang dùng cả `giaThue` lẫn `giaThueHienTai` (Room), `code` lẫn `_id.substring()` (Contract) — chọn 1, viết migration.
- **Quyết định một backend**: chạy song song Node.js + Python Flask gây chồng chéo. Đề xuất giữ Node.js làm chính, Python chỉ dùng cho phân tích batch (nếu cần) và viết rõ trong đặc tả.

---

## 8. KẾT LUẬN

- **Tỷ lệ khớp**: chức năng cốt lõi (đăng ký OTP, xem danh sách phòng/hoá đơn/hợp đồng, tìm kiếm phòng visitor, thanh toán giả lập, chatbot) chạy được; phần lớn các thao tác **ghi dữ liệu (write)** từ phía Admin/Manager đang là **giao diện thuần** không nối backend.
- **Rủi ro lớn nhất khi bảo vệ đồ án**: bị hỏi "thử tạo 1 hợp đồng mới", "thử ghi chỉ số tháng này", "thử xuất báo cáo doanh thu", "thử login bằng OTP" — đều sẽ lộ là mock.
- **Khuyến nghị nhanh**: chạy song song hai hướng — (i) sửa đặc tả ngay theo Mục 7.A để **không lệch khi đối chiếu**, (ii) ưu tiên fix P0 (Mục 7.B) trong 1–2 sprint để demo có thể chứng minh được các flow nghiệp vụ chính.

---

*Báo cáo được sinh bởi đối chiếu trực tiếp 664 đoạn / 13 bảng của file đặc tả với 10 Mongoose model + 18 endpoint Node.js + 7 blueprint Flask + 26 trang React.*
