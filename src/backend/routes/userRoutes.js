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
router.get('/api/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.vaiTro = role;

    const users = await User.find(filter);
    res.json(users.map(mapUser));
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 8.1. Lấy chi tiết người dùng
router.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });
    res.json(mapUser(user));
  } catch (error) {
    console.error("Lỗi lấy chi tiết người dùng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// ==========================================
// BỔ SUNG CÁC API CRUD & THỐNG KÊ NGHIỆP VỤ
// ==========================================

// A. USER PROFILE & ADMIN OPERATIONS
// A.1 Cập nhật thông tin profile khách thuê
router.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { fullName, phone, tenantProfile } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (fullName) user.hoTen = fullName;
    if (phone) user.sdt = phone;
    if (tenantProfile) {
      user.thongTinKhachThue = {
        cccd: tenantProfile.cccd || user.thongTinKhachThue?.cccd,
        ngheNghiep: tenantProfile.occupation || tenantProfile.ngheNghiep || user.thongTinKhachThue?.ngheNghiep,
        diaChiThuongTru: tenantProfile.permanentAddress || tenantProfile.diaChiThuongTru || user.thongTinKhachThue?.diaChiThuongTru
      };
    }
    await user.save();
    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ." });
  }
});

// A.2 Khóa/Mở khóa tài khoản người dùng
router.patch('/api/users/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    user.trangThai = status;
    await user.save();
    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error("Lỗi đổi trạng thái tài khoản:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// B. CRUD PROPERTIES (NHÀ TRỌ)
// B.1 Thêm cơ sở nhà trọ mới


export default router;
