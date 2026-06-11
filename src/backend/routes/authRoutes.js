import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { RoomType } from '../models/RoomType.js';
import { Service } from '../models/Service.js';
import { Reading } from '../models/Reading.js';
import { Expense } from '../models/Expense.js';

import { emailService } from '../services/emailService.js';
import vnpayService from '../services/vnpayService.js';
import pdfReportService from '../services/pdfReportService.js';

import { mapDocument, mapRoom, mapContract, mapInvoice, mapNotification, mapUser } from '../utils/mappers.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Route chẩn đoán lỗi kết nối MongoDB và SMTP trên production
router.get('/api/diagnose', async (req, res) => {
  const diagnosis = {
    mongodb: {
      status: "unknown",
      error: null
    },
    smtp: {
      status: "unknown",
      error: null,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? `${process.env.SMTP_USER.slice(0, 3)}...` : null
      }
    }
  };

  // Kiểm tra trạng thái MongoDB
  try {
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    diagnosis.mongodb.status = states[state] || "unknown";
  } catch (err) {
    diagnosis.mongodb.status = "error";
    diagnosis.mongodb.error = err.message;
  }

  // Kiểm tra SMTP bằng cách thử verify kết nối trong tối đa 5 giây
  try {
    const testTransporter = (await import('nodemailer')).default.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000
    });
    await testTransporter.verify();
    diagnosis.smtp.status = "connected";
  } catch (err) {
    diagnosis.smtp.status = "failed";
    diagnosis.smtp.error = err.message;
  }

  res.json(diagnosis);
});

// 1. Đăng ký tài khoản (Trực tiếp lưu tài khoản mới vào database MongoDB Atlas)
router.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, role, tenantProfile } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin bắt buộc (họ tên, email, mật khẩu, số điện thoại)." });
    }

    const emailLower = email.toLowerCase();

    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await User.findOne({ email: emailLower });
    
    if (existingUser) {
      if (existingUser.trangThai === 'active') {
        return res.status(400).json({ message: "Email này đã tồn tại và đã được kích hoạt trong hệ thống." });
      }
      
      // Nếu tài khoản đang ở trạng thái pending (chưa xác thực), chúng ta sẽ cho phép gửi lại mã OTP mới và cập nhật thông tin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // hết hạn trong 5 phút

      existingUser.hoTen = fullName;
      existingUser.matKhau = hashedPassword;
      existingUser.sdt = phone;
      existingUser.vaiTro = role || 'tenant';
      existingUser.thongTinKhachThue = role === 'tenant' ? {
        cccd: tenantProfile?.cccd,
        ngheNghiep: tenantProfile?.occupation,
        diaChiThuongTru: tenantProfile?.permanentAddress
      } : undefined;
      existingUser.otp = { maOtp: otpCode, hanSuDung: otpExpires };
      
      await existingUser.save();

      console.log(`[Database] Gửi lại mã OTP đăng ký mới cho tài khoản pending: ${emailLower} - OTP: ${otpCode}`);
      const emailSent = await emailService.sendOtpEmail(emailLower, fullName, otpCode);

      return res.status(200).json({
        message: emailSent
          ? "Mã OTP mới đã được gửi tới email của bạn. Vui lòng xác thực tài khoản."
          : (process.env.NODE_ENV === 'production'
              ? "Gửi email xác thực thất bại. Vui lòng liên hệ hỗ trợ hoặc thử lại."
              : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP mới của bạn là: ${otpCode}`),
        status: "pending",
        email: emailLower
      });
    }

    // Mã hoá mật khẩu bảo mật bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sinh mã OTP 6 chữ số ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // hết hạn trong 5 phút

    // Tạo user mới với trạng thái pending
    const newUser = await User.create({
      hoTen: fullName,
      email: emailLower,
      matKhau: hashedPassword,
      sdt: phone,
      vaiTro: role || 'tenant',
      trangThai: 'pending',
      thongTinKhachThue: role === 'tenant' ? {
        cccd: tenantProfile?.cccd,
        ngheNghiep: tenantProfile?.occupation,
        diaChiThuongTru: tenantProfile?.permanentAddress
      } : undefined,
      otp: { maOtp: otpCode, hanSuDung: otpExpires }
    });

    console.log(`[Database] Đăng ký tài khoản pending mới thành công: ${emailLower} - OTP: ${otpCode}`);
    
    // Gửi email thật
    const emailSent = await emailService.sendOtpEmail(emailLower, fullName, otpCode);

    res.status(201).json({
      message: emailSent
        ? "Mã OTP xác thực đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!"
        : (process.env.NODE_ENV === 'production'
            ? "Gửi email xác thực thất bại. Vui lòng thử lại sau."
            : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP của bạn là: ${otpCode}`),
      status: "pending",
      email: emailLower
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký tài khoản." });
  }
});

// 1.1. Xác thực OTP đăng ký tài khoản
router.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mã OTP." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    if (user.trangThai === 'active') {
      return res.status(400).json({ message: "Tài khoản đã được kích hoạt từ trước." });
    }

    if (!user.otp || !user.otp.maOtp) {
      return res.status(400).json({ message: "Không tìm thấy mã OTP nào đang chờ xác thực." });
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.otp.hanSuDung)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn (hiệu lực trong 5 phút). Vui lòng yêu cầu gửi lại mã mới." });
    }

    // Kiểm tra mã OTP khớp
    if (user.otp.maOtp !== otp.trim()) {
      return res.status(400).json({ message: "Mã OTP nhập vào không chính xác. Vui lòng kiểm tra lại." });
    }

    // Kích hoạt tài khoản thành công
    user.trangThai = 'active';
    user.otp = { maOtp: undefined, hanSuDung: undefined };
    await user.save();

    console.log(`[Database] Xác thực OTP thành công, kích hoạt tài khoản: ${emailLower}`);

    // Tạo mã token JWT thực sự
    const token = jwt.sign(
      { id: user._id.toString(), role: user.vaiTro },
      process.env.JWT_SECRET || 'bhpro_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Kích hoạt tài khoản thành công!",
      token,
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi xác thực OTP." });
  }
});

// 1.2. Gửi lại mã OTP
router.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ email." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản nào đang chờ xác thực." });
    }

    if (user.trangThai === 'active') {
      return res.status(400).json({ message: "Tài khoản này đã được kích hoạt rồi." });
    }

    // Sinh mã OTP mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = { maOtp: otpCode, hanSuDung: otpExpires };
    await user.save();

    console.log(`[Database] Đã gửi lại mã OTP mới cho tài khoản: ${emailLower} - OTP mới: ${otpCode}`);

    // Gửi email thật
    const emailSent = await emailService.sendOtpEmail(emailLower, user.hoTen, otpCode);

    res.status(200).json({
      message: emailSent
        ? "Gửi lại mã OTP thành công! Vui lòng kiểm tra hòm thư email của bạn."
        : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP mới của bạn là: ${otpCode}`
    });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi gửi lại OTP." });
  }
});

// 1.3. Yêu cầu gửi OTP quên mật khẩu (dành riêng cho khách thuê - tenant)
router.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ email." });
    }

    const emailLower = email.toLowerCase();
    // Tìm user theo email, phải là active và có vai trò tenant
    const user = await User.findOne({ email: emailLower, vaiTro: 'tenant' });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản khách thuê nào đã kích hoạt với email này." });
    }

    if (user.trangThai !== 'active') {
      return res.status(400).json({ message: "Tài khoản khách thuê này chưa được kích hoạt xác thực." });
    }

    // Sinh mã OTP khôi phục mật khẩu mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = { maOtp: otpCode, hanSuDung: otpExpires };
    await user.save();

    console.log(`[Database] Đã gửi mã OTP quên mật khẩu cho tài khoản: ${emailLower} - OTP: ${otpCode}`);

    // Gửi email khôi phục
    const emailSent = await emailService.sendForgotPasswordOtpEmail(emailLower, user.hoTen, otpCode);

    res.status(200).json({
      message: emailSent
        ? "Mã OTP khôi phục mật khẩu đã được gửi thành công đến email của bạn!"
        : (process.env.NODE_ENV === 'production'
            ? "Gửi email khôi phục thất bại. Vui lòng thử lại sau."
            : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP khôi phục của bạn là: ${otpCode}`)
    });
  } catch (error) {
    console.error("Lỗi yêu cầu OTP quên mật khẩu:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi yêu cầu quên mật khẩu." });
  }
});

// 1.4. Xác thực OTP quên mật khẩu và đặt lại mật khẩu mới
router.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin (email, mã OTP, mật khẩu mới)." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower, vaiTro: 'tenant' });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản khách thuê không tồn tại." });
    }

    if (!user.otp || !user.otp.maOtp) {
      return res.status(400).json({ message: "Không tìm thấy phiên yêu cầu OTP khôi phục mật khẩu." });
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.otp.hanSuDung)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng yêu cầu lại mã mới." });
    }

    // Kiểm tra mã OTP khớp
    if (user.otp.maOtp !== otp.trim()) {
      return res.status(400).json({ message: "Mã OTP nhập vào không chính xác. Vui lòng kiểm tra lại." });
    }

    // Hash mật khẩu mới bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Lưu mật khẩu mới và xóa OTP
    user.matKhau = hashedPassword;
    user.otp = { maOtp: undefined, hanSuDung: undefined };
    await user.save();

    console.log(`[Database] Đặt lại mật khẩu thành công cho tài khoản khách thuê: ${emailLower}`);

    res.status(200).json({
      message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới."
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi khôi phục mật khẩu." });
  }
});

// 2. Đăng nhập (Kiểm tra tài khoản từ database MongoDB Atlas)
router.post('/api/auth/login', async (req, res) => {
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
    const isMatch = await bcrypt.compare(password, user.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác." });
    }

    // Tạo mã token JWT thực sự
    const token = jwt.sign(
      { id: user._id.toString(), role: user.vaiTro },
      process.env.JWT_SECRET || 'bhpro_secret_key_2026',
      { expiresIn: '7d' }
    );

    console.log(`[Database] Người dùng đăng nhập thành công: ${email} (${user.vaiTro})`);
    res.json({
      token,
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
  }
});

// 2.1. Đăng xuất
router.post('/api/auth/logout', (req, res) => {
  res.json({ message: "Đăng xuất thành công." });
});



export default router;
