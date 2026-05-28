# Walkthrough — Sửa lỗi đồng bộ Frontend & Khởi chạy Demo Hệ thống

Chúng ta đã hoàn thành việc vá lỗi đồng bộ dữ liệu giữa Frontend và CSDL MongoDB Atlas (gỡ bỏ hoàn toàn mockdata cũ khi dữ liệu rỗng) và khởi chạy thành công toàn bộ hệ thống demo gồm 3 server song song.

---

## Các thay đổi đã thực hiện

### 1. Đồng bộ và Thay thế Mockdata bằng Dữ liệu Thật trên Frontend
*   **Nguyên nhân lỗi cũ**: Các view của React chỉ cập nhật state khi kết quả API trả về có độ dài lớn hơn 0 (`fetchedData.length > 0`). Khi API trả về mảng rỗng `[]` (ví dụ khi cơ sở dữ liệu sạch), logic cũ bỏ qua việc gán dữ liệu dẫn đến việc giữ lại mockdata mẫu.
*   **Giải pháp vá lỗi**: Sửa toàn bộ các `useEffect` đồng bộ dữ liệu trong các view thành:
    ```javascript
    useEffect(() => {
      if (!loading) {
        setItems(apiItems || []);
      }
    }, [apiItems, loading]);
    ```
    Giúp giao diện cập nhật chính xác dữ liệu thực tế từ MongoDB Atlas (kể cả khi rỗng) và ghi đè hoàn toàn mockdata.

### 2. Thiết lập Cơ sở & Khu vực Động cho Phân hệ Quản lý (Manager)
*   **Sidebar Dropdown ([ManagerLayout.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/layouts/ManagerLayout.jsx))**: Thay đổi nhãn tĩnh "Khu vực hiện tại" và nút Quận 1 hardcode thành `<select>` box động nạp danh sách cơ sở từ API. Khi thay đổi cơ sở, trigger sự kiện `'bhpro_property_changed'` đồng thời cập nhật `'bhpro_selected_property_id'` vào `localStorage`.
*   **Đồng bộ các Trang Con theo Cơ sở hoạt động**:
    *   **[DashboardPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager/DashboardPage.jsx)**: Lắng nghe event đổi cơ sở, cập nhật `propertyId` và tự động hiển thị tên cơ sở động ở phụ đề `PageHeader`.
    *   **[RoomsPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager/RoomsPage.jsx)**: Lắng nghe event đổi cơ sở, lọc phòng theo `propertyId` động, nạp phòng trống/đang thuê thực tế từ database.
    *   **[ContractsPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager/ContractsPage.jsx)**: Thay thế toàn bộ hardcode `"An Phú Q1"`, `"An Phú - Quận 1"` bằng tên cơ sở động tương ứng, hỗ trợ lập hợp đồng mới theo đúng `propertyId` được chọn.
    *   **[MetersPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager/MetersPage.jsx)**: Lọc danh sách phòng theo `propertyId` động để quản lý ghi chỉ số điện nước.
    *   **[CashReceiptsPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/manager/CashReceiptsPage.jsx)**: Lọc hóa đơn chờ thanh toán tiền mặt theo `propertyId` động.

### 3. Đồng bộ hóa logic Phân hệ Admin
*   **[PropertiesPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/admin/PropertiesPage.jsx)**: Sửa logic sync `localProperties` khi nạp từ API.
*   **[ContractsPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/admin/ContractsPage.jsx)**: Sửa logic sync `localContracts` when loading from API.

---

## Kết quả Khởi chạy Demo

Cả 3 server của hệ thống đã được khởi chạy thành công ở chế độ background:

1.  **Express Backend Server**:
    *   **Lệnh chạy**: `node server.js`
    *   **Trạng thái**: Đang chạy trên cổng [http://localhost:5001](http://localhost:5001) và đã kết nối thành công tới cụm MongoDB Atlas.
2.  **Flask AI Chatbot Server**:
    *   **Lệnh chạy**: `PORT=5002 .venv/bin/python run.py`
    *   **Trạng thái**: Đang chạy trên cổng [http://localhost:5002](http://localhost:5002) và kết nối ổn định tới MongoDB Atlas.
3.  **Vite Frontend Dev Server**:
    *   **Lệnh chạy**: `npm run dev` (hoặc `node node_modules/vite/bin/vite.js`)
    *   **Trạng thái**: Đang chạy trên cổng [http://localhost:5173](http://localhost:5173) ổn định.

---

## Xác minh thực tế trên UI

*   Dropdown chọn cơ sở trên sidebar hoạt động cực kỳ mượt mà. Khi chọn thay đổi cơ sở, hệ thống phát ra event và tất cả các trang con tự động reload lại dữ liệu tương thích với cơ sở mới.
*   Giao diện không còn giữ lại mockdata mẫu khi dữ liệu trả về từ MongoDB là rỗng, thay vào đó hiển thị màn hình trống/đang tải trống sạch sẽ theo chuẩn thiết kế.

---

## Cập nhật Tài liệu & Đẩy mã nguồn lên GitHub

1.  **Sao chép Báo cáo đánh giá sự liên kết**:
    *   Đã copy tệp [system_alignment_report.md](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/system_alignment_report.md) từ thư mục artifact ra thư mục gốc của dự án để đính kèm cùng mã nguồn.
2.  **Viết tài liệu README.md**:
    *   Cập nhật đầy đủ mô tả hệ thống, kiến trúc đa thành phần, danh sách tài khoản demo và hướng dẫn chạy đồng thời cả 3 server Express (5001), Flask (5002) và Vite (5173).
3.  **Cập nhật cấu hình Git**:
    *   Thêm quy tắc `*.log` vào `.gitignore` để tránh commit nhầm tệp logs của server.
4.  **Commit & Push lên GitHub**:
    *   Thực hiện commit tiếng Việt: `Sửa lỗi đồng bộ dữ liệu thật MongoDB trên Frontend, cập nhật cơ sở động sidebar, thêm báo cáo liên kết và hướng dẫn chạy 3 server trong README`.
    *   Đẩy thành công toàn bộ mã nguồn lên nhánh `main` của repository [Hostel_Management](https://github.com/DiepTuHuy/Hostel_Management.git).

---

## Cập nhật Ngày 25/05/2026: Pull Code và Chạy Demo

1.  **Đồng bộ Git**:
    *   Thực hiện lệnh `git pull origin main` để cập nhật mã nguồn mới nhất từ GitHub.
2.  **Khởi chạy lại 3 Server dưới dạng các Task nền**:
    *   **Express Backend Server (Port 5001)**: Khởi chạy qua lệnh `node server.js`.
    *   **Flask Chatbot Server (Port 5002)**: Khởi chạy qua lệnh `PORT=5002 .venv/bin/python run.py`.
    *   **Vite Frontend Server (Port 5173)**: Khởi chạy qua lệnh `npm run dev`.
3.  **Cải tiến khả năng chịu lỗi (Fault-Tolerance)**:
    *   Cập nhật mã nguồn `server.js` để Express server khởi động bất đồng bộ với MongoDB connection. Khi mạng gặp sự cố hoặc IP chưa được whitelist, server Node.js vẫn hoạt động bình thường thay vì crash.
4.  **Cập nhật tài liệu chạy trên đa nền tảng (Windows & macOS)**:
    *   Bổ sung hướng dẫn chạy chi tiết cho cả hệ điều hành Windows (CMD/PowerShell) và macOS/Linux tại tệp [README.md](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/README.md).

---

## Cập nhật kết nối MongoDB Atlas & Khởi chạy Demo thành công

1.  **Whitelist IP thành công**:
    *   Địa chỉ IP mạng của người dùng đã được thêm vào mục Network Access của MongoDB Atlas.
2.  **Khởi động lại các Service**:
    *   **Express Backend (Port 5001)**: Đã kết nối thành công tới database Atlas (`MongoDB connected successfully!`).
    *   **Flask Chatbot (Port 5002)**: Đã kết nối thành công tới database Atlas thực.
    *   **Vite Frontend (Port 5173)**: Tiếp tục chạy ổn định và gọi API dữ liệu thật.

---

## Cập nhật sửa lỗi "vite: command not found" khi chạy ở Terminal bên ngoài

1.  **Phân tích Nguyên nhân Lỗi**:
    *   Đường dẫn chứa ký tự `:` (ví dụ: `D:/Study...` trên macOS) làm phân tách các thư mục trong biến `PATH`, khiến shell không tìm thấy lệnh `vite`.
2.  **Giải pháp Khắc phục**:
    *   Cập nhật [package.json](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/package.json) để các lệnh npm gọi trực tiếp tập tin JavaScript thực thi bằng Node (`node node_modules/vite/bin/vite.js`), giải quyết triệt để lỗi phân tách dấu hai chấm trên `PATH` và đảm bảo tương thích đa nền tảng.

---

## Cập nhật Ngày 28/05/2026: Tối ưu hóa hiệu ứng chuyển động Apple-style & 3D Tilt với GSAP

Chúng ta đã tối ưu hóa toàn diện hiệu ứng chuyển động cho 3 thành phần giao diện động cốt lõi là `AIChatbot.jsx`, `Modal.jsx`, `Toast.jsx`, đồng thời tích hợp thêm hiệu ứng nghiêng 3D giả lập (Pseudo-3D Tilt/Hover Effect) cho các cấu trúc `Card.jsx` và `StatCard.jsx` theo đúng phê duyệt và yêu cầu bổ sung từ bạn.

### 1. Tối ưu hóa AIChatbot ([AIChatbot.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/AIChatbot.jsx))
*   **Vấn đề cũ**: Việc ẩn/hiện cửa sổ chat sử dụng `{isOpen && ...}` khiến React unmount component ngay lập tức khi `isOpen = false`, làm mất đi cơ hội thực hiện exit animation.
*   **Giải pháp**: 
    *   Giữ container luôn nằm trong DOM (`display: none` mặc định).
    *   Dùng `useGSAP` điều khiển trạng thái mở/đóng:
        *   **Khi mở**: Chuyển `display: flex`, animate phóng to nảy nhẹ từ góc dưới phải (`scale: 0.8` -> `1`, `y: 30` -> `0`, `opacity: 0` -> `1`, `ease: "back.out(1.15)"` trong `0.4` giây).
        *   **Khi đóng**: Animate thu nhỏ về góc (`scale: 0.8`, `y: 30`, `opacity: 0`, `ease: "power3.inOut"`, `duration: 0.3` giây), sau đó ẩn phần tử (`display: none`).

### 2. Tối ưu hóa Modal ([Modal.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/Modal.jsx))
*   **Cơ chế trì hoãn unmount**: Sử dụng state nội bộ `shouldRender` để giữ modal lại trong DOM khi prop `open` đổi thành `false` nhằm chạy xong animation exit.
*   **Hiệu ứng Apple-style**:
    *   **Entrance**: Backdrop mờ dần (`opacity: 0 -> 1`), hộp nội dung trượt lên và phóng to rất êm (`scale: 0.95 -> 1`, `y: 20 -> 0`, `opacity: 0 -> 1`, `ease: "power4.out"` trong `0.45` giây).
    *   **Exit**: Thu nhỏ và trượt xuống dưới (`scale: 0.95`, `y: 20`, `opacity: 0`, `ease: "power3.in"`), mờ dần backdrop (`opacity: 0`). Sau khi kết thúc, đặt `shouldRender = false` để unmount thật và trigger callback `onClose` từ cha.

### 3. Tối ưu hóa Toast ([Toast.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/Toast.jsx))
*   **Cơ chế đóng gói**: Toast tự chịu trách nhiệm chạy hiệu ứng slide-out trước khi báo cho component cha gỡ nó ra khỏi DOM.
*   **Chuyển động**:
    *   **Entrance**: Trượt và nảy nhẹ từ bên phải màn hình vào (`x: '120%' -> '0%'`, `opacity: 0 -> 1`, `ease: "back.out(1.1)"` trong `0.45` giây).
    *   **Exit**: Trượt mượt ngược lại về lề phải (`x: '120%'`, `opacity: 0`, `ease: "power3.in"`), sau đó gọi `onClose` để unmount.

### 4. Tích hợp hiệu ứng 3D Tilt giả lập ([Card.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/Card.jsx) & [StatCard.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/components/common/StatCard.jsx))
*   **3D Tilt trên Card**: Khi di chuột qua Card, GSAP sẽ theo dõi tọa độ con trỏ để nghiêng nhẹ thẻ theo góc 3D (`rotateX`, `rotateY` tối đa 8 độ, phóng to nhẹ `scale: 1.025`, bóng đổ động bám theo chiều nghiêng). Phần nội dung bên trong được đặt `translateZ(15px)` tạo hiệu ứng nổi khối Parallax 3D cực kỳ cao cấp.
*   **Thừa hưởng trên StatCard**: `StatCard` được refactor để kế thừa `Card` component, tự động có hiệu ứng nghiêng 3D khi hover qua các ô chỉ số thống kê trên Dashboard.

---

## Cập nhật Ngày 28/05/2026 (Tiếp tục): Triển khai tính năng Quên mật khẩu bằng OTP cho Khách thuê (Tenant)

Chúng ta đã thiết kế và triển khai hoàn chỉnh tính năng "Quên mật khẩu" có xác thực mã OTP gửi qua email dành riêng cho Khách thuê (`tenant`).

### 1. Backend (Node.js Express + Nodemailer)
*   **Mẫu Email ([emailService.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/services/emailService.js))**: Thêm hàm `sendForgotPasswordOtpEmail(email, fullName, otp)` để gửi email mã OTP xác thực khôi phục mật khẩu.
*   **REST API ([server.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/backend/server.js))**:
    *   `POST /api/auth/forgot-password`: Tìm tài khoản khách thuê đang hoạt động, sinh mã OTP 6 số (hiệu lực 5 phút), lưu trạng thái OTP vào CSDL và kích hoạt gửi email.
    *   `POST /api/auth/reset-password`: Nhận email, otp và mật khẩu mới. Kiểm tra khớp và hạn OTP, băm mật khẩu mới bằng `bcryptjs` và cập nhật dữ liệu, đồng thời làm sạch trường OTP để đảm bảo an toàn.

### 2. Frontend (ReactJS SPA)
*   **REST Client ([authService.js](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/services/authService.js))**: Thêm các API calls `forgotPassword` and `resetPassword`.
*   **Auth Controller ([useAuth.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/controllers/useAuth.jsx))**: Đăng ký các hàm và truyền qua `AuthContext` để dùng ở view.
*   **Giao diện Quên Mật Khẩu ([ForgotPasswordPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/auth/ForgotPasswordPage.jsx))**:
    *   Thiết kế cao cấp, mượt mà chuẩn Apple, thừa hưởng hiệu ứng nghiêng 3D của `Card`.
    *   Quá trình khôi phục qua 2 bước trực quan: Nhập Email -> Nhập 6 ô mã OTP (hỗ trợ nhập liên tiếp và dán nhanh) kèm thiết lập mật khẩu mới.
*   **Login View ([LoginPage.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/views/auth/LoginPage.jsx))**: Thêm liên kết "Quên mật khẩu?" đưa người dùng tới trang khôi phục.
*   **Routing ([AppRouter.jsx](file:///Users/dieptuhuy/Library/CloudStorage/GoogleDrive-dieptuhuy80@gmail.com/Other%20computers/My%20Computer%203/D:/Study/System_Design/src/frontend/src/routes/AppRouter.jsx))**: Khai báo Route `/forgot-password` sử dụng cơ chế lazy loading.
