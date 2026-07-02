# BÁO CÁO XÁC MINH SƠ ĐỒ THEO HỆ THỐNG (HỆ THỐNG LÀM CHUẨN)

**Ngày:** 02/07/2026 · **Chuẩn đối chiếu:** mã nguồn `src/backend` (11 models, 14 route files, middleware) + `src/frontend` (services, layouts)
**Mục tiêu:** độ tương thích 100% giữa 19 sơ đồ `.puml` và hệ thống đang chạy.

---

## 0. Phương pháp

1. Trích xuất **ma trận endpoint–quyền** từ toàn bộ `routes/*.js` (66 endpoints) + `middlewares/auth.js` (`verifyToken`, `requireRole`).
2. Đọc 11 schema Mongoose làm chuẩn cho sơ đồ lớp (trường, enum, ref).
3. Đọc từng handler (register/verify-otp/login/forgot/reset, contracts create/sign/terminate/extend, invoices pay/generate/pay-cash/reject-cash, vnpay-return/ipn, rooms deposit, readings, chat) đối chiếu từng bước trong sơ đồ hoạt động/tuần tự.
4. Kiểm tra frontend (`api.js` interceptor token, `AIChatbot.jsx`, `DepositPage.jsx`, layouts) cho các luồng Visitor.
5. Đối chiếu PNG đã render + ảnh nhúng trong file Word (md5).

---

## 1. KẾT QUẢ XÁC MINH TỪNG SƠ ĐỒ

Ký hiệu: ✅ khớp hệ thống · ❌ lệch hệ thống (phải sửa sơ đồ) · ⚠️ ký pháp UML sai (không lệch hệ thống) · 🔧 hệ thống tự mâu thuẫn

### 2.12 — Sơ đồ lớp (trọng tâm)

| # | Nội dung sơ đồ | Hệ thống (bằng chứng) | Kết luận |
|---|---|---|---|
| 1 | 11 collection + 4 lớp nhúng | 11 models + 4 embedded đúng | ✅ |
| 2 | `Room.currentTenantId : ObjectId` | `Room.js` **không có trường này**. `contractRoutes.js:208-211` ghi nó nhưng Mongoose strict mode loại bỏ → không bao giờ lưu; `mappers.js:49` luôn trả `null` | ❌ + 🔧 Lấy hệ thống làm chuẩn → **xoá khỏi sơ đồ** (hoặc sửa code — xem mục 3) |
| 3 | `Invoice.trangThai : {pending, paid, overdue, cancelled}` | `Invoice.js`: enum có thêm **`pending_cash`**; có thêm trường **`paymentMethod`** {vnpay, cash, bank_transfer} | ❌ bổ sung |
| 4 | `Payment.maHoaDonId` (bắt buộc, quan hệ `Invoice o-- "*" Payment`) | `Payment.js`: `maHoaDonId required:false`; có thêm `maPhongId` (ref Room — đặt cọc), `ngayGiaoDich`, `ghiChu` | ❌ maHoaDonId là 0..1; thiếu 3 trường + quan hệ Payment→Room |
| 5 | Room thiếu trường | `Room.js` có thêm: `giaThue, dienTich, maPhong, hinhAnh[], moTa, depositAt` | ❌ bổ sung (tối thiểu `depositAt` — dùng cho auto giải phóng cọc 24h, `roomRoutes.js:26-48`) |
| 6 | Property thiếu trường | `Property.js` có thêm `hinhAnh` | ❌ nhỏ |
| 7 | `ChiTietHoaDon` thiếu `maDichVuId` | `Invoice.js` chiTiet[] có `maDichVuId ref Service` | ❌ bổ sung |
| 8 | **Không có đường quan hệ** Contract↔User | `Contract.maKhachThueIds[] ref User` (N–N) | ❌ vẽ thêm |
| 9 | **Không có đường quan hệ** User↔Property | `User.maNhaTroIds[]`, `Property.maQuanLyIds[]` (N–N quản lý), `Property.maChuTroId` (1–N chủ) | ❌ vẽ thêm |
| 10 | **Không có đường quan hệ** Invoice↔Room | `Invoice.maPhongId ref Room` | ❌ vẽ thêm |
| 11 | `Contract o-- "1" Room`, `Reading o-- "1" Service` | Quan hệ đúng về ref, nhưng kim cương đặt sai đầu + thiếu multiplicity phía nhiều (1 phòng nhiều HĐ; 1 dịch vụ nhiều reading) | ⚠️ |
| 12 | `Property *-- Room` (composition) | Room là collection riêng, DELETE property chỉ soft-inactive (`propertyRoutes.js:162-174`), không cascade | ⚠️ nên dùng `o--` |
| 13 | PNG + ảnh trong docx | `png/2.12` render **trước** lần sửa cuối: tiêu đề "10 collection", **thiếu class Expense**; `docx/word/media/image15.png` trùng md5 với bản cũ | ❌ re-render + thay ảnh |

### 2.01 — UC tổng quát

| Liên kết trong sơ đồ | Hệ thống | Kết luận |
|---|---|---|
| Tenant không nối "Xác thực & tài khoản" | Tenant đăng nhập, cập nhật hồ sơ (`login`, `PUT /users/:id`) | ❌ thêm Tenant–UC_Auth |
| Visitor–"Trợ lý ảo AI Chatbot" | `POST /api/chat` có **verifyToken** (`chatRoutes.js:332`) → visitor chưa đăng nhập bị 401 (widget có trong VisitorLayout nhưng API từ chối) | ❌ bỏ liên kết hoặc chú thích "yêu cầu đăng nhập" |
| UC_Service, UC_Invoice chỉ Owner | services CRUD = admin+**manager** (`serviceRoutes`); pay-cash/reject-cash = admin+**manager** | ❌ thêm Manager |
| UC_Room chỉ Manager | rooms CRUD = **admin**+manager | ❌ thêm Owner |
| UC_Report chỉ Owner | dashboard + occupancy = admin+**manager** (`reportRoutes.js:32,157`) | ❌ thêm Manager |
| UC_Notify chỉ Manager+Tenant | remind = **admin**+manager (`reportRoutes.js:223`) | ❌ thêm Owner |
| UC_Search chỉ Visitor | `GET /rooms/search` public; 2.06b có vẽ Tenant | ❌ thêm Tenant (đồng bộ 2.06b) |

### 2.02 — UC Xác thực

- ❌ **UC04/UC05 (quên/đặt lại mật khẩu)**: hệ thống chỉ cho **tenant** (`authRoutes.js:330,375` lọc `vaiTro:'tenant'`) — actor "Người dùng" chung là rộng hơn hệ thống.
- ❌ **UC08 "Phân quyền vai trò"**: không có endpoint đổi vai trò nào; vai trò gán khi đăng ký + middleware kiểm tra. Nên đổi tên thành "Kiểm soát truy cập theo vai trò" hoặc chú thích.
- ✅ OTP include cho UC01/UC04; UC02 không OTP — khớp code.

### 2.03 — UC Nhà trọ & Phòng

- ✅ UC09/UC10 admin-only khớp (`propertyRoutes` requireRole('admin')); UC11 Owner+Manager khớp (`roomTypeRoutes` admin+manager).
- ❌ UC12/13/14 chỉ nối Manager — hệ thống cho **cả admin** (`roomRoutes` requireRole('admin','manager')).

### 2.04 — UC Hợp đồng

- ❌ UC16/18/19/20 chỉ nối Manager — hệ thống cho **cả admin** (`contractRoutes` requireRole('admin','manager')).
- ❌ `C2 ..> C3 <<include>>`: hệ thống tạo HĐ ở trạng thái `draft` (`contractRoutes.js:126`), ký là bước **sau, riêng, của tenant** (`:199 requireRole('tenant')`) — không phải include. Đúng chiều hệ thống: C3 là bước tuỳ chọn tiếp theo (extend hoặc bỏ quan hệ).
- ✅ UC17 Tenant ký — khớp requireRole('tenant').

### 2.05 — UC Hoá đơn & Thanh toán

- ✅ **UC24 Owner tạo hoá đơn** — khớp `invoiceRoutes.js:139 requireRole('admin')` (lưu ý: 2.10/2.15 lại vẽ Manager làm việc này — xem dưới).
- ❌ UC21 chỉ Owner — hệ thống: admin+**manager**.
- ❌ UC22, UC27 chỉ Manager — hệ thống: **admin**+manager.
- ❌ Chuỗi `B2 ..> B3 ..> B4 <<include>>`: hệ thống tách rời — ghi chỉ số (`POST /readings`) KHÔNG tự tạo hoá đơn; tính tiền xảy ra **bên trong** generate (`invoiceRoutes.js:150-190`). Đúng hệ thống: `B4 ..> B3 <<include>>`, bỏ include từ B2.
- ⚠️ `B4 ..> B5 <<extend>>` ngược chiều UML (extension → base).
- ❌ B5 (nhắc nợ) không nối actor — hệ thống: admin+manager.

### 2.06 — UC Báo cáo

- ❌ E1 (dashboard), E3 (lấp đầy) chỉ Owner — hệ thống cho **cả manager** (`reportRoutes.js:32,157`). E2/E4/E5/E6 admin-only ✅.
- ⚠️ 4 mũi tên `<<extend>>` ngược chiều.

### 2.06b — UC Tiện ích

- ❌ **F3 Đặt cọc – Visitor**: `POST /rooms/:id/deposit` có **verifyToken** (`roomRoutes.js:283`) → phải đăng nhập; `DepositPage.jsx` bắt visitor **login/đăng ký + OTP ngay trong trang** trước khi cọc. Sơ đồ cần thêm include "Đăng nhập/Đăng ký".
- ❌ **F4 Chatbot – Visitor**: như 2.01 — API yêu cầu token.
- ✅ F2 tìm kiếm public; F5/F6 online/offline fallback đúng cơ chế (`chatRoutes.js:373-425`).
- ⚠️ `F4 ..> F5/F6 <<extend>>` ngược chiều.

### 2.07 — Hoạt động Đăng ký OTP

- ✅ OTP 6 số, hiệu lực 5 phút, user `pending`, gửi Gmail, verify → `active` + xoá OTP + cấp JWT, resend-otp — khớp `authRoutes.js:120-315` từng bước.
- ❌ Một chi tiết: "Kiểm tra email / **SĐT** chưa tồn tại" — hệ thống **chỉ kiểm tra email** (`findOne({email})`), không kiểm tra SĐT trùng.

### 2.08 — Hoạt động Quản lý phòng

- ✅ Toàn bộ: 5 endpoint đúng, cập nhật `tongSoPhong` khi thêm/xoá (`roomRoutes.js:206,256`), mapRoom. Khớp 100%.

### 2.09 — Hoạt động Lập & Ký hợp đồng  → **LỆCH NẶNG NHẤT**

| Sơ đồ | Hệ thống (`contractRoutes.js`) |
|---|---|
| Tạo Contract `trangThai="active"` | `:126` tạo **`'draft'`** |
| Ngay khi tạo: Room→`rented` + currentTenantId + soPhongDaThue+1 | Khi tạo **không đụng phòng**; cả 3 việc này xảy ra ở **bước KÝ** (`:205-217`) |
| Khách từ chối → Contract `"cancelled"`, Room `empty` | **Không tồn tại** trạng thái `cancelled` (enum: draft/active/expired/terminated) và **không có endpoint từ chối** |
| Bước ký đổi trạng thái `active` | ✅ đúng (`:204-205`), kèm Room→rented |

### 2.10 — Hoạt động Ghi chỉ số & Hoá đơn lô

- ✅ Luồng ghi chỉ số, cảnh báo, batch, vòng lặp generate (tiền phòng + tiêu thụ×đơn giá + phí cố định, invoice `pending` + chiTiet) — khớp `invoiceRoutes.js:139-207`.
- ❌ **Actor sai: "Quản lý" nhấn "Phát hành hoá đơn lô"** — hệ thống `requireRole('admin')` → Manager bị 403. Phải là Chủ trọ (2.05 vẽ đúng).
- ✅ Nhắc nợ bởi Quản lý — khớp (admin+manager).

### 2.11 — Hoạt động Thanh toán

- ✅ Nhánh VNPay (paymentUrl HMAC → return verify → `paid` + Payment) — khớp `paymentRoutes.js:26-67`.
- ✅ Nhánh tiền mặt (`pending_cash` → pay-cash/reject) — khớp `invoiceRoutes.js:104-108,208-247`.
- ❌ **Nhánh chuyển khoản VietQR → `'paid'` ngay**: hệ thống chuyển **`pending_cash`** chờ Quản lý đối soát (`invoiceRoutes.js:123-127`) — giống tiền mặt.

### 2.13 — Tuần tự Đăng ký OTP

- ✅ Khớp 100% từng message (kể cả `otp:null` sau kích hoạt, JWT, localStorage).

### 2.14 — Tuần tự Tạo & Ký hợp đồng

- ❌ Giống 2.09: `Contract.create(trangThai:'active')` + `Room.update(rented, currentTenantId)` + `$inc soPhongDaThue` vẽ ở bước **TẠO** — hệ thống làm ở bước **KÝ**; tạo = `draft`, không đụng phòng.
- ✅ Phần ký (UC17) đúng luồng; ✅ email thông báo gửi lúc tạo — khớp (`contractRoutes.js:132-141`).
- 🔧 `currentTenantId` — trường không tồn tại trong schema (xem 2.12#2).

### 2.15 — Tuần tự Ghi chỉ số & Hoá đơn lô

- ❌ Actor "Quản lý" phát hành hoá đơn (như 2.10) — hệ thống: admin-only.
- ⚠️ Nhãn `Reading.insertMany()` — hệ thống lặp `Reading.create()` từng bản ghi (`readingRoutes.js:51+`). Cùng kết quả batch, sai tên hàm.
- ✅ Còn lại khớp (kể cả nhắc nợ admin+manager).

### 2.16 — Tuần tự Thanh toán online

- ✅ Nhánh VNPay khớp 100% (kể cả IPN, PaymentReturnPage, `Payment{vnpay, success}`).
- ✅ Nhánh tiền mặt khớp (kể cả note reject → `pending`).
- ❌ **Nhánh VietQR → `Invoice='paid'` + Payment ngay**: hệ thống → **`pending_cash`**, KHÔNG tạo Payment lúc đó; Payment chỉ tạo khi Quản lý xác nhận pay-cash.

### 2.17 — Tuần tự Chatbot AI

- ✅ verifyToken, nạp context (Properties/Services/Users/Rooms/Contracts/Invoices), retry 3 lần backoff 600ms, model `gemini-2.5-flash`, fallback `getFallbackResponse` + `isOnline` — khớp `chatRoutes.js` từng chi tiết.
- ⚠️ Chi tiết nhỏ: bước fallback vẽ "FB → DB: find()" — thực tế fallback dùng lại dữ liệu đã nạp ở Bước 1 (`getFallbackResponse(message, dbData)`), không query lại.

### 2.18 — Kiến trúc triển khai

- ✅ Port 5001 (`server.js:35`), Vite 5173, DNS 8.8.8.8 (`server.js:8`), 11 collections, JWT middleware, pdfkit, Fallback Engine, Gmail SMTP 587, VNPay HMAC-SHA512 + return/IPN, "58+ endpoints" (thực đếm: 66 ✅).
- Ghi chú nhỏ (không bắt buộc): emailService còn có **Brevo HTTP API fallback** khi SMTP lỗi (`emailService.js:19-39`) — chưa thể hiện.

---

## 2. TỔNG HỢP — PHÂN LOẠI CUỐI CÙNG

### A. Lệch so với hệ thống (bắt buộc sửa sơ đồ để đạt 100%) — 9 nhóm

1. **2.09 + 2.14**: tạo HĐ phải là `draft`, phòng chỉ đổi khi ký; xoá nhánh `cancelled`.
2. **2.11 + 2.16**: VietQR → `pending_cash` (không phải `paid`), Payment tạo khi xác nhận.
3. **2.10 + 2.15**: người phát hành hoá đơn lô = **Chủ trọ (admin)**, không phải Quản lý.
4. **2.12**: xoá `currentTenantId`; thêm `pending_cash` + `paymentMethod` (Invoice); sửa Payment (maHoaDonId 0..1, thêm maPhongId/ngayGiaoDich/ghiChu); thêm 4 đường quan hệ thiếu (Contract–User, User–Property, Invoice–Room, Payment–Room) + `ChiTietHoaDon.maDichVuId`; bổ sung trường Room/Property.
5. **Quyền actor trong các UC**: đồng bộ theo ma trận requireRole (chi tiết ở mục 1: 2.01/2.03/2.04/2.05/2.06).
6. **Visitor**: chatbot & đặt cọc đều yêu cầu đăng nhập → sửa 2.01/2.06b (thêm include Đăng nhập/Đăng ký cho UC38; bỏ/chú thích Visitor–Chatbot).
7. **2.02**: quên/đặt lại mật khẩu chỉ cho tenant; UC08 không có endpoint tương ứng.
8. **2.07**: chỉ kiểm tra email trùng (bỏ "SĐT").
9. **PNG 2.12 + ảnh trong docx**: bản cũ thiếu Expense → re-render + thay.

### B. Ký pháp UML sai (không lệch hệ thống, nên sửa cùng lúc)

- Mọi mũi tên `<<extend>>` ngược chiều (2.05, 2.06, 2.06b): đúng chuẩn là extension → base.
- Kim cương aggregation sai đầu: `Contract o-- Room`, `Reading o-- Service`; composition `Property *-- Room` nên là `o--`; bổ sung multiplicity 2 đầu.

### C. Hệ thống tự mâu thuẫn (quyết định sửa CODE hay chấp nhận — ảnh hưởng chuẩn)

1. `contractRoutes.js:210` ghi `currentTenantId` nhưng `Room.js` không khai báo → dead-write, mapper luôn trả null. **Nếu muốn giữ tính năng**: thêm 1 dòng vào Room.js; **nếu lấy hành vi hiện tại làm chuẩn**: xoá dòng code + xoá khỏi sơ đồ + sửa mô tả UC16/17/20 trong system_alignment_report (đang mô tả sai hành vi thực).
2. `paymentRoutes.js` đọc `invoice.code` — schema Invoice không có trường `code` (chỉ ảnh hưởng log/param redirect).
3. `POST /api/auth/register` nhận `role` tự do từ body (`vaiTro: role || 'tenant'`, `authRoutes.js:149,187`) → **ai cũng có thể tự đăng ký admin/manager**. Lỗ hổng bảo mật + mâu thuẫn mô tả UC01/UC08 ("mặc định tenant", "Owner phân quyền").
4. `system_alignment_report.md` mục 4 ghi "10 collection" nhưng liệt kê 11.

---

## 3. CHECKLIST SỬA ĐỂ ĐẠT 100% (theo thứ tự ưu tiên)

- [x] 2.09, 2.14: đổi luồng tạo HĐ = draft; chuyển cập nhật phòng sang bước ký; xoá nhánh cancelled
- [x] 2.11, 2.16: VietQR → pending_cash
- [x] 2.10, 2.15: đổi actor phát hành hoá đơn thành Chủ trọ
- [x] 2.12: sửa lớp + quan hệ theo mục A.4 *(re-render PNG + thay image15 trong docx: chờ người dùng — xem Phần II mục 3)*
- [x] 2.01–2.06b: đồng bộ actor theo ma trận quyền; sửa Visitor flows; đảo chiều extend
- [ ] Quyết định mục C.1 (currentTenantId) và C.3 (register role) — sửa code hay sửa đặc tả *(chưa quyết — sơ đồ tạm theo hành vi thực tế của hệ thống)*

---

# PHẦN II — TÁI XÁC MINH SAU CHỈNH SỬA (02/07/2026)

**Phạm vi chỉnh sửa đã thực hiện:** 19 file `.puml` (viết lại theo hệ thống + ngôn ngữ tự nhiên), `docs/class_diagram.puml` (đồng bộ với 2.12), `PlantUML_Code.md` (tổng hợp lại), `urls.txt` (mã hoá lại 19 URL render), `README.md` (cập nhật hướng dẫn), `system_alignment_report.md` (sửa 5 mô tả lỗi thời: UC16/17/20, "10 collection", "mảng" thongTinKhachThue).

## 1. Bảng tái xác minh từng sơ đồ (từng khẳng định đối chiếu code)

| Sơ đồ | Các điểm đã đối chiếu lại với hệ thống | Kết quả |
|---|---|---|
| 2.01 | Toàn bộ liên kết actor–UC khớp ma trận `requireRole`: Owner thêm Room/Contract/Service/Meter/Notify; Manager thêm Service/Invoice/Report; Tenant thêm Auth/Search; Visitor bỏ Chatbot (`chatRoutes.js:332 verifyToken`); ghi chú tìm kiếm công khai (`GET /rooms/search` không token) | ✅ 100% |
| 2.02 | UC04/05 gắn Khách thuê (`authRoutes.js:330,375` lọc `vaiTro:'tenant'`); ghi chú UC08 = kiểm soát vai trò bằng middleware (không có endpoint đổi vai trò); OTP chỉ ở đăng ký + quên mật khẩu | ✅ 100% |
| 2.03 | Owner nối R4–R6 (`roomRoutes` admin+manager); ghi chú cọc 24h (`roomRoutes.js:28` đúng 24×60×60×1000); ngừng nhà trọ = soft-inactive (`propertyRoutes.js:167`) | ✅ 100% |
| 2.04 | Owner nối C2/C4/C5/C6 (`contractRoutes` admin+manager); bỏ include Lập→Ký; ghi chú draft→ký; tự tạo User mật khẩu mặc định (`contractRoutes.js:96-98`) | ✅ 100% |
| 2.05 | B4 chỉ Owner (`invoiceRoutes.js:139 requireRole('admin')`); B1/B2/B5/B7 Owner+Manager đúng requireRole; include B4→B3; extend B5→B4 đúng chiều; ghi chú đối soát 2 bước | ✅ 100% |
| 2.06 | Manager nối E1/E3 (`reportRoutes.js:32,157` admin+manager); E2/E4/E5/E6 chỉ Owner (admin-only); extend E6→từng báo cáo | ✅ 100% |
| 2.06b | F3, F4 include "Đăng nhập/Đăng ký" (`verifyToken` ở cả deposit lẫn chat; `DepositPage.jsx` có sẵn form login/đăng ký OTP); bỏ Visitor–F4; đặt cọc chỉ phòng trống (`roomRoutes.js` trả 409) + tự giải phóng 24h | ✅ 100% |
| 2.07 | Chỉ kiểm tra email trùng (`findOne({email})`); nhánh email pending → cập nhật + gửi lại OTP mới (`authRoutes.js:140-160`); OTP 6 số/5 phút; kích hoạt → xoá OTP + cấp phiên | ✅ 100% |
| 2.08 | 5 thao tác khớp 5 endpoint; cập nhật tongSoPhong/soPhongDaThue (`roomRoutes.js:206,256`) | ✅ 100% |
| 2.09 | Tạo = **Nháp**, phòng không đổi khi tạo (`contractRoutes.js:126`); ký → Hiệu lực + phòng Đang thuê + đếm +1 (`:204-217`); nhánh "chưa đồng ý" = giữ Nháp (không còn 'cancelled' — hệ thống không có endpoint từ chối) | ✅ 100% |
| 2.10 | Chủ trọ phát hành hoá đơn (lane riêng); cảnh báo đúng thực tế: điện > 250 kWh (`MetersPage.jsx:74`), giá trị âm chặn về 0 (`Math.max(0,...)`); xoá hoá đơn trùng kỳ + hạn 5 ngày (`invoiceRoutes.js:186-196`) | ✅ 100% |
| 2.11 | VietQR → **Chờ xác nhận** (`invoiceRoutes.js:123-127`); xác nhận tạo giao dịch đúng kênh cash/bank_transfer (`:213-222`); VNPay verify chữ ký + IPN (`paymentRoutes.js:26-69`) | ✅ 100% |
| 2.12 | 11 trường schema đối chiếu từng dòng với `models/*.js`; bỏ currentTenantId; đủ enum `pending_cash` + `paymentMethod`; Payment 0..1 hoá đơn + gắn phòng; 14 quan hệ = 14 ref thực trong schema; chú thích composition=nhúng | ✅ 100% |
| 2.13 | Từng message khớp handler đăng ký/verify-otp (kể cả note pending-resend, cấp JWT sau kích hoạt `authRoutes.js:240-260`) | ✅ 100% |
| 2.14 | Tạo Nháp (không đụng phòng) → Ký mới đổi phòng + đếm; email gửi lúc tạo (`contractRoutes.js:132-141`) | ✅ 100% |
| 2.15 | Chủ trọ phát hành (actor riêng); "lưu lần lượt từng bản ghi" đúng vòng lặp `Reading.create` (`readingRoutes.js:51+`, không phải insertMany); công thức tiền + phí cố định đúng `invoiceRoutes.js:150-185` | ✅ 100% |
| 2.16 | 3 nhánh khớp code: VNPay → paid + giao dịch ngay khi verify; VietQR → Chờ xác nhận, giao dịch chỉ tạo khi Quản lý xác nhận; tiền mặt tương tự; từ chối → trả về Chờ thanh toán (`reject-cash → 'pending'`) | ✅ 100% |
| 2.17 | Yêu cầu đăng nhập; nạp 6 nhóm dữ liệu (`chatRoutes.js:30-53`); 3 lần thử/600ms (`:373-374`); Gemini 2.5 Flash (`:378`); bộ ngoại tuyến dùng lại dữ liệu đã nạp (`getFallbackResponse(message, dbData)` — không truy vấn lại) | ✅ 100% |
| 2.18 | 66 endpoints (đếm thực từ 14 file routes); port 5001/5173; DNS 8.8.8.8 (`server.js:8`); 4 luồng email + Brevo dự phòng (`emailService.js`); VNPay HMAC + IPN | ✅ 100% |

## 1b. Bổ sung ngày 02/07/2026 — Kế thừa actor cho sơ đồ use case

Theo yêu cầu "dùng tính kế thừa cho gọn", 7 sơ đồ UC được bổ sung generalization:
- `Chủ trọ --|> Quản lý` (2.01, 2.03, 2.04, 2.05, 2.06, 2.06b) — **hợp lệ về hệ thống** vì đã kiểm chứng: mọi endpoint gắn `requireRole('admin','manager')`, không tồn tại endpoint nào chỉ dành riêng manager.
- `Khách thuê --|> Người dùng`, `Chủ trọ --|> Người dùng` (2.02) — dùng chung Đăng ký / Đăng nhập / Đăng xuất / Cập nhật hồ sơ.
- Kiểm chứng bằng script (khai triển bao đóng kế thừa): tập chức năng hiệu dụng của từng actor **không đổi** so với bản vẽ đầy đủ liên kết — ví dụ Owner ở 2.01 vẫn đủ 11 nhóm UC, ở 2.05 vẫn đủ B1/B2/B4/B5/B7/B9. Giảm 23 liên kết trùng lặp trên 7 sơ đồ.

## 1c. Bổ sung 02/07/2026 (tối) — Đồng bộ theo commit `ae176dd` của hệ thống

Commit "Cho phép mọi đối tượng sử dụng chatbot AI kể cả khi chưa đăng nhập" gỡ `verifyToken` khỏi `POST /api/chat` (diff đúng 1 dòng). Cập nhật tương ứng:
- **2.06b**: thêm `Khách vãng lai — Chatbot`; bỏ include "Đăng nhập/Đăng ký" khỏi Chatbot (Đặt cọc vẫn giữ include vì `roomRoutes.js:283` còn `verifyToken`); bỏ đánh số UC trong nhãn cho đồng bộ phong cách người dùng đã áp dụng ở 2.02–2.06.
- **2.01**: thêm `Visitor — Trợ lý ảo`; sửa note thành "mở công khai".
- **2.17**: actor "Người dùng (mọi đối tượng)"; sửa note yêu cầu đăng nhập → mở công khai.
- Ghi nhận biên tập thủ công của người dùng (giữ nguyên, không ảnh hưởng độ khớp hệ thống): bỏ các note giải thích và bỏ đánh số UC ở 2.02–2.06, bỏ liên kết Khách thuê–Tìm kiếm ở 2.06b (chủ ý mô hình hoá tìm kiếm/đặt cọc thuộc hành trình Khách vãng lai).

## 2. Kiểm tra tự động sau chỉnh sửa

- Cú pháp PlantUML (heuristic): cân bằng `@startuml/@enduml`, `if/endif`, `switch/endswitch`, `repeat/repeat while`, `alt·loop/end`, `note/end note`, ngoặc class → **19/19 đạt**.
- Quét nội dung cấm: không còn `currentTenantId`, tên hàm, endpoint `/api/...`, `localStorage`… trong 18 sơ đồ hành vi (2.18 kiến trúc giữ tên công nghệ là đúng bản chất).
- `'cancelled'` chỉ còn xuất hiện đúng 1 chỗ hợp lệ: enum Invoice (schema thật có giá trị này).
- Chiều `<<include>>`/`<<extend>>`: 13/13 mũi tên đúng chuẩn UML.

## 3. Việc còn lại (ngoài phạm vi file .puml)

1. **Render lại 19 PNG**: môi trường làm việc không cài được PlantUML (mạng chặn apt/jar). Dùng `docs/diagrams/urls.txt` (đã mã hoá lại theo bản mới) — mở từng URL, lưu PNG đè vào `docs/diagrams/png/`.
2. **Thay ảnh trong file Word**: tối thiểu Hình 2.12 (đang nhúng bản cũ thiếu Expense — image15); khuyến nghị thay toàn bộ 19 hình sau khi render.
3. **Hai quyết định code (mục C Phần I)** — chưa thực hiện vì cần bạn chọn:
   - `currentTenantId`: sơ đồ hiện theo hành vi thực (không có trường này). Nếu muốn giữ tính năng "phòng ghi nhớ khách đang thuê" → thêm 1 dòng vào `Room.js` + thêm lại vào sơ đồ + bỏ ghi chú tương ứng.
   - `register` nhận `role` từ client (`authRoutes.js:149,187`): lỗ hổng cho phép tự đăng ký admin/manager — nên vá (ép `vaiTro:'tenant'` khi đăng ký công khai).
