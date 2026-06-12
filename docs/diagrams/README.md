# Sơ đồ PlantUML — Phiên bản cập nhật theo hệ thống thực tế

Thư mục này chứa **18 file PlantUML source code** đã được viết lại sạch sẽ, có cấu trúc rõ ràng, dùng cho đặc tả `Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx`.

## Cách render thành ảnh PNG

### Cách 1 — Dùng planttext.com (online, không cần cài đặt)

1. Truy cập https://www.planttext.com/
2. Copy toàn bộ nội dung file `.puml` cần render → paste vào ô soạn thảo bên trái
3. Nhấn nút **Refresh** (hoặc tự động render)
4. Click chuột phải vào ảnh ở khung phải → **Save image as...** → đặt tên `2.XX_xxx.png`
5. Vào file `.docx` → đặt con trỏ ngay sau dòng "Hình 2.X — ..." → **Insert → Pictures → This Device** → chọn file PNG vừa lưu

### Cách 2 — Dùng URL trực tiếp (nhanh hơn)

Mở file `urls.txt` ở thư mục này — mỗi dòng là một URL plantuml.com PNG sẵn sàng tải về. Chỉ cần click hoặc paste URL vào trình duyệt.

### Cách 3 — Render hàng loạt bằng Java (nếu có cài Java JDK)

```bash
# Tải plantuml.jar về thư mục này
curl -fsSL -o plantuml.jar https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar

# Render tất cả .puml → .png
java -jar plantuml.jar *.puml -o ./png/
```

## Danh sách 18 sơ đồ và mục tương ứng trong đặc tả

| File | Hình trong đặc tả | Mô tả |
|---|---|---|
| `2.01_uc_overall.puml` | Hình 2.1 | Sơ đồ Use Case tổng quát (4 actor + 12 nhóm UC + UC39 Chatbot) |
| `2.02_uc_auth.puml` | Hình 2.2 | UC nhóm A: Xác thực & tài khoản (đã bỏ OTP login) |
| `2.03_uc_room.puml` | Hình 2.3 | UC nhóm B: Nhà trọ, chi nhánh & phòng |
| `2.04_uc_contract.puml` | Hình 2.4 | UC nhóm C: Hợp đồng & khách thuê |
| `2.05_uc_billing.puml` | Hình 2.5 | UC nhóm D: Dịch vụ, ghi chỉ số, hoá đơn & thanh toán |
| `2.06_uc_report.puml` | Hình 2.6 | UC nhóm E: Báo cáo & thống kê |
| `2.06b_uc_utilities.puml` | Hình 2.6b | UC nhóm F: Tiện ích bổ trợ (UC36-UC39 — bao gồm Chatbot AI với extend Online/Offline) |
| `2.07_act_register_otp.puml` | Hình 2.7 | Activity: Đăng ký + Kích hoạt OTP (đã đổi tên từ "Đăng nhập OTP") |
| `2.08_act_room.puml` | Hình 2.8 | Activity: Quản lý phòng |
| `2.09_act_contract_sign.puml` | Hình 2.9 | Activity: Lập hợp đồng & ký số |
| `2.10_act_meter_invoice.puml` | Hình 2.10 | Activity: Ghi chỉ số & tạo hoá đơn lô |
| `2.11_act_payment.puml` | Hình 2.11 | Activity: Thanh toán hoá đơn (VNPay/Bank/Cash) |
| `2.12_class_diagram.puml` | Hình 2.12 | Class Diagram NoSQL (10 collection + 4 embedded) |
| `2.13_seq_register_otp.puml` | Hình 2.13 | Sequence: Đăng ký + Kích hoạt OTP |
| `2.14_seq_contract_sign.puml` | Hình 2.14 | Sequence: Tạo & ký số hợp đồng |
| `2.15_seq_meter_invoice.puml` | Hình 2.15 | Sequence: Ghi chỉ số & tạo hoá đơn lô |
| `2.16_seq_payment_vnpay.puml` | Hình 2.16 | Sequence: Thanh toán VNPay (v1 giả lập / v2 thật) |
| `2.17_seq_chatbot_ai.puml` | Hình 2.17 (mới) | Sequence: AI Chatbot với Offline Fallback |
| `2.18_architecture.puml` | Hình 2.18 (mới) | Architecture: 3 tầng React + Express + MongoDB Atlas |

## Các sửa đổi so với sơ đồ gốc

- **Hình 2.1**: Thêm UC39 Chatbot, gỡ Owner→UC_Search (Visitor mới search), nhóm các UC theo 6 package.
- **Hình 2.2**: Đổi UC02 thành "Đăng nhập (email + mật khẩu)", bỏ relationship `U2 .> U7 <<include>>`, thêm `U1 .> U7 <<include>>` (đăng ký mới có OTP) và `U4 .> U7 <<include>>` (quên mật khẩu có OTP).
- **Hình 2.3**: Tách 2 cấp Nhà trọ và Phòng, đánh số UC09–UC14 rõ ràng.
- **Hình 2.4**: Quản lý nhóm UC-C: Hợp đồng & khách thuê (đã đánh số lại liên tục UC01–UC39 sau khi loại bỏ UC đăng ký tạm trú).
- **Hình 2.5**: Đánh dấu UC26 VNPay là "v1 giả lập".
- **Hình 2.6**: Đánh dấu UC34 (chi phí), UC35 (xuất Excel/PDF) là "định hướng v2".
- **Hình 2.6b (MỚI)**: Tách riêng nhóm UC-F Tiện ích bổ trợ (UC36 nhắc nợ, UC37 tìm phòng, UC38 đặt cọc, UC39 Chatbot AI). UC39 có quan hệ `<<extend>>` với 2 use case con "Tra cứu trực tuyến (online LLM)" và "Tra cứu ngoại tuyến (offline fallback)"; gắn external actor `Gemini API` để thể hiện tích hợp bên thứ ba.
- **Cập nhật style UC (2.1–2.6, 2.6b)**: Đổi từ `-->` sang `--` để tuân thủ UML chuẩn (liên kết Actor–UseCase là association không định hướng).
- **Hình 2.7**: Đổi tên thành "Đăng ký + Kích hoạt OTP" (không còn login OTP).
- **Hình 2.8–2.11**: Bổ sung tên endpoint REST API cụ thể (POST /api/rooms, PATCH /:id/status…) cho từng bước.
- **Hình 2.12**: Vẽ lại theo mô hình NoSQL — 10 class + 4 embedded (ThongTinKhachThue, Otp, TaiSan, ChiTietHoaDon).
- **Hình 2.13**: Đổi tên thành "Đăng ký + Kích hoạt OTP qua Email" (theo cài đặt thực tế).
- **Hình 2.14–2.16**: Ghi chú "v1" và "v2 định hướng" rõ ràng cho các bước giả lập.
- **Hình 2.17 (MỚI)**: AI Chatbot 2 tầng — Online Gemini + Offline Fallback đọc trực tiếp MongoDB.
- **Hình 2.18 (MỚI)**: Architecture triển khai thực tế (Chrome → Vite 5173 → Express 5001 → MongoDB Atlas + Gemini + Gmail SMTP).
