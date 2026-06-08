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
router.get('/api/rooms', verifyToken, async (req, res) => {
  try {
    const { propertyId, status } = req.query;
    const filter = {};
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      filter.maNhaTroId = propertyId;
    }
    if (status) {
      let dbStatus = status;
      if (status === 'occupied') dbStatus = 'rented';
      else if (status === 'vacant') dbStatus = 'empty';
      else if (status === 'paused') dbStatus = 'maintenance';
      filter.trangThai = dbStatus;
    }

    const rooms = await Room.find(filter).populate('maLoaiPhongId');
    res.json(rooms.map(mapRoom));
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 4.1. Tìm kiếm phòng nâng cao (cho visitor)
router.get('/api/rooms/search', async (req, res) => {
  try {
    const { keyword, priceMin, priceMax, district, amenities } = req.query;
    const filter = {};

    // Filter by district if provided (fetch properties in district first)
    if (district) {
      const propertiesInDistrict = await Property.find({
        quanHuyen: new RegExp(district, 'i')
      });
      filter.maNhaTroId = { $in: propertiesInDistrict.map(p => p._id) };
    }

    // Filter by price
    if (priceMin || priceMax) {
      filter.$or = [
        { giaThue: {} },
        { giaThueHienTai: {} }
      ];
      if (priceMin) {
        filter.$or[0].giaThue = { $gte: Number(priceMin) };
        filter.$or[1].giaThueHienTai = { $gte: Number(priceMin) };
      }
      if (priceMax) {
        if (!filter.$or[0].giaThue) filter.$or[0].giaThue = {};
        if (!filter.$or[1].giaThueHienTai) filter.$or[1].giaThueHienTai = {};
        filter.$or[0].giaThue.$lte = Number(priceMax);
        filter.$or[1].giaThueHienTai.$lte = Number(priceMax);
      }
    }

    let rooms = await Room.find(filter).populate('maLoaiPhongId');

    // Filter by amenities
    if (amenities) {
      const amList = amenities.split(',').map(a => a.trim().toLowerCase());
      rooms = rooms.filter(room => {
        const roomType = room.maLoaiPhongId || {};
        const roomAmList = (roomType.tienNghi || []).map(a => a.toLowerCase());
        return amList.every(a => roomAmList.includes(a));
      });
    }

    // Filter by keyword
    if (keyword) {
      const kw = keyword.toLowerCase();
      const allProps = await Property.find();
      const propMap = new Map(allProps.map(p => [p._id.toString(), p.tenNhaTro.toLowerCase()]));

      rooms = rooms.filter(room => {
        const roomType = room.maLoaiPhongId || {};
        const propName = propMap.get(room.maNhaTroId?.toString()) || '';
        const roomNum = room.soPhong || '';
        const typeName = roomType.tenLoai || '';
        return propName.includes(kw) || roomNum.includes(kw) || typeName.toLowerCase().includes(kw);
      });
    }

    res.json(rooms.map(mapRoom));
  } catch (error) {
    console.error("Lỗi tìm kiếm phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 4.2. Lấy chi tiết một phòng
router.get('/api/rooms/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy phòng." });
    }
    const room = await Room.findById(req.params.id).populate('maLoaiPhongId');
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });
    res.json(mapRoom(room));
  } catch (error) {
    console.error("Lỗi lấy chi tiết phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 5. Lấy danh sách hợp đồng

router.post('/api/rooms', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { propertyId, roomNumber, floor, price, area, description, amenities, roomTypeId } = req.body;
    let rtId = roomTypeId;

    if (!rtId) {
      let rt = await RoomType.findOne({ maNhaTroId: propertyId });
      if (!rt) {
        rt = await RoomType.create({
          maNhaTroId: propertyId,
          tenLoai: 'Phòng tiêu chuẩn',
          dienTich: area || 25,
          giaCoBan: price || 3000000,
          tienNghi: amenities || ['Wifi', 'Gác lửng', 'WC riêng']
        });
      }
      rtId = rt._id;
    }

    const count = await Room.countDocuments({ maNhaTroId: propertyId });
    const code = `P-${String(count + 1).padStart(3, '0')}`;

    const room = await Room.create({
      maNhaTroId: propertyId,
      maLoaiPhongId: rtId,
      soPhong: roomNumber || String(count + 1),
      tang: Number(floor) || 1,
      giaThueHienTai: Number(price) || 3000000,
      giaThue: Number(price) || 3000000,
      dienTich: Number(area) || 25,
      maPhong: code,
      trangThai: 'empty',
      moTa: description || '',
      hinhAnh: [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
      ],
      taiSan: [
        { tenTaiSan: 'Giường ngủ', giaTri: 2000000, tinhTrang: 'Tốt' },
        { tenTaiSan: 'Tủ quần áo', giaTri: 1500000, tinhTrang: 'Tốt' }
      ]
    });

    await Property.findByIdAndUpdate(propertyId, { $inc: { tongSoPhong: 1 } });
    const populatedRoom = await Room.findById(room._id).populate('maLoaiPhongId');
    res.status(201).json(mapRoom(populatedRoom));
  } catch (error) {
    console.error("Lỗi thêm phòng trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo phòng." });
  }
});

// C.2 Cập nhật phòng trọ + Danh sách tài sản
router.put('/api/rooms/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { roomNumber, floor, price, area, description, status, assets, taiSan } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });

    if (roomNumber) room.soPhong = roomNumber;
    if (floor !== undefined) room.tang = Number(floor);
    if (price !== undefined) {
      room.giaThueHienTai = Number(price);
      room.giaThue = Number(price);
    }
    if (area !== undefined) room.dienTich = Number(area);
    if (description !== undefined) room.moTa = description;
    if (status) room.trangThai = status;

    const newAssets = assets || taiSan;
    if (newAssets && Array.isArray(newAssets)) {
      room.taiSan = newAssets.map(a => ({
        tenTaiSan: a.name || a.tenTaiSan,
        giaTri: Number(a.value || a.giaTri) || 0,
        tinhTrang: a.condition || a.tinhTrang || 'Tốt'
      }));
    }

    await room.save();
    const populatedRoom = await Room.findById(room._id).populate('maLoaiPhongId');
    res.json(mapRoom(populatedRoom));
  } catch (error) {
    console.error("Lỗi sửa phòng trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa phòng." });
  }
});

// C.3 Xóa phòng trọ
router.delete('/api/rooms/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });

    await Property.findByIdAndUpdate(room.maNhaTroId, { $inc: { tongSoPhong: -1 } });
    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Đã xóa phòng thành công." });
  } catch (error) {
    console.error("Lỗi xóa phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// C.4 Cập nhật nhanh trạng thái phòng
router.patch('/api/rooms/:id/status', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });

    room.trangThai = status;
    await room.save();
    const populatedRoom = await Room.findById(room._id).populate('maLoaiPhongId');
    res.json(mapRoom(populatedRoom));
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// C.5 Đặt cọc phòng (Cho Visitor)
router.post('/api/rooms/:id/deposit', async (req, res) => {
  try {
    const { fullName, phone, cccd, depositAmount } = req.body;
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng." });

    room.trangThai = 'deposit';
    await room.save();

    await Payment.create({
      phuongThuc: 'bank_transfer',
      soTien: Number(depositAmount) || room.giaThueHienTai || 1000000,
      trangThai: 'success'
    });

    const populatedRoom = await Room.findById(room._id).populate('maLoaiPhongId');
    res.json({ success: true, message: "Đặt cọc phòng thành công!", room: mapRoom(populatedRoom) });
  } catch (error) {
    console.error("Lỗi đặt cọc phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đặt cọc." });
  }
});

// D. CRUD CONTRACTS (HỢP ĐỒNG)
// D.1 Tạo hợp đồng thuê mới


export default router;
