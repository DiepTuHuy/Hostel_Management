import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Property } from './models/Property.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes

// 1. Đăng ký tài khoản (Trực tiếp lưu tài khoản mới vào database MongoDB Atlas)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, role, tenantProfile } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin bắt buộc (họ tên, email, mật khẩu, số điện thoại)." });
    }

    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email này đã tồn tại trong hệ thống." });
    }

    // Mã hoá mật khẩu bảo mật bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới trực tiếp lưu vào DB
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: role || 'tenant',
      status: 'active',
      tenantProfile: role === 'tenant' ? tenantProfile : undefined
    });

    // Loại bỏ password trước khi gửi phản hồi về client
    const responseUser = newUser.toObject();
    delete responseUser.password;

    console.log(`[Database] Đăng ký thành công người dùng mới trực tiếp vào MongoDB: ${email}`);
    res.status(201).json({
      message: "Đăng ký tài khoản thành công!",
      user: responseUser
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký tài khoản." });
  }
});

// 2. Đăng nhập (Kiểm tra tài khoản từ database MongoDB Atlas)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // So khớp mật khẩu đã băm
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác." });
    }

    // Tạo mã token mô phỏng phiên đăng nhập
    const token = `jwt.${user._id}.${Date.now()}`;
    const userObj = user.toObject();
    delete userObj.password;

    console.log(`[Database] Người dùng đăng nhập thành công: ${email} (${user.role})`);
    res.json({
      token,
      user: userObj
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
  }
});

// 3. Lấy danh sách các cơ sở nhà trọ (220 cơ sở đã seed ở TP.HCM)
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().populate('managerIds', 'fullName email phone');
    res.json(properties);
  } catch (error) {
    console.error("Lỗi lấy danh sách cơ sở:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// Khởi chạy Server sau khi kết nối CSDL thành công
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start backend server due to DB connection error:", err.message);
});
