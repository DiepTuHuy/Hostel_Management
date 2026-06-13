# Tài Liệu Đặc Tả Tính Năng Hệ Thống (System Features)
## Hệ thống Quản lý Chuỗi Nhà Trọ — BoardingHouse Pro

Tài liệu này đặc tả toàn bộ các module, tính năng và các API endpoint thực tế đang chạy trong hệ thống backend của BoardingHouse Pro. Đây là căn cứ trung thực nhất để xây dựng kịch bản kiểm thử (test cases).

---

## 1. Module Xác Thực & Quản Lý Người Dùng (Authentication & User)
Quản lý luồng đăng ký, đăng nhập, bảo mật 2 lớp (OTP), cấp lại mật khẩu và phân quyền vai trò (Admin, Manager, Tenant).
*   **POST `/api/auth/register`**: Đăng ký tài khoản cho khách thuê. Yêu cầu họ tên, số điện thoại, email và mật khẩu. Sau khi đăng ký, tài khoản ở trạng thái `pending` và hệ thống tự động sinh mã OTP gửi qua email.
*   **POST `/api/auth/verify-otp`**: Xác thực tài khoản bằng mã OTP (6 chữ số). Khi xác thực đúng, trạng thái người dùng chuyển thành `active`.
*   **POST `/api/auth/resend-otp`**: Gửi lại mã OTP xác thực.
*   **POST `/api/auth/login`**: Đăng nhập bằng email và mật khẩu. Đối với vai trò Admin, hệ thống yêu cầu xác thực OTP 2 lớp để bảo vệ tài khoản quản trị. Trả về mã JWT token.
*   **POST `/api/auth/forgot-password`**: Yêu cầu khôi phục mật khẩu, hệ thống sinh OTP khôi phục gửi qua email.
*   **POST `/api/auth/reset-password`**: Nhập mã OTP và mật khẩu mới để đặt lại mật khẩu.
*   **POST `/api/auth/logout`**: Hủy phiên làm việc và đăng xuất.
*   **GET `/api/users`**: Lấy danh sách tài khoản (chỉ dành cho Admin).
*   **GET `/api/users/:id`**: Xem thông tin chi tiết tài khoản.
*   **PUT `/api/users/:id`**: Cập nhật thông tin cá nhân (họ tên, ngày sinh, CCCD, quê quán).
*   **PATCH `/api/users/:id/status`**: Khóa hoặc mở khóa tài khoản người dùng (chỉ dành cho Admin).

---

## 2. Module Quản Lý Nhà Trọ (Property Management)
Quản lý thông tin các tòa nhà/cơ sở nhà trọ trong chuỗi.
*   **GET `/api/properties`**: Lấy danh sách tất cả nhà trọ. Hỗ trợ lọc theo khu vực/quận huyện.
*   **GET `/api/properties/:id`**: Xem chi tiết thông tin một nhà trọ.
*   **POST `/api/properties`**: Thêm nhà trọ mới (tên nhà trọ, địa chỉ, quận huyện, tổng số tầng, chỉ định chủ nhà).
*   **PUT `/api/properties/:id`**: Sửa thông tin nhà trọ.
*   **DELETE `/api/properties/:id`**: Xóa/ngừng hoạt động nhà trọ.

---

## 3. Module Quản Lý Loại Phòng & Phòng Trọ (Room Type & Room)
Quản lý cấu hình loại phòng (tiện nghi, đơn giá cơ bản) và các phòng trọ vật lý.
*   **GET `/api/properties/:propertyId/room-types`**: Lấy danh sách các loại phòng thuộc một cơ sở nhà trọ.
*   **POST `/api/room-types`**: Tạo loại phòng mới (tên loại phòng, diện tích, giá cơ bản, danh sách tiện nghi đi kèm).
*   **PUT `/api/room-types/:id`**: Sửa thông tin loại phòng.
*   **DELETE `/api/room-types/:id`**: Xóa loại phòng.
*   **GET `/api/rooms`**: Lấy danh sách tất cả các phòng trọ. Hỗ trợ phân trang và lọc theo nhà trọ, loại phòng, trạng thái.
*   **GET `/api/rooms/search`**: Tìm kiếm phòng trống cho khách vãng lai. Lọc nâng cao theo quận huyện, khoảng giá thuê, diện tích và các tiện nghi mong muốn (điều hòa, nóng lạnh, tủ lạnh, máy giặt, gác lửng, ban công).
*   **GET `/api/rooms/:id`**: Xem chi tiết phòng trọ kèm danh mục tài sản bàn giao cụ thể (tên tài sản, giá trị, tình trạng).
*   **POST `/api/rooms`**: Tạo phòng trọ mới (gán vào nhà trọ, loại phòng, số phòng, số tầng, giá thuê hiện tại).
*   **PUT `/api/rooms/:id`**: Sửa thông tin phòng trọ hoặc danh mục tài sản đi kèm.
*   **DELETE `/api/rooms/:id`**: Xóa phòng trọ.
*   **PATCH `/api/rooms/:id/status`**: Cập nhật trạng thái phòng (`empty` - trống, `rented` - đã thuê, `deposit` - đã đặt cọc, `maintenance` - bảo trì).
*   **POST `/api/rooms/:id/deposit`**: Đặt cọc giữ phòng online (khách vãng lai gửi yêu cầu giữ phòng kèm số tiền cọc).

---

## 4. Module Quản Lý Hợp Đồng Thuê (Contract Management)
Vận hành vòng đời hợp đồng từ khi dự thảo đến khi thanh lý.
*   **GET `/api/contracts`**: Danh sách hợp đồng thuê phòng. Lọc theo trạng thái (`draft`, `active`, `expired`, `terminated`).
*   **GET `/api/contracts/:id`**: Chi tiết hợp đồng (ngày bắt đầu, ngày kết thúc, giá thuê, tiền cọc, danh sách khách thuê ở ghép).
*   **POST `/api/contracts`**: Lập hợp đồng nháp (gán phòng, khách thuê chính, các khách ở ghép, tiền cọc, thời hạn thuê). Phòng trọ tự động chuyển sang trạng thái chờ ký.
*   **PUT `/api/contracts/:id`**: Cập nhật nội dung hợp đồng nháp.
*   **PATCH `/api/contracts/:id/sign`**: Khách thuê ký số hợp đồng bằng mã OTP xác thực. Khi ký thành công, trạng thái hợp đồng chuyển sang `active`, trạng thái phòng trọ tự động chuyển sang `rented`.
*   **PATCH `/api/contracts/:id/extend`**: Đề xuất gia hạn hợp đồng (thêm số tháng thuê, điều chỉnh giá thuê mới nếu có).
*   **PATCH `/api/contracts/:id/terminate`**: Thanh lý hợp đồng / trả phòng. Quản lý thực hiện ghi nhận ngày trả thực tế, tính toán khấu trừ hư hỏng thiết bị và hoàn trả tiền cọc còn lại cho khách. Phòng trọ tự động chuyển về trạng thái `empty`.
*   **GET `/api/contracts/:id/pdf`**: Xuất file PDF hợp đồng thuê chính thức có đóng dấu ký số của hai bên để tải về hoặc in ấn.

---

## 5. Module Quản Lý Dịch Vụ & Chỉ Số Điện Nước (Service & Reading)
Cấu hình các dịch vụ đi kèm và ghi nhận chỉ số tiêu dùng hàng tháng.
*   **GET `/api/services`** / **POST `/api/services`** / **PUT `/api/services/:id`** / **DELETE `/api/services/:id`**: Cấu hình các dịch vụ tại nhà trọ. Hỗ trợ 2 loại tính phí:
    - `fixed`: Phí cố định tính theo phòng hoặc người (Ví dụ: Internet, rác, vệ sinh).
    - `metered`: Phí tính theo chỉ số tiêu thụ tiêu dùng (Ví dụ: Điện, Nước).
*   **GET `/api/readings`**: Xem danh sách chỉ số điện nước đã ghi nhận.
*   **POST `/api/readings`**: Quản lý nhập chỉ số điện nước định kỳ hàng tháng cho từng phòng. Hệ thống tự động tính toán lượng tiêu thụ (`tieuThu = chiSoMoi - chiSoCu`).

---

## 6. Module Hóa Đơn & Thanh Toán (Invoice & Payment)
Quản lý thu chi phí thuê phòng và dịch vụ hàng tháng của khách thuê.
*   **GET `/api/invoices`**: Lấy danh sách hóa đơn. Hỗ trợ lọc theo phòng, khách thuê, trạng thái thanh toán và kỳ thanh toán.
*   **GET `/api/invoices/:id`**: Xem chi tiết hóa đơn (chi tiết tiền phòng, tiền điện, nước, internet, rác và tổng tiền).
*   **POST `/api/invoices/generate`**: Sinh hóa đơn hàng loạt cho tất cả các phòng đang có hợp đồng hoạt động (`active`) trong một cơ sở tại kỳ thanh toán chỉ định. Hệ thống tự động lấy tiền phòng cố định, cộng với tiền điện nước tính theo chỉ số ghi nhận và phí dịch vụ cố định để ra tổng tiền.
*   **POST `/api/invoices/:id/pay`**: Khách thuê gửi yêu cầu thanh toán hóa đơn. Hỗ trợ 3 phương thức:
    - `cash` (Tiền mặt): Hóa đơn chuyển trạng thái sang `pending_cash` (chờ Quản lý xác nhận thu).
    - `bank_transfer` (Chuyển khoản VietQR): Hóa đơn chuyển sang `pending_cash` (chờ Quản lý đối soát sao kê).
    - `vnpay` (VNPay Sandbox): Sinh link thanh toán có mã hóa chữ ký HMAC-SHA512 hướng khách sang cổng thanh toán VNPay.
*   **POST `/api/invoices/:id/pay-cash`**: Quản lý/Admin bấm xác nhận đã nhận tiền mặt hoặc đối soát thành công chuyển khoản ngân hàng. Hóa đơn chuyển sang trạng thái `paid` (đã thanh toán), đồng thời hệ thống tự sinh bản ghi Payment và Phiếu thu điện tử.
*   **POST `/api/invoices/:id/reject-cash`**: Quản lý từ chối xác nhận thanh toán (ví dụ: chuyển khoản sai số tiền hoặc chưa nhận được tiền). Hóa đơn quay về trạng thái `pending` (chưa thanh toán).
*   **GET `/api/invoices/:id/pdf`**: Xuất phiếu thu/hóa đơn dịch vụ hàng tháng dưới dạng PDF.
*   **GET `/api/payments/vnpay-return`** / **GET `/api/payments/vnpay-ipn`**: Nhận phản hồi thanh toán tự động (IPN) từ cổng VNPay Sandbox. Đối soát chữ ký bảo mật, cập nhật hóa đơn sang `paid` và tạo bản ghi Payment thành công tự động.

---

## 7. Module Báo Cáo & Thống Kê (Reports & KPIs)
Cung cấp số liệu tài chính động trực quan cho quản trị viên.
*   **GET `/api/reports/dashboard`**: Dashboard tổng quan hiển thị các chỉ số KPI động: Tổng doanh thu thực tế, Tỷ lệ lấp đầy phòng trọ, Tổng công nợ chưa thu và Tổng chi phí vận hành.
*   **GET `/api/reports/revenue`**: Thống kê doanh thu chi tiết theo từng tháng và từng chi nhánh nhà trọ dưới dạng biểu đồ.
*   **GET `/api/reports/expenses`**: Báo cáo tổng hợp chi phí đầu vào.
*   **GET `/api/reports/occupancy`**: Báo cáo tỷ lệ phòng trống, phòng đang thuê và phòng bảo trì của hệ thống.
*   **GET `/api/reports/debts`**: Báo cáo chi tiết công nợ quá hạn của khách thuê chưa thanh toán hóa đơn.
*   **POST `/api/reports/debts/:invoiceId/remind`**: Gửi tin nhắn cảnh báo nhắc nợ tự động thông qua Telegram Bot trực tiếp đến khách thuê có hóa đơn quá hạn.
*   **GET `/api/reports/pdf`**: Xuất PDF báo cáo thống kê doanh thu hoặc công nợ của hệ thống (phục vụ in ấn báo cáo năm/quý).

---

## 8. Module Chi Phí Vận Hành (Expense Management)
*   **GET `/api/expenses`**: Danh sách chi phí phát sinh chung của tòa nhà (Ví dụ: tiền sửa máy bơm, tiền bảo trì thang máy, tiền vệ sinh ngõ chung).
*   **POST `/api/expenses`**: Quản lý ghi nhận một khoản chi phí mới (tên chi phí, số tiền chi, danh mục chi, ngày chi, tệp hóa đơn/ảnh đính kèm).
*   **DELETE `/api/expenses/:id`**: Xóa bản ghi chi phí.

---

## 9. Module Chat Hỗ Trợ (Chat Support)
*   **POST `/api/chat`**: Gửi tin nhắn real-time giữa Khách thuê và Quản lý/Chủ nhà để trao đổi sự cố, phản ánh dịch vụ.

---

## 10. Module Thông Báo (Notification)
*   **GET `/api/notifications`**: Lấy danh sách thông báo gửi tới tài khoản.
*   **PATCH `/api/notifications/:id/read`**: Đánh dấu thông báo cụ thể là đã đọc.
*   **POST `/api/notifications/read-all`**: Đánh dấu đã đọc tất cả thông báo.
