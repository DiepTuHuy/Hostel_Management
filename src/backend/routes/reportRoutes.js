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

function formatDate(d) {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}
router.get('/api/reports/dashboard', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = {};
    const roomFilter = {};

    if (propertyId) {
      filter._id = propertyId;
      roomFilter.maNhaTroId = propertyId;
    }

    const totalProperties = await Property.countDocuments(propertyId ? filter : {});
    const totalRooms = await Room.countDocuments(roomFilter);
    const occupiedRooms = await Room.countDocuments({ ...roomFilter, trangThai: 'rented' });
    const emptyRooms = await Room.countDocuments({ ...roomFilter, trangThai: 'empty' });
    const depositRooms = await Room.countDocuments({ ...roomFilter, trangThai: 'deposit' });

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const paidInvoices = await Invoice.find(propertyId ? { maPhongId: { $in: await Room.find(roomFilter).distinct('_id') }, trangThai: 'paid' } : { trangThai: 'paid' });
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.tongTien, 0);

    const pendingInvoices = await Invoice.find(propertyId ? { maPhongId: { $in: await Room.find(roomFilter).distinct('_id') }, trangThai: 'pending' } : { trangThai: 'pending' });
    const totalDebt = pendingInvoices.reduce((sum, inv) => sum + inv.tongTien, 0);

    res.json({
      totalProperties,
      totalRooms,
      occupiedRooms,
      emptyRooms,
      depositRooms,
      occupancyRate,
      totalRevenue,
      totalDebt
    });
  } catch (error) {
    console.error("Lỗi lấy thống kê dashboard:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// H.2 Doanh thu và nợ theo tháng (Vẽ biểu đồ)
router.get('/api/reports/revenue', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId, year = 2026 } = req.query;
    const roomFilter = {};
    if (propertyId) roomFilter.maNhaTroId = propertyId;

    const invoicesQuery = { trangThai: 'paid' };
    if (propertyId) {
      const roomIds = await Room.find(roomFilter).distinct('_id');
      invoicesQuery.maPhongId = { $in: roomIds };
    }

    const invoices = await Invoice.find(invoicesQuery).lean();
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`,
      revenue: 0,
      debt: 0
    }));

    for (const inv of invoices) {
      if (inv.kyThanhToan && inv.kyThanhToan.startsWith(String(year))) {
        const monthIndex = parseInt(inv.kyThanhToan.split('-')[1]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRevenue[monthIndex].revenue += inv.tongTien;
        }
      }
    }

    const pendingQuery = { trangThai: { $in: ['pending', 'overdue'] } };
    if (propertyId) {
      const roomIds = await Room.find(roomFilter).distinct('_id');
      pendingQuery.maPhongId = { $in: roomIds };
    }
    const pendingInvoices = await Invoice.find(pendingQuery).lean();

    for (const inv of pendingInvoices) {
      if (inv.kyThanhToan && inv.kyThanhToan.startsWith(String(year))) {
        const monthIndex = parseInt(inv.kyThanhToan.split('-')[1]) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRevenue[monthIndex].debt += inv.tongTien;
        }
      }
    }

    res.json(monthlyRevenue);
  } catch (error) {
    console.error("Lỗi báo cáo doanh thu:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// H.2b Báo cáo chi phí vận hành (UC35)
router.get('/api/reports/expenses', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId, year = 2026 } = req.query;
    const expenseFilter = {};
    if (propertyId) expenseFilter.maNhaTroId = propertyId;

    const expenses = await Expense.find(expenseFilter).lean();
    const monthlyExpenses = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`,
      expense: 0
    }));

    for (const exp of expenses) {
      const expDate = new Date(exp.ngayChi);
      if (expDate.getFullYear() === parseInt(year)) {
        const monthIndex = expDate.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyExpenses[monthIndex].expense += exp.soTien;
        }
      }
    }

    res.json(monthlyExpenses);
  } catch (error) {
    console.error("Lỗi báo cáo chi phí:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// CRUD API Chi phí vận hành (UC35)

router.get('/api/reports/occupancy', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const properties = await Property.find({ trangThai: 'active' }).lean();
    const data = [];
    for (const p of properties) {
      const total = await Room.countDocuments({ maNhaTroId: p._id });
      const occupied = await Room.countDocuments({ maNhaTroId: p._id, trangThai: 'rented' });
      data.push({
        name: p.tenNhaTro,
        occupied: occupied,
        empty: total - occupied
      });
    }
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy tỷ lệ lấp đầy:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// H.4 Danh sách công nợ chi tiết
router.get('/api/reports/debts', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = { trangThai: { $in: ['pending', 'overdue'] } };

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'maHopDongId',
        populate: {
          path: 'maKhachThueIds',
          select: 'hoTen sdt email'
        }
      })
      .populate('maPhongId');

    let results = invoices;
    if (propertyId) {
      results = invoices.filter(inv => inv.maPhongId?.maNhaTroId?.toString() === propertyId);
    }

    res.json(results.map(inv => {
      const contract = inv.maHopDongId || {};
      const tenant = contract.maKhachThueIds?.[0] || {};
      const room = inv.maPhongId || {};
      const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(inv.hanThanhToan).getTime()) / (24 * 60 * 60 * 1000)));

      return {
        id: inv._id.toString(),
        invoiceCode: inv.code || `HD-${inv._id.toString().substring(18).toUpperCase()}`,
        roomNumber: room.soPhong || '?',
        tenantName: tenant.hoTen || 'Chưa rõ',
        tenantPhone: tenant.sdt || 'Chưa rõ',
        amount: inv.tongTien,
        dueDate: inv.hanThanhToan,
        daysOverdue: daysOverdue,
        status: inv.trangThai
      };
    }));
  } catch (error) {
    console.error("Lỗi lấy báo cáo công nợ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});


router.post('/api/reports/debts/:invoiceId/remind', verifyToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId)
      .populate({
        path: 'maHopDongId',
        populate: { path: 'maKhachThueIds' }
      })
      .populate('maPhongId');
      
    if (!invoice) return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
    
    const contract = invoice.maHopDongId || {};
    const tenant = contract.maKhachThueIds?.[0];
    if (!tenant) return res.status(404).json({ message: "Không tìm thấy thông tin khách thuê của hóa đơn này." });
    if (!tenant.email) return res.status(400).json({ message: "Khách thuê chưa đăng ký địa chỉ email." });
    
    // Gọi gửi email thật qua Nodemailer
    const success = await emailService.sendDebtReminderEmail(
      tenant.email,
      tenant.hoTen,
      invoice.tongTien,
      invoice.hanThanhToan,
      invoice.code || `HD-${invoice._id.toString().substring(18).toUpperCase()}`,
      invoice.kyThanhToan
    );
    
    if (success) {
      res.json({ message: `Đã gửi thành công email nhắc nợ đến khách thuê ${tenant.hoTen} (${tenant.email}).` });
    } else {
      res.status(500).json({ message: "Gửi email nhắc nợ thất bại." });
    }
  } catch (error) {
    console.error("Lỗi gửi nhắc nợ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi gửi nhắc nợ." });
  }
});

router.get('/api/reports/pdf', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { type, branch, period = '2026' } = req.query;
    if (!type) {
      return res.status(400).json({ message: "Thiếu loại báo cáo (type)." });
    }

    let subtitle = '';
    if (branch && mongoose.Types.ObjectId.isValid(branch)) {
      const prop = await Property.findById(branch);
      if (prop) subtitle += `Cơ sở: ${prop.tenNhaTro} | `;
    } else {
      subtitle += 'Tất cả chi nhánh | ';
    }
    subtitle += `Kỳ thống kê: ${period === '12 tháng gần nhất' ? '12 tháng gần nhất' : 'Năm ' + period}`;

    if (type === 'revenue') {
      const roomFilter = {};
      if (branch && mongoose.Types.ObjectId.isValid(branch)) roomFilter.maNhaTroId = branch;

      const invoicesQuery = { trangThai: 'paid' };
      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        const roomIds = await Room.find(roomFilter).distinct('_id');
        invoicesQuery.maPhongId = { $in: roomIds };
      }
      const invoices = await Invoice.find(invoicesQuery).lean();
      
      const pendingQuery = { trangThai: { $in: ['pending', 'overdue'] } };
      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        const roomIds = await Room.find(roomFilter).distinct('_id');
        pendingQuery.maPhongId = { $in: roomIds };
      }
      const pendingInvoices = await Invoice.find(pendingQuery).lean();

      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
        month: `Tháng ${i + 1}`,
        revenue: 0,
        debt: 0
      }));

      const filterYear = period === '2025' ? '2025' : '2026';

      for (const inv of invoices) {
        if (inv.kyThanhToan && inv.kyThanhToan.startsWith(filterYear)) {
          const monthIndex = parseInt(inv.kyThanhToan.split('-')[1]) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyRevenue[monthIndex].revenue += inv.tongTien;
          }
        }
      }

      for (const inv of pendingInvoices) {
        if (inv.kyThanhToan && inv.kyThanhToan.startsWith(filterYear)) {
          const monthIndex = parseInt(inv.kyThanhToan.split('-')[1]) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyRevenue[monthIndex].debt += inv.tongTien;
          }
        }
      }

      const columns = [
        { header: 'Tháng', key: 'month', width: 2 },
        { header: 'Doanh thu đã thu', key: 'revenueText', width: 5, align: 'right' },
        { header: 'Công nợ quá hạn', key: 'debtText', width: 5, align: 'right' }
      ];

      const rows = monthlyRevenue.map(r => ({
        month: r.month,
        revenueText: pdfReportService.formatVnd(r.revenue),
        debtText: pdfReportService.formatVnd(r.debt),
        revenue: r.revenue,
        debt: r.debt
      }));

      const totalRevenue = monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
      const totalDebt = monthlyRevenue.reduce((s, r) => s + r.debt, 0);

      const summary = [
        { label: 'Tổng doanh thu đã thu:', value: pdfReportService.formatVnd(totalRevenue) },
        { label: 'Tổng công nợ quá hạn:', value: pdfReportService.formatVnd(totalDebt) }
      ];

      pdfReportService.streamReportPdf(res, {
        title: 'BÁO CÁO DOANH THU & CÔNG NỢ',
        subtitle,
        columns,
        rows,
        summary,
        filename: `Bao_Cao_Doanh_Thu_${period}.pdf`
      });

    } else if (type === 'occupancy') {
      const properties = await Property.find({ trangThai: 'active' }).lean();
      const rows = [];
      for (const p of properties) {
        const total = await Room.countDocuments({ maNhaTroId: p._id });
        const occupied = await Room.countDocuments({ maNhaTroId: p._id, trangThai: 'rented' });
        const empty = total - occupied;
        const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        rows.push({
          name: p.tenNhaTro,
          occupied: `${occupied} phòng`,
          empty: `${empty} phòng`,
          rateText: `${rate}%`,
          rate
        });
      }

      const columns = [
        { header: 'Cơ sở chi nhánh', key: 'name', width: 6 },
        { header: 'Phòng đã thuê', key: 'occupied', width: 2.5, align: 'center' },
        { header: 'Phòng trống', key: 'empty', width: 2.5, align: 'center' },
        { header: 'Tỷ lệ lấp đầy', key: 'rateText', width: 2.5, align: 'center' }
      ];

      const totalRooms = await Room.countDocuments();
      const totalOccupied = await Room.countDocuments({ trangThai: 'rented' });
      const avgRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

      const summary = [
        { label: 'Tổng số phòng toàn chuỗi:', value: `${totalRooms} phòng` },
        { label: 'Số phòng đã thuê:', value: `${totalOccupied} phòng` },
        { label: 'Tỷ lệ lấp đầy trung bình:', value: `${avgRate}%` }
      ];

      pdfReportService.streamReportPdf(res, {
        title: 'BÁO CÁO TỶ LỆ LẤP ĐẦY PHÒNG',
        subtitle,
        columns,
        rows,
        summary,
        filename: 'Bao_Cao_Lap_Day.pdf'
      });

    } else if (type === 'debt') {
      const filter = { trangThai: { $in: ['pending', 'overdue'] } };
      const invoices = await Invoice.find(filter)
        .populate({
          path: 'maHopDongId',
          populate: {
            path: 'maKhachThueIds',
            select: 'hoTen sdt email'
          }
        })
        .populate('maPhongId');

      let results = invoices;
      if (branch && mongoose.Types.ObjectId.isValid(branch)) {
        results = invoices.filter(inv => inv.maPhongId?.maNhaTroId?.toString() === branch);
      }

      const rows = results.map((inv, idx) => {
        const contract = inv.maHopDongId || {};
        const tenant = contract.maKhachThueIds?.[0] || {};
        const room = inv.maPhongId || {};
        const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(inv.hanThanhToan).getTime()) / (24 * 60 * 60 * 1000)));

        return {
          invoiceCode: inv.code || `HD-${inv._id.toString().substring(18).toUpperCase()}`,
          roomNumber: `Phòng ${room.soPhong || '?'}`,
          tenantName: tenant.hoTen || 'Chưa rõ',
          dueDateText: formatDate(inv.hanThanhToan),
          overdueText: `${daysOverdue} ngày`,
          amountText: pdfReportService.formatVnd(inv.tongTien),
          amount: inv.tongTien
        };
      });

      const columns = [
        { header: 'Mã HĐ', key: 'invoiceCode', width: 2 },
        { header: 'Phòng', key: 'roomNumber', width: 1.5, align: 'center' },
        { header: 'Khách thuê', key: 'tenantName', width: 3 },
        { header: 'Hạn thanh toán', key: 'dueDateText', width: 2.5, align: 'center' },
        { header: 'Quá hạn', key: 'overdueText', width: 2, align: 'center' },
        { header: 'Số tiền nợ', key: 'amountText', width: 2.5, align: 'right' }
      ];

      const totalDebt = results.reduce((s, r) => s + r.tongTien, 0);
      const summary = [
        { label: 'Tổng số lượng hóa đơn nợ:', value: `${results.length} hóa đơn` },
        { label: 'Tổng cộng dư nợ quá hạn:', value: pdfReportService.formatVnd(totalDebt) }
      ];

      pdfReportService.streamReportPdf(res, {
        title: 'BÁO CÁO CÔNG NỢ CHI TIẾT',
        subtitle,
        columns,
        rows,
        summary,
        filename: 'Bao_Cao_Cong_No.pdf'
      });

    } else if (type === 'cost') {
      const expenseFilter = {};
      if (branch && mongoose.Types.ObjectId.isValid(branch)) expenseFilter.maNhaTroId = branch;

      const expenses = await Expense.find(expenseFilter).lean();
      const filterYear = period === '2025' ? 2025 : 2026;

      const monthlyExpenses = Array.from({ length: 12 }, (_, i) => ({
        month: `Tháng ${i + 1}`,
        expense: 0
      }));

      for (const exp of expenses) {
        const expDate = new Date(exp.ngayChi);
        if (expDate.getFullYear() === filterYear) {
          const monthIndex = expDate.getMonth();
          if (monthIndex >= 0 && monthIndex < 12) {
            monthlyExpenses[monthIndex].expense += exp.soTien;
          }
        }
      }

      const columns = [
        { header: 'Tháng', key: 'month', width: 3 },
        { header: 'Chi phí vận hành', key: 'expenseText', width: 7, align: 'right' }
      ];

      const rows = monthlyExpenses.map(r => ({
        month: r.month,
        expenseText: pdfReportService.formatVnd(r.expense),
        expense: r.expense
      }));

      const totalExpenses = monthlyExpenses.reduce((s, r) => s + r.expense, 0);
      const summary = [
        { label: 'Tổng chi phí vận hành:', value: pdfReportService.formatVnd(totalExpenses) }
      ];

      pdfReportService.streamReportPdf(res, {
        title: 'BÁO CÁO CHI PHÍ VẬN HÀNH',
        subtitle,
        columns,
        rows,
        summary,
        filename: `Bao_Cao_Chi_Phi_${period}.pdf`
      });
    } else {
      res.status(400).json({ message: "Loại báo cáo không hợp lệ." });
    }
  } catch (error) {
    console.error("Lỗi xuất PDF báo cáo:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi xuất PDF báo cáo." });
  }
});



export default router;
