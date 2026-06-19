import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

// Bắt buộc sử dụng DNS của Google để tránh lỗi phân giải DNS SRV của MongoDB Atlas trên Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { connectDB } from './db.js';
import { Contract } from './models/Contract.js';
import { Invoice } from './models/Invoice.js';
import { Property } from './models/Property.js';
import { Expense } from './models/Expense.js';

// Import các Router đã tách lẻ
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import roomRoutes, { releaseExpiredDeposits } from './routes/roomRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import roomTypeRoutes from './routes/roomTypeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://boardinghouse.systems',
    'https://www.boardinghouse.systems'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Gắn các routers vào app
app.use('/', authRoutes);
app.use('/', propertyRoutes);
app.use('/', roomRoutes);
app.use('/', contractRoutes);
app.use('/', invoiceRoutes);
app.use('/', paymentRoutes);
app.use('/', notificationRoutes);
app.use('/', userRoutes);
app.use('/', serviceRoutes);
app.use('/', readingRoutes);
app.use('/', reportRoutes);
app.use('/', expenseRoutes);
app.use('/', roomTypeRoutes);
app.use('/', chatRoutes);

// TỰ ĐỘNG HÓA SINH HÓA ĐƠN ĐỊNH KỲ HÀNG THÁNG (UC25)
async function autoGenerateInvoicesForActiveContracts() {
  try {
    const today = new Date();
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    console.log(`[Cron Job] Bắt đầu tự động quét & sinh hóa đơn cho kỳ: ${period}`);
    
    const activeContracts = await Contract.find({ trangThai: 'active' })
      .populate('maPhongId')
      .populate('maKhachThueIds');
      
    let count = 0;
    for (const contract of activeContracts) {
      const room = contract.maPhongId;
      if (!room) continue;
      
      // Kiểm tra xem kỳ này đã có hóa đơn chưa
      const existing = await Invoice.findOne({
        maPhongId: room._id,
        kyThanhToan: period
      });
      
      if (existing) continue;
      
      // Tự động sinh hóa đơn mới
      const monthlyRent = room.giaThueHienTai || room.giaThue || 3000000;
      const code = `INV-${room.soPhong}-${period.replace('-', '')}-${Math.floor(100 + Math.random() * 900)}`;
      
      // Hạn thanh toán là ngày 5 hàng tháng
      const dueDate = new Date(today.getFullYear(), today.getMonth(), 5);
      
      await Invoice.create({
        maHopDongId: contract._id,
        maPhongId: room._id,
        kyThanhToan: period,
        hanThanhToan: dueDate,
        tongTien: monthlyRent,
        trangThai: 'pending',
        code: code,
        chiTiet: [
          { tenDichVu: 'Tiền thuê phòng cố định', donGia: monthlyRent, soLuong: 1, thanhTien: monthlyRent, donVi: 'tháng' }
        ]
      });
      count++;
    }
    console.log(`[Cron Job] Đã tự động sinh thành công ${count} hóa đơn mới cho kỳ: ${period}`);
  } catch (error) {
    console.error("[Cron Job Error] Lỗi tự động sinh hóa đơn:", error.message);
  }
}

// TỰ ĐỘNG KHỞI TẠO CHI PHÍ MẪU CHO BÁO CÁO (UC34)
async function autoSeedExpenses() {
  try {
    const count = await Expense.countDocuments();
    if (count > 0) return;
    
    console.log("[Database] Khởi tạo dữ liệu chi phí mẫu cho báo cáo (UC34)...");
    const firstProperty = await Property.findOne();
    if (!firstProperty) {
      console.log("[Database] Không tìm thấy nhà trọ nào để liên kết chi phí.");
      return;
    }
    
    const categories = ['sua_chua', 'bao_tri', 'dien_nuoc_chung', 'dich_vu_ngoai', 'khac'];
    const names = [
      'Thay máy bơm nước lầu 2',
      'Bảo trì thang máy định kỳ',
      'Tiền điện chiếu sáng hành lang',
      'Dịch vụ gom rác & vệ sinh chung',
      'Mua bóng đèn thay hành lang'
    ];
    const amounts = [1500000, 800000, 2300000, 1200000, 300000];
    
    const mockExpenses = [];
    for (let month = 0; month < 5; month++) {
      for (let i = 0; i < 3; i++) {
        const catIndex = (month + i) % categories.length;
        mockExpenses.push({
          maNhaTroId: firstProperty._id,
          tenChiPhi: names[catIndex] + ` (Tháng ${month + 1})`,
          soTien: amounts[catIndex] + Math.floor(Math.random() * 200000),
          danhMuc: categories[catIndex],
          ngayChi: new Date(2026, month, 15),
          ghiChu: 'Dữ liệu mẫu tự động khởi tạo khi hệ thống bắt đầu.'
        });
      }
    }
    
    await Expense.insertMany(mockExpenses);
    console.log(`[Database] Đã khởi tạo thành công ${mockExpenses.length} bản ghi chi phí cho nhà trọ: ${firstProperty.tenNhaTro}`);
  } catch (error) {
    console.error("[Database Error] Lỗi khởi tạo chi phí:", error.message);
  }
}

// Chạy quét khi server khởi động và lặp lại sau mỗi 24 giờ / 10 phút
setTimeout(async () => {
  await autoSeedExpenses();
  autoGenerateInvoicesForActiveContracts();
  await releaseExpiredDeposits().catch(err => console.error(err));
}, 5000); // Sau 5 giây
setInterval(autoGenerateInvoicesForActiveContracts, 24 * 60 * 60 * 1000); // Lặp lại mỗi 24 giờ
setInterval(() => {
  releaseExpiredDeposits().catch(err => console.error(err));
}, 10 * 60 * 1000); // Mỗi 10 phút quét 1 lần


// Khởi chạy Server
const server = app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

connectDB().catch(err => {
  console.error("Warning: Failed to connect to MongoDB Atlas:", err.message);
  console.error("Please ensure your public IP is whitelisted on MongoDB Atlas.");
});
export default app;
