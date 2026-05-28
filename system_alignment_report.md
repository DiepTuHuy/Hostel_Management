# BÁO CÁO ĐÁNH GIÁ SỰ LIÊN KẾT GIỮA HỆ THỐNG THỰC TẾ VÀ TÀI LIỆU ĐẶC TẢ
*(Boarding House Chain Management System - Alignment Report)*

> [!NOTE]
> Báo cáo này thực hiện đối chiếu mã nguồn thực tế (giao diện Frontend, cơ sở dữ liệu MongoDB Atlas, các API Node.js Express & Python Flask) với tài liệu đặc tả `Báo cáo PTTKHT - Quản lý chuỗi nhà trọ (đã chỉnh sửa).docx` (được đọc qua bản trích xuất `report.txt`). Báo cáo tập trung chỉ ra các điểm lệch pha và đề xuất nội dung cần bổ sung trong tài liệu đặc tả để đạt tính liên kết chặt chẽ nhất.

---

## 1. BẢNG ĐỐI CHIẾU TỔNG QUAN

| Tiêu chí | Mô tả trong tài liệu đặc tả | Thực trạng hệ thống thực tế | Đánh giá mức độ liên kết |
| :--- | :--- | :--- | :--- |
| **Giao diện (Frontend)** | Mô tả chạy trên nền tảng Web (ReactJS) và Mobile (React Native). | Chia thành 4 thư mục UI phẳng độc lập (`Admin_UI`, `Manager_UI`, `Tenant_UI`, `Visitor_UI`) sử dụng **HTML, CSS, JS thuần (Vanilla)**, kết hợp thư viện biểu đồ tĩnh. | **Lệch pha trung bình**: Cần cập nhật công nghệ Frontend trong tài liệu sang HTML/CSS/JS thuần hoặc ghi rõ ReactJS là định hướng nâng cấp. |
| **Backend & API** | Đề xuất sử dụng Node.js hoặc Spring Boot để xây dựng REST API. | Chạy song song hai backend kết nối chung database: **Node.js Express** (port 5001 - xử lý auth, CRUD, chatbot, mail OTP) và **Python Flask** (xử lý logic dữ liệu và thống kê). | **Lệch pha nhẹ**: Cần bổ sung Python Flask vào phần thiết kế kiến trúc hệ thống của tài liệu. |
| **Cơ sở dữ liệu** | Class Diagram thiết kế theo mô hình quan hệ (chứa các bảng thực thể riêng biệt như Vai trò, Chi tiết hóa đơn, Tài sản). | Sử dụng **MongoDB (NoSQL)**. Các thực thể phụ được nhúng trực tiếp (embedded arrays) để tối ưu hiệu năng. | **Lệch pha lớn**: Class Diagram tiếng Việt và Schema MongoDB tiếng Anh có cấu trúc quan hệ khác nhau. |
| **Xác thực OTP** | Đăng nhập hệ thống bắt buộc có xác thực 2 lớp qua mã OTP (UC02). | Đăng nhập trực tiếp bằng email/mật khẩu. OTP được dùng ở luồng **Đăng ký tài khoản** để kích hoạt tài khoản trạng thái *pending*. | **Lệch pha trung bình**: Cần điều chỉnh lại mô tả Use Case xác thực OTP. |
| **Ký số hợp đồng** | Ký số trực tuyến nhúng chữ ký vẽ tay hoặc OTP, xuất file PDF (UC16 + UC17). | Lưu đường dẫn file PDF tĩnh (`fileUrl`). Logic ký số động và vẽ tay chưa được phát triển thực tế mà chỉ lưu trạng thái qua API. | **Mô phỏng**: Cần ghi rõ đây là tính năng giả lập hoặc bổ sung mô tả giới hạn công nghệ. |
| **Đăng ký tạm trú** | Tự động sinh mẫu CT01 gửi qua API cho Công an phường (UC21). | Không có mã nguồn hay API endpoint nào thực hiện gửi dữ liệu CT01 đi cơ quan công an. | **Chưa triển khai**: Tính năng này hoàn toàn nằm ngoài mã nguồn thực tế. |

---

## 2. PHÂN TÍCH CHI TIẾT SỰ LỆCH PHA (MISALIGNMENT)

### 2.1. Cấu trúc Mô hình lớp (Class Diagram) và Cơ sở dữ liệu

Sơ đồ lớp trong tài liệu đặc tả sử dụng tiếng Việt không dấu và thiết kế theo tư duy cơ sở dữ liệu quan hệ (RDBMS). Trong khi đó, hệ thống thực tế sử dụng cơ sở dữ liệu phi quan hệ **MongoDB** với các Schema định nghĩa bằng tiếng Anh. Sự lệch pha cụ thể:

1. **Lớp VaiTro (Role)**:
   - *Đặc tả*: Tách thành lớp riêng biệt `VaiTro` kết nối quan hệ `1 - *` với `NguoiDung`.
   - *Thực tế*: Không có collection riêng cho vai trò. Thuộc tính `role` được lưu trực tiếp dưới dạng trường enum `['admin', 'manager', 'tenant']` ngay trong Schema `User`.
2. **Lớp KhachThue (Tenant)**:
   - *Đặc tả*: Thể hiện quan hệ kế thừa `KhachThue --|> NguoiDung`.
   - *Thực tế*: Không có collection `KhachThue` riêng. Dữ liệu định danh khách thuê được lưu trong trường nhúng `tenantProfile` (`cccd`, `occupation`, `permanentAddress`) trực tiếp trong Schema `User`.
3. **Lớp TaiSan (Assets)**:
   - *Đặc tả*: Là thực thể độc lập liên kết Composite với `PhongTro`.
   - *Thực tế*: Không có collection `TaiSan`. Các tài sản được lưu dưới dạng một mảng tài liệu nhúng `assets: [{ name, value, condition }]` nằm trong Schema `Room`.
4. **Lớp ChiTietHoaDon (InvoiceDetails)**:
   - *Đặc tả*: Là thực thể riêng kết nối với `HoaDon`.
   - *Thực tế*: Nhúng trực tiếp mảng `details: [{ serviceId, name, quantity, price, amount }]` bên trong Schema `Invoice`.
5. **Ràng buộc Chi nhánh / Nhà trọ**:
   - *Thực tế*: Schema `RoomType` (Loại phòng) và `Service` (Dịch vụ) đều có trường `propertyId` để quản lý theo từng cơ sở cụ thể. Đặc tả chưa mô tả các mối liên kết này, dẫn đến việc thiết kế đơn giá dịch vụ bị hiểu lầm là áp dụng chung cho toàn hệ thống thay vì cấu hình riêng cho từng khu trọ.

### 2.2. Sự khác biệt về Luồng Nghiệp vụ (Use Cases)

1. **Xác thực OTP (Authentication OTP)**:
   - *Đặc tả (UC02)*: Đăng nhập -> Kiểm tra mật khẩu -> Sinh OTP -> Nhập OTP -> Cấp JWT.
   - *Thực tế*: Đăng nhập chỉ cần Email/Password. OTP thực tế áp dụng tại **Đăng ký tài khoản (Register)**: Đăng ký -> Tài khoản ở trạng thái `pending` -> Gửi OTP qua Gmail thật -> Xác thực OTP thành công -> Kích hoạt tài khoản sang `active` và cấp token làm việc.
2. **Đăng ký tạm trú điện tử (UC21)**:
   - *Đặc tả*: Tự động sinh tờ khai CT01 và gửi API cho phường/tổ dân phố.
   - *Thực tế*: Hoàn toàn không có code xử lý.
3. **Quản lý tài sản (UC14)**:
   - *Đặc tả*: Cho phép quản lý tài sản độc lập với phòng.
   - *Thực tế*: Chỉ có thể cập nhật tài sản đi kèm theo từng phòng cụ thể (vì tài sản là mảng nhúng của phòng).
4. **Cổng thanh toán trực tuyến (UC27)**:
   - *Đặc tả*: Hỗ trợ thanh toán thực qua cổng VNPay/MoMo.
   - *Thực tế*: Mã nguồn backend (`server.js`) xử lý thanh toán bằng cách cập nhật trạng thái hóa đơn thành `paid` và tạo bản ghi `Payment` giả lập phương thức `'vnpay'`, `'momo'`, `'cash'`, hoặc `'bank_transfer'` mà không thực sự chuyển hướng hay xử lý giao dịch tiền tệ thật qua API VNPay Sandbox.

### 2.3. Đồng bộ thuật ngữ trên Giao diện

Hệ thống thực tế vừa được cập nhật các nhãn giao diện quan trọng ở Sidebar và các trang báo cáo:
- Cụm từ **"Quản lý chi nhánh"** được đổi thành **"Quản lý"** (Manager).
- Cụm từ **"Chi nhánh hiện tại / Chi nhánh"** được đổi thành **"Khu vực hiện tại"** (Property/Area).
- Sidebar mặc định chọn khu vực tồn tại thực tế (như "Quận 1") thay vì hiển thị tĩnh.

> [!WARNING]
> Tài liệu đặc tả hiện tại vẫn sử dụng dày đặc các từ khóa "Chi nhánh", "Quản lý chi nhánh", "Chi nhánh hiện tại". Việc này sẽ gây không đồng nhất khi đối chiếu tài liệu với màn hình hệ thống chạy demo.

---

## 3. CÁC NỘI DUNG CẦN BỔ SUNG, CẬP NHẬT TRONG ĐẶC TẢ

Để tài liệu đặc tả liên kết chặt chẽ và phản ánh chính xác hệ thống hiện tại, cần thực hiện các cập nhật sau vào tệp `.docx`:

### 3.1. Cập nhật Chương 1: Khảo sát & Công nghệ hệ thống
- **Mục 1.2.2 Yêu cầu phi chức năng (Công nghệ)**:
  - Cập nhật công nghệ Frontend: Thay thế *ReactJS / React Native* bằng *"Giao diện Web đa phân hệ (Multi-dashboard) phát triển trên nền tảng HTML5, CSS3 và Vanilla Javascript kết hợp các thư viện UI tương tác"*.
  - Bổ sung công nghệ Backend: Ghi rõ *"Sử dụng kiến trúc dịch vụ song song: Backend chính chạy trên Node.js Express xử lý các luồng nghiệp vụ & chatbot AI; Backend bổ trợ chạy trên Python Flask phục vụ phân tích dữ liệu phòng và hóa đơn"*.
  - Cập nhật CSDL: Khai báo rõ hệ quản trị CSDL sử dụng là **MongoDB / MongoDB Atlas** (NoSQL Database) thay vì hệ CSDL quan hệ.

### 3.2. Cập nhật Chương 2: Phân tích hệ thống (UML Diagrams)

#### A. Sơ đồ Use Case (Use Case Diagram):
- **UC02 Đăng nhập có xác thực 2 lớp (OTP)**: Cập nhật lại thành **UC02 Đăng nhập trực tiếp** (không include OTP) và bổ sung **UC01 Đăng ký tài khoản (kèm xác thực OTP qua Email)**. Luồng đăng ký sẽ include Use Case xác thực OTP.
- Đánh dấu các Use Case nâng cao như **UC21 Đăng ký tạm trú**, **Ký số trực tuyến bằng chữ ký vẽ tay**, **IoT công tơ điện** dưới dạng *"Tính năng định hướng phát triển (Future Scope) / Giả lập hệ thống"* để tránh hiểu lầm khi kiểm thử thực tế.

#### B. Sơ đồ lớp (Class Diagram - Hình 2.12):
Cần vẽ lại Class Diagram tổng thể dịch chuyển từ mô hình quan hệ sang mô hình tài liệu (Document-based Model) của MongoDB:
- Đổi tên các Class và thuộc tính sang **Tiếng Anh** để khớp 100% với code:
  - `NguoiDung` $\rightarrow$ `User`
  - `NhaTro` $\rightarrow$ `Property` (Thêm trường `district`, `city`)
  - `PhongTro` $\rightarrow$ `Room` (Bỏ quan hệ với Class `TaiSan`, thay bằng thuộc tính nhúng `assets` trong Room)
  - `LoaiPhong` $\rightarrow$ `RoomType` (Thêm thuộc tính `amenities: String[]` và liên kết với `Property`)
  - `HopDong` $\rightarrow$ `Contract` (Thêm trường `fileUrl` và đổi liên kết KhachThue thành liên kết mảng `tenantIds` trỏ đến `User`)
  - `HoaDon` $\rightarrow$ `Invoice` (Nhúng trực tiếp Class `ChiTietHoaDon` thành thuộc tính `details` bên trong `Invoice`)
  - `ChiSoTieuThu` $\rightarrow$ `Reading` (Liên kết với `Room` và `Service`)
  - `DichVu` $\rightarrow$ `Service` (Liên kết với `Property`)
  - `ThanhToan` $\rightarrow$ `Payment`
  - `ThongBao` $\rightarrow$ `Notification`

#### C. Sơ đồ tuần tự (Sequence Diagram):
- **Sơ đồ tuần tự UC Đăng nhập có OTP (Hình 2.13)**: Vẽ lại thành **Sơ đồ tuần tự UC Đăng ký tài khoản và kích hoạt bằng OTP Email**.
- **Sơ đồ tuần tự UC Ký số trực tuyến (Hình 2.14)**: Điều chỉnh luồng gọi API, làm rõ việc lưu trữ URL tệp PDF tĩnh trên Cloud/Server thay vì xử lý chữ ký động thực tế.

### 3.3. Cập nhật Chương 3: Thiết kế hệ thống (UI & Thuật ngữ)
- Sửa đổi toàn bộ các nhãn giao diện trong mô tả màn hình:
  - Thay thế "Quản lý chi nhánh" $\rightarrow$ **"Quản lý"**
  - Thay thế "Chi nhánh / Chi nhánh hiện tại" $\rightarrow$ **"Khu vực hiện tại"**
- Mô tả rõ bố cục giao diện thực tế của 4 cổng UI riêng biệt thay vì mô tả ứng dụng di động React Native (hiện tại chưa có code mobile).

---

## 4. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG

> [!IMPORTANT]
> Nhìn chung, hệ thống thực tế và đặc tả **có tính liên kết ở mức trung bình-khá** về mặt chức năng tổng quát (các phân hệ UI và Use Case chính đều được phản ánh bằng code và thư mục cụ thể). Tuy nhiên, **sự không đồng nhất về mặt công nghệ (NoSQL vs SQL, Vanilla JS vs React, Node.js + Python vs Spring Boot)** và **cấu trúc CSDL** là điểm yếu lớn nhất.

**Đề xuất hành động tiếp theo:**
1. Giữ nguyên mã nguồn hiện tại vì hệ thống đang vận hành demo ổn định (bao gồm cả chatbot AI và OTP mail thật vừa được vá lỗi).
2. Tiến hành cập nhật trực tiếp tài liệu đặc tả `.docx` theo các nội dung chi tiết tại **Mục 3** của báo cáo này nhằm hợp thức hóa mã nguồn và đảm bảo tài liệu khớp hoàn toàn với thực tế khi chấm đồ án.
