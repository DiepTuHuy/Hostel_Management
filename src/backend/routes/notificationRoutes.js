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
router.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = {};
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.json([]);
      }
      filter.maNguoiDungId = userId;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    res.json(notifications.map(mapNotification));
  } catch (error) {
    console.error("Lỗi lấy danh sách thông báo:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// Đánh dấu một thông báo đã đọc
router.patch('/api/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID thông báo không hợp lệ." });
    }
    const notification = await Notification.findByIdAndUpdate(id, { daDoc: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }
    res.json(mapNotification(notification));
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc thông báo:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// Đánh dấu tất cả thông báo của một user đã đọc
router.post('/api/notifications/read-all', verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "userId không hợp lệ hoặc thiếu." });
    }
    await Notification.updateMany({ maNguoiDungId: userId }, { daDoc: true });
    res.json({ success: true });
  } catch (error) {
    console.error("Lỗi đánh dấu tất cả thông báo đã đọc:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

export default router;
