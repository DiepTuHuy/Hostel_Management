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
router.get('/api/readings', verifyToken, async (req, res) => {
  try {
    const { roomId, period } = req.query;
    const filter = {};
    if (roomId) filter.maPhongId = roomId;
    if (period) filter.kyThanhToan = period;

    const readings = await Reading.find(filter).populate('maDichVuId');
    res.json(readings.map(r => ({
      id: r._id.toString(),
      roomId: r.maPhongId.toString(),
      serviceId: r.maDichVuId?._id ? r.maDichVuId._id.toString() : r.maDichVuId.toString(),
      serviceName: r.maDichVuId?.tenDichVu || 'Dịch vụ',
      period: r.kyThanhToan,
      oldValue: r.chiSoCu,
      newValue: r.chiSoMoi,
      consumed: r.tieuThu
    })));
  } catch (error) {
    console.error("Lỗi lấy chỉ số tiêu thụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// F.2 Lưu hàng loạt chỉ số mới
router.post('/api/readings', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { readings } = req.body;
    if (!readings || !Array.isArray(readings)) {
      return res.status(400).json({ message: "Dữ liệu chỉ số không hợp lệ." });
    }

    const createdReadings = [];
    for (const r of readings) {
      const consumed = Number(r.newValue) - Number(r.oldValue);
      await Reading.deleteMany({ maPhongId: r.roomId, maDichVuId: r.serviceId, kyThanhToan: r.period });

      const reading = await Reading.create({
        maPhongId: r.roomId,
        maDichVuId: r.serviceId,
        kyThanhToan: r.period,
        chiSoCu: Number(r.oldValue),
        chiSoMoi: Number(r.newValue),
        tieuThu: consumed
      });
      createdReadings.push(reading);
    }
    res.status(201).json({ success: true, count: createdReadings.length });
  } catch (error) {
    console.error("Lỗi lưu chỉ số:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi ghi chỉ số." });
  }
});

// G. INVOICE GENERATION & BILLING
// G.1 Sinh hóa đơn hàng loạt


export default router;
