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
// 3. Lấy danh sách các cơ sở nhà trọ (220 cơ sở đã seed ở TP.HCM)
router.get('/api/properties', verifyToken, async (req, res) => {
  try {
    const properties = await Property.find().lean();
    res.json(properties.map(p => {
      return {
        id: p._id.toString(),
        code: p.maNhaTro,
        name: p.tenNhaTro,
        address: p.diaChi,
        district: p.quanHuyen,
        city: p.thanhPho,
        image: p.hinhAnh,
        totalRooms: p.tongSoPhong,
        occupiedRooms: p.soPhongDaThue,
        managerIds: p.maQuanLyIds ? p.maQuanLyIds.map(m => m.toString()) : [],
        ownerId: p.maChuTroId ? p.maChuTroId.toString() : undefined,
        status: p.trangThai,
        qrCodeUrl: p.qrCodeUrl
      };
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách cơ sở:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 3.1. Lấy chi tiết cơ sở nhà trọ
router.get('/api/properties/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy cơ sở." });
    }
    const p = await Property.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: "Không tìm thấy cơ sở." });
    res.json({
      id: p._id.toString(),
      code: p.maNhaTro,
      name: p.tenNhaTro,
      address: p.diaChi,
      district: p.quanHuyen,
      city: p.thanhPho,
      image: p.hinhAnh,
      totalRooms: p.tongSoPhong,
      occupiedRooms: p.soPhongDaThue,
      managerIds: p.maQuanLyIds ? p.maQuanLyIds.map(m => m.toString()) : [],
      ownerId: p.maChuTroId ? p.maChuTroId.toString() : undefined,
      status: p.trangThai,
      qrCodeUrl: p.qrCodeUrl
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết cơ sở:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 4. Lấy danh sách phòng

router.post('/api/properties', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, address, district, city, totalRooms, phone, email, managerIds, qrCodeUrl } = req.body;
    const code = `CN-${Math.floor(100 + Math.random() * 900)}`;

    const p = await Property.create({
      maNhaTro: code,
      tenNhaTro: name,
      diaChi: address,
      quanHuyen: district,
      thanhPho: city || 'TP. Hồ Chí Minh',
      tongSoPhong: Number(totalRooms) || 0,
      soPhongDaThue: 0,
      hinhAnh: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500',
      maQuanLyIds: managerIds || [],
      trangThai: 'active',
      qrCodeUrl: qrCodeUrl || ''
    });

    res.status(201).json({
      id: p._id.toString(),
      code: p.maNhaTro,
      name: p.tenNhaTro,
      address: p.diaChi,
      district: p.quanHuyen,
      city: p.thanhPho,
      image: p.hinhAnh,
      totalRooms: p.tongSoPhong,
      occupiedRooms: p.soPhongDaThue,
      managerIds: p.maQuanLyIds,
      status: p.trangThai,
      qrCodeUrl: p.qrCodeUrl
    });
  } catch (error) {
    console.error("Lỗi tạo cơ sở nhà trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo nhà trọ." });
  }
});

// B.2 Cập nhật cơ sở nhà trọ
router.put('/api/properties/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, address, district, city, totalRooms, occupiedRooms, managerIds, status, qrCodeUrl } = req.body;
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Không tìm thấy cơ sở nhà trọ." });

    if (name) p.tenNhaTro = name;
    if (address) p.diaChi = address;
    if (district) p.quanHuyen = district;
    if (city) p.thanhPho = city;
    if (totalRooms !== undefined) p.tongSoPhong = Number(totalRooms);
    if (occupiedRooms !== undefined) p.soPhongDaThue = Number(occupiedRooms);
    if (managerIds) p.maQuanLyIds = managerIds;
    if (status) p.trangThai = status;
    if (qrCodeUrl !== undefined) p.qrCodeUrl = qrCodeUrl;

    await p.save();
    res.json({
      id: p._id.toString(),
      code: p.maNhaTro,
      name: p.tenNhaTro,
      address: p.diaChi,
      district: p.quanHuyen,
      city: p.thanhPho,
      image: p.hinhAnh,
      totalRooms: p.tongSoPhong,
      occupiedRooms: p.soPhongDaThue,
      managerIds: p.maQuanLyIds,
      status: p.trangThai,
      qrCodeUrl: p.qrCodeUrl
    });
  } catch (error) {
    console.error("Lỗi cập nhật nhà trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa nhà trọ." });
  }
});

// B.3 Xóa/Ngừng hoạt động nhà trọ
router.delete('/api/properties/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Không tìm thấy cơ sở." });

    p.trangThai = 'inactive';
    await p.save();
    res.json({ success: true, message: "Đã ngừng hoạt động nhà trọ." });
  } catch (error) {
    console.error("Lỗi ngưng hoạt động nhà trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// C. CRUD ROOMS (PHÒNG TRỌ)
// C.1 Thêm phòng trọ mới


export default router;
