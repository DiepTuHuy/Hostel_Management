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
router.get('/api/properties/:propertyId/room-types', verifyToken, async (req, res) => {
  try {
    const roomTypes = await RoomType.find({ maNhaTroId: req.params.propertyId }).lean();
    res.json(roomTypes.map(rt => ({
      id: rt._id.toString(),
      propertyId: rt.maNhaTroId.toString(),
      name: rt.tenLoai,
      area: rt.dienTich,
      basePrice: rt.giaCoBan,
      amenities: rt.tienNghi || []
    })));
  } catch (error) {
    console.error("Lỗi lấy danh sách loại phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

router.post('/api/room-types', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { propertyId, name, area, basePrice, amenities } = req.body;
    if (!propertyId || !name) {
      return res.status(400).json({ message: "Vui lòng truyền mã nhà trọ và tên loại phòng." });
    }
    const rt = await RoomType.create({
      maNhaTroId: propertyId,
      tenLoai: name,
      dienTich: Number(area) || 0,
      giaCoBan: Number(basePrice) || 0,
      tienNghi: amenities || []
    });
    res.status(201).json({
      id: rt._id.toString(),
      propertyId: rt.maNhaTroId.toString(),
      name: rt.tenLoai,
      area: rt.dienTich,
      basePrice: rt.giaCoBan,
      amenities: rt.tienNghi
    });
  } catch (error) {
    console.error("Lỗi tạo loại phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo loại phòng." });
  }
});

router.put('/api/room-types/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { name, area, basePrice, amenities } = req.body;
    const rt = await RoomType.findById(req.params.id);
    if (!rt) return res.status(404).json({ message: "Không tìm thấy loại phòng." });
    
    if (name) rt.tenLoai = name;
    if (area !== undefined) rt.dienTich = Number(area);
    if (basePrice !== undefined) rt.giaCoBan = Number(basePrice);
    if (amenities) rt.tienNghi = amenities;
    
    await rt.save();
    res.json({
      id: rt._id.toString(),
      propertyId: rt.maNhaTroId.toString(),
      name: rt.tenLoai,
      area: rt.dienTich,
      basePrice: rt.giaCoBan,
      amenities: rt.tienNghi
    });
  } catch (error) {
    console.error("Lỗi sửa loại phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa loại phòng." });
  }
});

router.delete('/api/room-types/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const rt = await RoomType.findByIdAndDelete(req.params.id);
    if (!rt) return res.status(404).json({ message: "Không tìm thấy loại phòng." });
    res.json({ message: "Xóa loại phòng thành công." });
  } catch (error) {
    console.error("Lỗi xóa loại phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// KÝ HỢP ĐỒNG ĐIỆN TỬ (UC17)


export default router;
