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
router.get('/api/invoices', verifyToken, async (req, res) => {
  try {
    const { tenantId, propertyId, status, period } = req.query;
    const filter = {};
    
    if (tenantId) {
      if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        return res.json([]);
      }
      const tenantContracts = await Contract.find({ maKhachThueIds: tenantId });
      filter.maHopDongId = { $in: tenantContracts.map(c => c._id) };
    }
    if (status) filter.trangThai = status;
    if (period) filter.kyThanhToan = period;

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'maHopDongId',
        populate: {
          path: 'maKhachThueIds',
          select: 'hoTen'
        }
      })
      .populate('maPhongId');

    let results = invoices;
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      results = invoices.filter(inv => inv.maPhongId?.maNhaTroId?.toString() === propertyId);
    }

    res.json(results.map(mapInvoice));
  } catch (error) {
    console.error("Lỗi lấy danh sách hoá đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 6.1. Lấy chi tiết hoá đơn
router.get('/api/invoices/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy hoá đơn." });
    }
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'maHopDongId',
        populate: {
          path: 'maKhachThueIds',
          select: 'hoTen'
        }
      })
      .populate('maPhongId');
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hoá đơn." });
    res.json(mapInvoice(invoice));
  } catch (error) {
    console.error("Lỗi lấy chi tiết hoá đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 6.2. Thanh toán hoá đơn
router.post('/api/invoices/:id/pay', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy hoá đơn." });
    }
    const { method } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hoá đơn." });

    if (method === 'cash') {
      invoice.trangThai = 'pending_cash';
      await invoice.save();
      return res.json({ success: true, message: "Yêu cầu thanh toán tiền mặt đã được gửi lên hệ thống. Đang chờ Quản lý xác nhận.", status: 'pending_cash' });
    }

    if (method === 'vnpay') {
      const paymentUrl = vnpayService.createPaymentUrl(req, {
        orderId: invoice._id.toString(),
        amount: invoice.tongTien,
        orderInfo: `Thanh toan hoa don phong tro ky ${invoice.kyThanhToan}`
      });
      return res.json({ success: true, paymentUrl, message: "Tạo link thanh toán VNPay thành công!" });
    }

    invoice.trangThai = 'paid';
    await invoice.save();

    await Payment.create({
      maHoaDonId: invoice._id,
      phuongThuc: method || 'bank_transfer',
      soTien: invoice.tongTien,
      trangThai: 'success'
    });

    res.json({ success: true, message: "Thanh toán hoá đơn thành công!", status: 'paid' });
  } catch (error) {
    console.error("Lỗi thanh toán hoá đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 6.3. VNPay Return Callback

router.post('/api/invoices/generate', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId, period } = req.body;
    if (!propertyId || !period) {
      return res.status(400).json({ message: "Vui lòng truyền propertyId và kỳ thanh toán (YYYY-MM)." });
    }

    const rooms = await Room.find({ maNhaTroId: propertyId, trangThai: 'rented' });
    const generatedInvoices = [];

    for (const room of rooms) {
      const contract = await Contract.findOne({ maPhongId: room._id, trangThai: 'active' });
      if (!contract) continue;

      const details = [{
        tenDichVu: 'Tiền thuê phòng',
        soLuong: 1,
        donGia: room.giaThueHienTai,
        thanhTien: room.giaThueHienTai
      }];

      const readings = await Reading.find({ maPhongId: room._id, kyThanhToan: period }).populate('maDichVuId');
      for (const r of readings) {
        if (r.maDichVuId) {
          details.push({
            maDichVuId: r.maDichVuId._id,
            tenDichVu: r.maDichVuId.tenDichVu,
            soLuong: r.tieuThu,
            donGia: r.maDichVuId.donGia,
            thanhTien: r.tieuThu * r.maDichVuId.donGia
          });
        }
      }

      const fixedServices = await Service.find({ maNhaTroId: propertyId, loaiTinh: 'fixed' });
      for (const fs of fixedServices) {
        details.push({
          maDichVuId: fs._id,
          tenDichVu: fs.tenDichVu,
          soLuong: 1,
          donGia: fs.donGia,
          thanhTien: fs.donGia
        });
      }

      const totalAmount = details.reduce((sum, item) => sum + item.thanhTien, 0);
      await Invoice.deleteMany({ maPhongId: room._id, kyThanhToan: period });

      const code = `HD-${room.soPhong || 'P'}-${period.replace('-', '')}`;
      const invoice = await Invoice.create({
        maHopDongId: contract._id,
        maPhongId: room._id,
        kyThanhToan: period,
        tongTien: totalAmount,
        hanThanhToan: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        trangThai: 'pending',
        chiTiet: details
      });

      generatedInvoices.push(invoice);
    }
    res.json({ success: true, count: generatedInvoices.length });
  } catch (error) {
    console.error("Lỗi sinh hóa đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sinh hóa đơn." });
  }
});

// G.2 Xác nhận thu tiền mặt
router.post('/api/invoices/:id/pay-cash', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn." });

    invoice.trangThai = 'paid';
    await invoice.save();

    await Payment.create({
      maHoaDonId: invoice._id,
      phuongThuc: 'cash',
      soTien: invoice.tongTien,
      trangThai: 'success'
    });
    res.json({ success: true, message: "Xác nhận thu tiền mặt thành công!" });
  } catch (error) {
    console.error("Lỗi xác nhận thu tiền mặt:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// G.3 Từ chối xác nhận thu tiền mặt
router.post('/api/invoices/:id/reject-cash', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn." });

    invoice.trangThai = 'pending';
    await invoice.save();
    res.json({ success: true, message: "Đã từ chối xác nhận tiền mặt, hoá đơn chuyển về chưa thanh toán." });
  } catch (error) {
    console.error("Lỗi từ chối thu tiền mặt:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// H. REPORTS & KPI STATS (BÁO CÁO THỐNG KÊ)
// H.1 Dashboard KPI

router.get('/api/invoices/:id/pdf', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
    }
    const invoiceDoc = await Invoice.findById(req.params.id)
      .populate({
        path: 'maHopDongId',
        populate: {
          path: 'maKhachThueIds',
          select: 'hoTen'
        }
      })
      .populate('maPhongId');
    if (!invoiceDoc) return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
    const invoice = mapInvoice(invoiceDoc);
    pdfReportService.streamInvoicePdf(res, invoice);
  } catch (error) {
    console.error("Lỗi xuất PDF hóa đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi xuất PDF hóa đơn." });
  }
});

// Endpoint xuất PDF Báo cáo thống kê thật (Doanh thu, Lấp đầy, Công nợ, Chi phí)


export default router;
