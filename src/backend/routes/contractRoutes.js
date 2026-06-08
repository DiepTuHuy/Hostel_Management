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
router.get('/api/contracts', verifyToken, async (req, res) => {
  try {
    const { propertyId, tenantId, status } = req.query;
    const filter = {};
    if (tenantId) {
      if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        return res.json([]);
      }
      filter.maKhachThueIds = tenantId;
    }
    if (status) filter.trangThai = status;

    const contracts = await Contract.find(filter).populate('maPhongId').populate('maKhachThueIds');
    
    let results = contracts;
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      results = contracts.filter(c => c.maPhongId?.maNhaTroId?.toString() === propertyId);
    }

    res.json(results.map(mapContract));
  } catch (error) {
    console.error("Lỗi lấy danh sách hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 5.1. Lấy chi tiết hợp đồng
router.get('/api/contracts/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    }
    const contract = await Contract.findById(req.params.id).populate('maPhongId').populate('maKhachThueIds');
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    res.json(mapContract(contract));
  } catch (error) {
    console.error("Lỗi lấy chi tiết hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 6. Lấy danh sách hoá đơn

router.post('/api/contracts', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { roomId, tenantId, tenantIds, tenantName, tenantPhone, tenantCccd, tenantEmail, startDate, endDate, deposit } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng trọ." });

    let tIds = [];
    if (tenantIds && tenantIds.length > 0) {
      tIds = tenantIds;
    } else if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
      tIds = [tenantId];
    } else if (tenantName || tenantPhone || tenantEmail) {
      // Tìm hoặc tạo mới khách thuê
      const emailLower = (tenantEmail || '').toLowerCase();
      let user = null;
      if (emailLower) {
        user = await User.findOne({ email: emailLower });
      }
      if (!user && tenantPhone) {
        user = await User.findOne({ sdt: tenantPhone });
      }
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt); // Mật khẩu mặc định là 123456
        user = await User.create({
          hoTen: tenantName || 'Khách thuê mới',
          email: emailLower || `tenant-${Date.now()}@boardinghouse.vn`,
          matKhau: hashedPassword,
          sdt: tenantPhone || '0000000000',
          vaiTro: 'tenant',
          trangThai: 'active',
          thongTinKhachThue: {
            cccd: tenantCccd || '',
            ngheNghiep: 'Tự do',
            diaChiThuongTru: 'Chưa cập nhật'
          }
        });
      }
      tIds = [user._id];
    }

    if (tIds.length === 0) {
      return res.status(400).json({ message: "Cần gán ít nhất một khách thuê cho hợp đồng." });
    }

    const code = `HD-${Math.floor(100000 + Math.random() * 900000)}`;

    const contract = await Contract.create({
      maPhongId: roomId,
      maKhachThueIds: tIds,
      ngayBatDau: new Date(startDate || Date.now()),
      ngayKetThuc: new Date(endDate || Date.now() + 365 * 24 * 60 * 60 * 1000),
      tienCoc: Number(deposit) || room.giaThueHienTai || 3000000,
      trangThai: 'draft',
      duongDanPdf: `https://boardinghouse.vn/contracts/${code}.pdf`
    });

    const populated = await Contract.findById(contract._id).populate('maPhongId').populate('maKhachThueIds');
    
    // Gửi email thông báo thật qua Gmail bằng Nodemailer
    const primaryTenant = populated.maKhachThueIds?.[0];
    if (primaryTenant && primaryTenant.email) {
      await emailService.sendContractNotificationEmail(
        primaryTenant.email,
        primaryTenant.hoTen,
        code,
        room.giaThueHienTai || room.giaThue || 3000000,
        Number(deposit) || room.giaThueHienTai || 3000000,
        startDate || Date.now(),
        endDate || (Date.now() + 365 * 24 * 60 * 60 * 1000)
      );
    }

    res.status(201).json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi lập hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi lập hợp đồng." });
  }
});

// D.2 Chấm dứt hợp đồng sớm
router.patch('/api/contracts/:id/terminate', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });

    contract.trangThai = 'terminated';
    await contract.save();

    const room = await Room.findById(contract.maPhongId);
    if (room) {
      room.trangThai = 'empty';
      await room.save();
      await Property.findByIdAndUpdate(room.maNhaTroId, { $inc: { soPhongDaThue: -1 } });
    }

    const populated = await Contract.findById(contract._id).populate('maPhongId').populate('maKhachThueIds');
    res.json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi tất toán hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// D.3 Gia hạn hợp đồng
router.patch('/api/contracts/:id/extend', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { endDate } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });

    contract.ngayKetThuc = new Date(endDate);
    contract.trangThai = 'active';
    await contract.save();

    const populated = await Contract.findById(contract._id).populate('maPhongId').populate('maKhachThueIds');
    res.json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi gia hạn hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// E. CRUD SERVICES (DỊCH VỤ)
// E.1 Lấy các dịch vụ của cơ sở nhà trọ

router.patch('/api/contracts/:id/sign', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    
    contract.trangThai = 'active';
    await contract.save();
    
    // Tự động đổi trạng thái phòng tương ứng sang rented (đang thuê) và gán khách thuê
    await Room.findByIdAndUpdate(contract.maPhongId, {
      trangThai: 'rented',
      currentTenantId: contract.maKhachThueIds?.[0]
    });

    // Tăng số lượng phòng đã thuê
    const room = await Room.findById(contract.maPhongId);
    if (room) {
      await Property.findByIdAndUpdate(room.maNhaTroId, { $inc: { soPhongDaThue: 1 } });
    }
    
    const populated = await Contract.findById(contract._id).populate('maPhongId maKhachThueIds');
    res.json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi ký hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi ký hợp đồng." });
  }
});

// SỬA HỢP ĐỒNG (UC19)
router.put('/api/contracts/:id', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { startDate, endDate, deposit, monthlyRent } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    
    if (startDate) contract.ngayBatDau = new Date(startDate);
    if (endDate) contract.ngayKetThuc = new Date(endDate);
    if (deposit !== undefined) contract.tienCoc = Number(deposit);
    
    await contract.save();
    
    // Nếu có sửa tiền phòng, có thể cập nhật trực tiếp lên phòng trọ
    if (monthlyRent !== undefined) {
      await Room.findByIdAndUpdate(contract.maPhongId, {
        giaThue: Number(monthlyRent),
        giaThueHienTai: Number(monthlyRent)
      });
    }
    
    const populated = await Contract.findById(contract._id).populate('maPhongId maKhachThueIds');
    res.json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi sửa hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa hợp đồng." });
  }
});

// NHẮC NỢ QUA EMAIL THẬT (UC37)

router.get('/api/contracts/:id/pdf', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    }
    const contractDoc = await Contract.findById(req.params.id).populate('maPhongId').populate('maKhachThueIds');
    if (!contractDoc) return res.status(404).json({ message: "Không tìm thấy hợp đồng." });
    const contract = mapContract(contractDoc);
    pdfReportService.streamContractPdf(res, contract);
  } catch (error) {
    console.error("Lỗi xuất PDF hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi xuất PDF hợp đồng." });
  }
});

// Endpoint xuất PDF Hóa đơn thật


export default router;
