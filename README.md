# HỆ THỐNG QUẢN LÝ CHUỖI NHÀ TRỌ (BOARDING HOUSE CHAIN MANAGEMENT SYSTEM)

Hệ thống quản lý chuỗi nhà trọ (**Boarding House Chain Management System**) là một nền tảng PropTech hiện đại giúp các chủ trọ và đơn vị vận hành quản lý tập trung nhiều cơ sở nhà trọ, tối ưu hóa quy trình nghiệp vụ phức tạp từ ghi số điện nước, tính toán hóa đơn, thanh toán trực tuyến, quản lý hợp đồng thuê, đăng ký tài khoản xác thực qua OTP thực tế cho đến việc tích hợp trợ lý ảo thông minh (AI Chatbot) tự động đọc dữ liệu thực tế từ hệ thống để trả lời khách hàng.

---

## 1. CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG

Hệ thống được thiết kế theo kiến trúc hướng dịch vụ với sự phối hợp của các công nghệ sau:

*   **Frontend SPA (ReactJS + Vite)**: 
    *   Nằm tại thư mục `src/frontend`.
    *   Sử dụng ReactJS, Vite làm công cụ build, TailwindCSS/Vanilla CSS tối ưu hóa giao diện.
    *   Tích hợp tất cả các cổng giao diện (Multi-dashboard) của 4 đối tượng: **Chủ trọ (Admin)**, **Quản lý (Manager)**, **Khách thuê (Tenant)**, và **Khách vãng lai (Visitor)**.
    *   Trang bị giao diện chat trực quan tích hợp Trợ lý ảo AI thông minh.
*   **Backend Node.js Express (Cổng API Chính - Port 5001)**:
    *   Xử lý toàn bộ logic nghiệp vụ (Auth, CRUD Properties, Rooms, Contracts, Invoices, Services, Meters).
    *   Tích hợp dịch vụ gửi Email OTP thực tế thông qua SMTP Google.
    *   Tích hợp API Gemini (Google AI SDK) xử lý Chatbot thông minh.
*   **Backend Python Flask (Cổng API Thống Kê/Thay Thế - Port 5002)**:
    *   Nằm tại thư mục `src/backend/app/` và chạy qua `run.py`.
    *   Đóng vai trò làm backend thay thế và xử lý dữ liệu, phục vụ các truy vấn thống kê dữ liệu.
*   **Cơ sở dữ liệu (MongoDB Atlas)**:
    *   Cơ sở dữ liệu phi quan hệ (NoSQL) lưu trữ dữ liệu tập trung qua MongoDB Atlas Cloud.
    *   Dữ liệu được chuẩn hóa tiếng Việt không dấu để đảm bảo tương thích tốt nhất.

---

## 2. CẤU TRÚC THƯ MỤC CHÍNH

```text
├── Admin_UI/                   # Giao diện tĩnh & ảnh mockup phân hệ Chủ trọ
├── Manager_UI/                 # Giao diện tĩnh & ảnh mockup phân hệ Quản lý
├── Tenant_UI/                  # Giao diện tĩnh & ảnh mockup phân hệ Khách thuê
├── Visitor_UI/                 # Giao diện tĩnh & ảnh mockup phân hệ Khách vãng lai
├── docs/                       # Tài liệu thiết kế hệ thống
├── system_alignment_report.md  # Báo cáo đánh giá sự liên kết giữa code thực tế và đặc tả
├── src/
│   ├── backend/                # Backend Node.js Express + Python Flask
│   │   ├── app/                # Thư mục ứng dụng Python Flask (Models, Routes, Controllers)
│   │   ├── models/             # Định nghĩa Mongoose Schemas cho Node.js
│   │   ├── services/           # Services hỗ trợ (AI Chatbot, SendMail OTP)
│   │   ├── server.js           # Mã nguồn khởi chạy Express API chính (Port 5001)
│   │   ├── run.py              # Mã nguồn khởi chạy Flask API phụ (Port 5002)
│   │   ├── seed.js             # Script khởi tạo 220 khu trọ mẫu cho MongoDB (tiếng Việt không dấu)
│   │   └── requirements.txt    # Các thư viện Python cần thiết
│   └── frontend/               # Frontend ReactJS + Vite
│       ├── src/
│       │   ├── components/     # UI Components chung (Sidebar, Navbar, Chatbot AI)
│       │   ├── services/       # Module gọi REST API kết nối Backend
│       │   └── views/          # Màn hình Dashboard cho từng Actor (admin, manager, tenant, visitor)
│       └── package.json
└── README.md                   # Tài liệu hướng dẫn này
```

---

## 3. HƯỚNG DẪN CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Tạo tệp `.env` tại thư mục `src/backend/` và cấu hình các giá trị sau:

```env
# Kết nối MongoDB Atlas (Thay chuỗi kết nối bằng tài khoản của bạn)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/boardinghouse_db

# Cấu hình cổng cho Node.js Express
PORT=5001
JWT_SECRET=supersecretkeyforboardinghousepro2026

# Cấu hình SMTP gửi mã xác thực OTP thực tế (Sử dụng mật khẩu ứng dụng Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API Key Gemini để chatbot AI hoạt động
GEMINI_API_KEY=your_gemini_api_key
```

---

## 4. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG CHI TIẾT

Để hệ thống hoạt động đầy đủ tính năng, bạn cần khởi chạy song song 3 dịch vụ: **Express Backend (Port 5001)**, **Flask Chatbot (Port 5002)** và **Vite Frontend (Port 5173)**.

Vui lòng chọn hướng dẫn phù hợp với hệ điều hành của bạn dưới đây:

### TÙY CHỌN A: DÀNH CHO HỆ ĐIỀU HÀNH WINDOWS

#### 1. Khởi chạy Express Backend (Port 5001)
Mở cửa sổ Command Prompt (CMD) thứ nhất:
```cmd
cd src\backend
npm install
# Khởi tạo dữ liệu mẫu (chỉ cần chạy một lần đầu tiên)
npm run seed
# Chạy server chính
npm start
```
*Backend chính sẽ chạy tại: `http://localhost:5001`*

#### 2. Khởi chạy Python Flask Backend (Port 5002)
Mở cửa sổ Command Prompt (CMD) hoặc PowerShell thứ hai:
*   **Nếu dùng Command Prompt (CMD):**
    ```cmd
    cd src\backend
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
    set PORT=5002
    python run.py
    ```
*   **Nếu dùng PowerShell:**
    ```powershell
    cd src\backend
    python -m venv .venv
    .venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    $env:PORT="5002"
    python run.py
    ```
*Backend Flask phụ trợ sẽ chạy tại: `http://localhost:5002`*

#### 3. Khởi chạy Vite Frontend (Port 5173)
Mở cửa sổ Command Prompt (CMD) thứ ba:
```cmd
cd src\frontend
npm install
npm run dev
```
*Giao diện Web sẽ chạy tại: `http://localhost:5173`*

---

### TÙY CHỌN B: DÀNH CHO HỆ ĐIỀU HÀNH MACOS / LINUX

#### 1. Khởi chạy Express Backend (Port 5001)
Mở cửa sổ Terminal thứ nhất:
```bash
cd src/backend
npm install
# Khởi tạo dữ liệu mẫu (chỉ cần chạy một lần đầu tiên)
npm run seed
# Chạy server chính
npm start
```
*Backend chính sẽ chạy tại: `http://localhost:5001`*

#### 2. Khởi chạy Python Flask Backend (Port 5002)
Mở cửa sổ Terminal thứ hai:
```bash
cd src/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PORT=5002 python run.py
```
*Backend Flask phụ trợ sẽ chạy tại: `http://localhost:5002`*

#### 3. Khởi chạy Vite Frontend (Port 5173)
Mở cửa sổ Terminal thứ ba:
```bash
cd src/frontend
npm install
npm run dev
```
*Giao diện Web sẽ chạy tại: `http://localhost:5173`*

---

## 5. TÀI KHOẢN TRẢI NGHIỆM HỆ THỐNG

Sau khi seed dữ liệu thành công, bạn truy cập `http://localhost:5173` và đăng nhập bằng một trong các tài khoản demo sau:

| Đối tượng (Role) | Email | Mật khẩu | Quyền hạn & Chức năng kiểm thử |
| :--- | :--- | :--- | :--- |
| **Chủ trọ / Admin** | `admin@boardinghouse.com` | `admin` | Quản lý toàn bộ chuỗi nhà trọ, thêm/sửa cơ sở, phân công quản lý (Manager) phụ trách từng cơ sở, xem biểu đồ doanh thu toàn hệ thống. |
| **Quản lý / Manager** | `manager@boardinghouse.com` | `manager` | Quản lý cơ sở được phân công (chọn động từ dropdown ở sidebar). Thêm phòng, lập hợp đồng, cập nhật số điện nước, lập hóa đơn và theo dõi đóng tiền. |
| **Khách thuê (Tenant)** | `tenant@boardinghouse.com` | `tenant` | Xem phòng đang thuê, xem danh sách hóa đơn, giả lập thanh toán online, gửi phản ánh lên ban quản lý. |
| **Khách vãng lai / Visitor** | Không cần tài khoản | *N/A* | Tìm kiếm phòng trọ trống theo khu vực địa lý thực tế (Quận 1, Bình Thạnh...), xem chi tiết phòng, gửi yêu cầu đặt cọc giữ phòng. |

---

## 6. TÍNH NĂNG ĐÃ ĐƯỢC ĐỒNG BỘ VÀ TỐI ƯU HÓA GẦN ĐÂY

1.  **Dữ liệu động 100%**: Sửa lỗi giao diện hiển thị dữ liệu giả (mockdata) trước đó. Toàn bộ thông tin hiển thị trên Admin Dashboard và Manager Dashboard đều được đồng bộ thời gian thực từ MongoDB Atlas (kể cả khi mảng trả về rỗng).
2.  **Dropdown Cơ sở ở Sidebar**: Quản lý (Manager) có thể chuyển đổi linh hoạt qua lại giữa các khu vực nhà trọ thực tế tồn tại trong CSDL. Tất cả các tab chức năng (Phòng, Hợp đồng, Chỉ số điện nước, Hóa đơn) đều tự động tải lại dữ liệu tương ứng với cơ sở được chọn.
3.  **Chatbot AI Thông Minh**: Chatbot được tích hợp trực tiếp trên giao diện, hoạt động dựa trên mô hình Gemini API. Hỗ trợ đọc ngữ cảnh hệ thống (đọc tổng số phòng, số cơ sở thực tế từ CSDL) để tư vấn trực tuyến chính xác nhất.
4.  **Xác thực mã OTP qua Gmail**: Người dùng đăng ký tài khoản mới sẽ nhận mã OTP gửi trực tiếp về email cá nhân thật và cần nhập mã để kích hoạt trạng thái tài khoản.
5.  **Báo cáo Đánh giá Liên kết (`system_alignment_report.md`)**: Tài liệu chi tiết so sánh mã nguồn thực tế với File đặc tả `.docx` nhằm xác định các khoảng cách thiết kế và đề xuất chỉnh sửa để đồng bộ đồ án.
