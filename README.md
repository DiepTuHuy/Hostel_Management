# HỆ THỐNG QUẢN LÝ CHUỖI NHÀ TRỌ (BOARDING HOUSE CHAIN MANAGEMENT SYSTEM)

Hệ thống quản lý chuỗi nhà trọ (Boarding House Chain Management System) là một nền tảng PropTech hỗ trợ chủ trọ quản lý tập trung nhiều cơ sở nhà trọ, tối ưu hóa quy trình vận hành từ ghi số điện nước, tính toán hóa đơn, thanh toán trực tuyến, quản lý hợp đồng cho đến phân tích báo cáo doanh thu và tích hợp trợ lý ảo thông minh (AI Chatbot).

---

## 1. KIẾN TRÚC HỆ THỐNG VÀ CÔNG NGHỆ

Hệ thống được thiết kế theo mô hình đa người dùng (Multi-tenant) và kiến trúc dịch vụ API:

*   **Frontend SPA (ReactJS + Vite + TailwindCSS)**: Nằm tại thư mục `src/frontend`. Đây là ứng dụng Client-side Single Page Application hoàn chỉnh tích hợp cả 4 phân hệ người dùng (Chủ trọ/Admin, Quản lý/Manager, Khách thuê/Tenant, Khách vãng lai/Visitor) và AI Chatbot.
*   **Backend Node.js Express (Main API)**: Nằm tại thư mục `src/backend/server.js`. Chạy chính tại cổng `5001`, chịu trách nhiệm xử lý toàn bộ các luồng nghiệp vụ:
    *   Xác thực tài khoản (Authentication) & Đăng ký gửi mã OTP thực tế qua Gmail.
    *   Tích hợp AI Chatbot sử dụng Gemini API.
    *   CRUD Nhà trọ, Loại phòng, Phòng, Dịch vụ, Chỉ số tiêu thụ, Hóa đơn và Hợp đồng.
    *   Giả lập thanh toán hóa đơn.
*   **Backend Python Flask (Alternative API)**: Nằm tại thư mục `src/backend/app/`. Đóng vai trò làm backend thay thế/bổ trợ, xử lý và phân tích số liệu thống kê.
*   **Database (MongoDB Atlas)**: Cơ sở dữ liệu phi quan hệ (NoSQL) lưu trữ dữ liệu tập trung thông qua Mongoose (Node.js) và PyMongo/MongoMock (Python).
*   **UI Mockups & Tĩnh (HTML/CSS)**: Nằm tại các thư mục `Admin_UI`, `Manager_UI`, `Tenant_UI`, `Visitor_UI` ở thư mục gốc. Chứa các file `code.html` và ảnh chụp giao diện tĩnh phục vụ mục đích báo cáo đặc tả.

---

## 2. CẤU TRÚC THƯ MỤC CHÍNH

```text
├── Admin_UI/               # Giao diện tĩnh & ảnh mockup của phân hệ Chủ trọ (Admin)
├── Manager_UI/             # Giao diện tĩnh & ảnh mockup của phân hệ Quản lý (Manager)
├── Tenant_UI/              # Giao diện tĩnh & ảnh mockup của phân hệ Khách thuê (Tenant)
├── Visitor_UI/             # Giao diện tĩnh & ảnh mockup của phân hệ Khách vãng lai (Visitor)
├── src/
│   ├── backend/            # Mã nguồn backend (Node.js Express + Python Flask)
│   │   ├── app/            # Python Flask App (Models, Controllers, Routes)
│   │   ├── models/         # Mongoose Schemas (Node.js)
│   │   ├── services/       # Email service (gửi OTP) và AI service
│   │   ├── server.js       # Main server Node.js Express
│   │   ├── seed.js         # Script khởi tạo 220 nhà trọ mẫu cho Node.js
│   │   └── run.py          # Entry point của Python Flask
│   └── frontend/           # Mã nguồn frontend SPA (Vite + ReactJS + TailwindCSS)
│       ├── src/
│       │   ├── components/ # Các component giao diện và Chatbot AI
│       │   ├── views/      # Giao diện Dashboard của các tác nhân
│       │   └── services/   # Gọi API kết nối Backend
│       └── package.json
└── README.md
```

---

## 3. HƯỚNG DẪN CẤU HÌNH VÀ CHẠY HỆ THỐNG

### Bước 1: Cấu hình biến môi trường (.env)

Tạo tệp `.env` trong thư mục `src/backend/` và cấu hình các thông số sau (dựa theo `.env.example`):

```env
# Kết nối MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/boardinghouse_db

# Cổng chạy backend chính
PORT=5001
JWT_SECRET=supersecretkeyforboardinghousepro2026

# Cấu hình SMTP Gmail gửi mã OTP thực tế
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=email_cua_ban@gmail.com
SMTP_PASS=mat_khau_ung_dung_gmail_cua_ban

# Gemini API Key dành cho Chatbot AI
GEMINI_API_KEY=AIzaSyDBgVXlA-rS0puux3vY1LA-q799qb2IDQc
```

### Bước 2: Cài đặt và chạy Backend chính (Node.js Express)

1.  Truy cập thư mục backend:
    ```bash
    cd src/backend
    ```
2.  Cài đặt các gói thư viện phụ thuộc:
    ```bash
    npm install
    ```
3.  Khởi tạo dữ liệu mẫu (Seeding Database - tự động tạo 220 chi nhánh nhà trọ ở các quận TP.HCM, các loại phòng, dịch vụ và tài khoản đăng nhập mẫu):
    ```bash
    npm run seed
    ```
4.  Khởi chạy server Node.js:
    ```bash
    npm start
    ```
    *Server sẽ hoạt động tại địa chỉ: `http://localhost:5001`*

*(Tùy chọn) Chạy Backend phụ bằng Python Flask:*
1.  Đảm bảo bạn đã cài đặt Python 3.
2.  Cài đặt thư viện: `pip install -r requirements.txt`.
3.  Chạy server: `python run.py`.

### Bước 3: Cài đặt và chạy Frontend SPA (React + Vite)

1.  Mở một cửa sổ terminal mới và truy cập thư mục frontend:
    ```bash
    cd src/frontend
    ```
2.  Cài đặt các thư viện:
    ```bash
    npm install
    ```
3.  Khởi chạy Frontend Dev Server:
    ```bash
    npm run dev
    ```
4.  Truy cập hệ thống qua trình duyệt tại địa chỉ: `http://localhost:5173`.

---

## 4. TÀI KHOẢN TRẢI NGHIỆM MẪU (SAU KHI SEED DATABASE)

Sau khi chạy lệnh `npm run seed`, bạn có thể đăng nhập bằng các tài khoản mẫu sau tùy theo vai trò:

*   **Chủ trọ / Admin**:
    *   Email: `admin@boardinghouse.com`
    *   Mật khẩu: `admin` (hoặc mật khẩu bất kỳ khớp với vai trò)
*   **Quản lý (Manager)**:
    *   Email: `manager@boardinghouse.com`
    *   Mật khẩu: `manager`
*   **Khách thuê (Tenant)**:
    *   Email: `tenant@boardinghouse.com`
    *   Mật khẩu: `tenant`

---

## 5. CÁC TÍNH NĂNG CHÍNH ĐÃ PHÁT TRIỂN & HOÀN THIỆN
*   **Dashboard Chủ Trọ**: Thống kê doanh thu thực tế, tỷ lệ lấp đầy phòng, quản lý toàn chuỗi các khu trọ, gán quyền cho Manager.
*   **Dashboard Quản Lý**: Cập nhật trạng thái phòng, ghi chỉ số điện nước, lập hợp đồng thuê phòng và duyệt thông tin khách thuê.
*   **Cổng Khách Thuê**: Tra cứu chi tiết hợp đồng, danh sách hóa đơn, lịch sử giao dịch và bấm thanh toán giả lập.
*   **Trang Khách Vãng Lai**: Tìm kiếm phòng theo địa điểm, khoảng giá và tiện nghi, đi kèm đặt cọc giữ phòng trực tuyến.
*   **Chatbot AI (Gemini 2.5 Flash)**: Tích hợp trợ lý ảo có khả năng đọc thông số thực tế của hệ thống (tổng số chi nhánh, số phòng trống, số khách) để giải đáp thắc mắc của người dùng.
*   **Xác thực mã OTP**: Đăng ký tài khoản yêu cầu gửi OTP thực tế đến Gmail của người dùng và nhập mã xác thực để kích hoạt trạng thái hoạt động.
