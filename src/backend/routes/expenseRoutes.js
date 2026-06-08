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
router.get('/api/expenses', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = {};
    if (propertyId) filter.maNhaTroId = propertyId;
    const expenses = await Expense.find(filter).populate('maNhaTroId').sort({ ngayChi: -1 });
    res.json(expenses.map(e => ({
      id: e._id,
      propertyId: e.maNhaTroId?._id || e.maNhaTroId,
      propertyName: e.maNhaTroId?.tenNhaTro || 'Không xác định',
      description: e.tenChiPhi,
      amount: e.soTien,
      category: e.danhMuc,
      date: e.ngayChi,
      notes: e.ghiChu
    })));
  } catch (error) {
    console.error("Lỗi lấy danh sách chi phí:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

router.post('/api/expenses', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId, description, amount, category, date, notes } = req.body;
    if (!propertyId || !description || !amount) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc." });
    }
    const newExpense = await Expense.create({
      maNhaTroId: propertyId,
      tenChiPhi: description,
      soTien: amount,
      danhMuc: category || 'khac',
      ngayChi: date ? new Date(date) : new Date(),
      ghiChu: notes
    });
    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Lỗi tạo chi phí:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

router.delete('/api/expenses/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa chi phí thành công." });
  } catch (error) {
    console.error("Lỗi xóa chi phí:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// H.3 Tỷ lệ lấp đầy từng cơ sở


export default router;
