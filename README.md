<div align="center">

# 🏠 Boarding House Chain Management System
### Nền tảng PropTech Quản lý Chuỗi Nhà trọ Thế hệ mới

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75C2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

**Boarding House Pro** là một nền tảng PropTech hiện đại giúp các chủ trọ và đơn vị vận hành quản lý tập trung nhiều cơ sở nhà trọ, tối ưu hóa quy trình nghiệp vụ phức tạp từ ghi số điện nước, tính toán hóa đơn, thanh toán trực tuyến, quản lý hợp đồng thuê, đăng ký tài khoản xác thực qua OTP thực tế cho đến việc tích hợp trợ lý ảo thông minh (AI Chatbot) tự động đọc dữ liệu thực tế từ hệ thống để trả lời khách hàng.

[Báo cáo Đặc tả & Code](file:///Users/dieptuhuy/Documents/System%20Design/system_alignment_report.md) · [Tài liệu Thiết kế](file:///Users/dieptuhuy/Documents/System%20Design/docs/)

---

</div>

## 📖 Mục lục (Table of Contents)
- [1. Công nghệ & Kiến trúc Hệ thống](#1-công-nghệ--kiến-trúc-hệ-thống)
- [2. Cấu trúc Thư mục Chính](#2-cấu-trúc-thư-mục-chính)
- [3. Hướng dẫn Cấu hình Biến Môi trường (.env)](#3-hướng-dẫn-cấu-hình-biến-môi-trường-env)
- [4. Hướng dẫn Khởi chạy Hệ thống Chi tiết](#4-hướng-dẫn-khởi-chạy-hệ-thống-chi-tiết)
- [5. Tài khoản Trải nghiệm Hệ thống](#5-tài-khoản-trải-nghiệm-hệ-thống)
- [6. Tính năng đã được Đồng bộ & Tối ưu hóa Gần đây](#6-tính-năng-đã-được-đồng-bộ--tối-ưu-hóa-gần-đây)

---

## 🛠️ 1. Công nghệ & Kiến trúc Hệ thống

Hệ thống được thiết kế theo kiến trúc hướng dịch vụ (Service-Oriented Architecture - SOA) kết hợp đa cổng quản lý (Multi-dashboard), đảm bảo tính module hóa và khả năng mở rộng tốt:

*   **💻 Frontend SPA (ReactJS + Vite)**:
    *   **Thư mục:** `src/frontend`
    *   **Công nghệ:** ReactJS, Vite, TailwindCSS / Vanilla CSS.
    *   **Đặc điểm:** Tích hợp đa phân quyền cho **4 Actors**: **Chủ trọ (Admin)**, **Quản lý (Manager)**, **Khách thuê (Tenant)**, và **Khách vãng lai (Visitor)**.
    *   **Giao diện:** Tích hợp cửa sổ chat Trợ lý ảo AI thông minh, giao diện responsive, hiện đại.
*   **⚙️ Backend Express API (Node.js)**:
    *   **Thư mục:** `src/backend`
    *   **Cổng hoạt động:** Port `5001`
    *   **Chức năng chính:** API nghiệp vụ quản lý phòng, hợp đồng, chỉ số điện nước, hóa đơn.
    *   **Dịch vụ tích hợp:** Gửi Mail OTP thực tế qua SMTP Google, tích hợp cổng thanh toán VNPay giả lập, Gemini AI SDK.
*   **🗄️ Cơ sở dữ liệu Cloud (MongoDB Atlas)**:
    *   Sử dụng CSDL NoSQL MongoDB Atlas lưu trữ dữ liệu tập trung đám mây.
    *   Dữ liệu mẫu đã được tối ưu hóa tiếng Việt không dấu để đảm bảo tương thích tốt nhất.

---

## 📂 2. Cấu trúc Thư mục Chính

```text
Hostel_Management/
├── docs/                       # Tài liệu thiết kế hệ thống (PlantUML, UML Diagrams)
├── system_alignment_report.md  # Báo cáo đánh giá sự liên kết giữa code thực tế và đặc tả
├── src/
│   ├── backend/                # Server Backend Node.js Express
│   │   ├── models/             # Định nghĩa Mongoose Schemas (Room, User, Property, Contract...)
│   │   ├── routes/             # Định nghĩa các nhóm REST API endpoints
│   │   ├── services/           # Dịch vụ tích hợp (Gemini AI Chatbot, SendMail OTP, VNPay...)
│   │   ├── server.js           # File khởi chạy server Express chính (Port 5001)
│   │   └── seed.js             # Script tạo 220 khu trọ mẫu cho MongoDB
│   └── frontend/               # Single Page Application ReactJS
│       ├── src/
│       │   ├── components/     # UI Components dùng chung (Sidebar, Navbar, Chatbot AI Widget...)
│       │   ├── services/       # Module gọi REST API kết nối Backend
│       │   └── views/          # Màn hình Dashboard phân quyền (Admin, Manager, Tenant, Visitor)
│       └── package.json
└── README.md                   # Tài liệu hướng dẫn này
```

---

## 🔒 3. Hướng dẫn Cấu hình Biến Môi trường (`.env`)

Tạo tệp `.env` tại thư mục `/src/backend/` và cấu hình các giá trị kết nối của bạn:

```env
# URL Kết nối MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/boardinghouse_db

# Cấu hình Express Server
PORT=5001
JWT_SECRET=supersecretkeyforboardinghousepro2026

# Cấu hình SMTP gửi mã OTP (Sử dụng Gmail app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API Key Google Gemini AI
GEMINI_API_KEY=AIzaSyDBgVXlA-rS0puux3vY1LA-q799qb2IDQc
```

---

## 🚀 4. Hướng dẫn Khởi chạy Hệ thống Chi tiết

Để hệ thống hoạt động đầy đủ tính năng, bạn cần khởi chạy song song 2 dịch vụ: **Express Backend (Port 5001)** và **Vite Frontend (Port 5173)**.

---

### 💻 Tùy chọn A: Dành cho Hệ điều hành Windows

#### 1️⃣ Khởi chạy Express Backend
Mở Command Prompt (CMD) thứ nhất:
```cmd
cd src\backend
npm install
npm run seed     # Khởi tạo dữ liệu mẫu (chỉ cần chạy một lần duy nhất)
npm start
```
> 🌐 Backend chính sẽ hoạt động tại: `http://localhost:5001`

#### 2️⃣ Khởi chạy Vite Frontend
Mở Command Prompt (CMD) thứ hai:
```cmd
cd src\frontend
npm install
npm run dev
```
> 🌐 Giao diện Web sẽ chạy tại: `http://localhost:5173`

---

### 🍎 Tùy chọn B: Dành cho Hệ điều hành macOS / Linux

#### 1️⃣ Khởi chạy Express Backend
Mở Terminal thứ nhất:
```bash
cd src/backend
npm install
npm run seed     # Khởi tạo dữ liệu mẫu (chỉ cần chạy một lần duy nhất)
npm start
```
> 🌐 Backend chính sẽ hoạt động tại: `http://localhost:5001`

#### 2️⃣ Khởi chạy Vite Frontend
Mở Terminal thứ hai:
```bash
cd src/frontend
npm install
npm run dev
```
> 🌐 Giao diện Web sẽ chạy tại: `http://localhost:5173`

---

## 👥 5. Tài khoản Trải nghiệm Hệ thống

Sau khi khởi chạy hệ thống và seed dữ liệu thành công, truy cập `http://localhost:5173` và sử dụng các tài khoản thử nghiệm tương ứng với các phân quyền:

| Đối tượng | Email | Mật khẩu | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **👑 Chủ trọ (Admin)** | `admin@boardinghouse.com` | `admin` | Quản lý toàn bộ chuỗi nhà trọ, thêm/sửa cơ sở, phân công quản lý (Manager) phụ trách từng cơ sở, xem biểu đồ doanh thu toàn hệ thống. |
| **👔 Quản lý (Manager)** | `manager@boardinghouse.com` | `manager` | Quản lý cơ sở được phân công. Thêm phòng, lập hợp đồng, cập nhật số điện nước, lập hóa đơn và theo dõi đóng tiền. |
| **🔑 Khách thuê (Tenant)** | `tenant@boardinghouse.com` | `tenant` | Xem phòng đang thuê, xem danh sách hóa đơn, giả lập thanh toán online, gửi phản ánh lên ban quản lý. |
| **🌐 Khách vãng lai (Visitor)** | *Không cần tài khoản* | *N/A* | Tìm kiếm phòng trọ trống theo khu vực địa lý, xem chi tiết phòng, đăng ký/đăng nhập trực tiếp để gửi yêu cầu đặt cọc giữ phòng trực tuyến. |

---

## ✨ 6. Tính năng đã được Đồng bộ & Tối ưu hóa Gần đây

- 📊 **Dữ liệu động 100%**: Loại bỏ hoàn toàn dữ liệu giả (mockdata). Toàn bộ dữ liệu hiển thị trên Admin/Manager Dashboard được đồng bộ thời gian thực từ database MongoDB Atlas.
- 🏢 **Chuyển đổi cơ sở thông minh**: Phân quyền Manager được trang bị dropdown chuyển đổi cơ sở ở sidebar giúp tự động đồng bộ tất cả các tab tính năng (Phòng, Hợp đồng, Chỉ số điện nước, Hóa đơn).
- 🤖 **Trợ lý ảo AI thông minh**: Chatbot AI Gemini được tích hợp ở góc phải màn hình, có khả năng đọc ngữ cảnh CSDL thực tế (số phòng trống, số tòa nhà...) để tư vấn cho khách hàng.
- 📧 **Xác thực OTP qua Gmail**: Quy trình đăng ký tài khoản khách thuê tích hợp gửi mã OTP thực tế qua Google Mail SMTP để bảo mật tài khoản.
- 📝 **Đặc tả UML & PlantUML:** Đã hoàn thiện toàn bộ mã nguồn PlantUML cho các sơ đồ thiết kế hệ thống trong thư mục `docs/`.
- 💰 **Ràng buộc đặt cọc giữ phòng:** Đặt cọc yêu cầu đăng nhập/đăng ký tài khoản; tự động khóa phòng đặt cọc trong 24 giờ và giải phóng về trạng thái trống nếu quá hạn.
