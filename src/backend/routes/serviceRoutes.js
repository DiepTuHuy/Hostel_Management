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
router.get('/api/services', verifyToken, async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = {};
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) return res.json([]);
      filter.maNhaTroId = propertyId;
    }
    const services = await Service.find(filter).lean();
    res.json(services.map(s => ({
      id: s._id.toString(),
      propertyId: s.maNhaTroId ? s.maNhaTroId.toString() : undefined,
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    })));
  } catch (error) {
    console.error("Lỗi lấy danh sách dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// E.2 Tạo dịch vụ mới
router.post('/api/services', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { propertyId, name, unit, price, type } = req.body;
    if (!propertyId || !name || !unit || price === undefined || !type) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin dịch vụ." });
    }

    const s = await Service.create({
      maNhaTroId: propertyId,
      tenDichVu: name,
      donVi: unit,
      donGia: Number(price),
      loaiTinh: type
    });

    res.status(201).json({
      id: s._id.toString(),
      propertyId: s.maNhaTroId.toString(),
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    });
  } catch (error) {
    console.error("Lỗi tạo dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo dịch vụ." });
  }
});

// E.3 Cập nhật dịch vụ
router.put('/api/services/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, unit, price, type } = req.body;
    const s = await Service.findById(req.params.id);
    if (!s) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

    if (name) s.tenDichVu = name;
    if (unit) s.donVi = unit;
    if (price !== undefined) s.donGia = Number(price);
    if (type) s.loaiTinh = type;

    await s.save();
    res.json({
      id: s._id.toString(),
      propertyId: s.maNhaTroId.toString(),
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    });
  } catch (error) {
    console.error("Lỗi sửa dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa dịch vụ." });
  }
});

// E.4 Xóa cấu hình dịch vụ
router.delete('/api/services/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const s = await Service.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, message: "Xóa dịch vụ thành công." });
  } catch (error) {
    console.error("Lỗi xóa dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// F. READINGS (GHI CHỈ SỐ ĐIỆN NƯỚC)
// F.1 Lấy chỉ số điện nước theo phòng


export default router;
