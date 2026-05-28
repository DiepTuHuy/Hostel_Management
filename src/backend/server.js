import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';

// Bắt buộc sử dụng DNS của Google để tránh lỗi phân giải DNS SRV của MongoDB Atlas trên Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { connectDB } from './db.js';
import { User } from './models/User.js';
import { Property } from './models/Property.js';
import { Room } from './models/Room.js';
import { Contract } from './models/Contract.js';
import { Invoice } from './models/Invoice.js';
import { Payment } from './models/Payment.js';
import { Notification } from './models/Notification.js';
import { RoomType } from './models/RoomType.js';
import { Service } from './models/Service.js';
import { Reading } from './models/Reading.js';
import { emailService } from './services/emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Helper mapping functions
function mapDocument(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : undefined;
  
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === 'object') {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => {
          if (item && item._id) {
            item.id = item._id.toString();
          }
          return item;
        });
      } else if (obj[key]._id) {
        obj[key].id = obj[key]._id.toString();
      }
    }
  }
  return obj;
}

function mapRoom(roomDoc) {
  if (!roomDoc) return null;
  const room = roomDoc.toObject ? roomDoc.toObject() : roomDoc;
  const roomType = room.maLoaiPhongId || {};
  
  let type = 'private';
  if (roomType.tenLoai) {
    const nameLower = roomType.tenLoai.toLowerCase();
    if (nameLower.includes('studio') || nameLower.includes('đôi') || nameLower.includes('vip') || nameLower.includes('penthouse') || nameLower.includes('cao cấp')) {
      type = 'studio';
    } else if (nameLower.includes('ký túc xá') || nameLower.includes('shared') || nameLower.includes('ghép')) {
      type = 'shared';
    }
  }

  return {
    id: room._id.toString(),
    code: room.soPhong || room.maPhong,
    propertyId: room.maNhaTroId ? room.maNhaTroId.toString() : undefined,
    floor: room.tang,
    type: type,
    area: room.dienTich || roomType.dienTich || 0,
    price: room.giaThue || room.giaThueHienTai || roomType.giaCoBan || 0,
    amenities: roomType.tienNghi || [],
    status: room.trangThai,
    currentTenantId: room.currentTenantId ? room.currentTenantId.toString() : null,
    photos: room.hinhAnh || [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
    ],
    description: room.moTa || `Phòng sạch sẽ, thoáng mát tại ${roomType.tenLoai || 'nhà trọ'}. Đầy đủ tiện nghi cơ bản.`,
    roomNumber: room.soPhong,
    roomTypeId: room.maLoaiPhongId?._id || room.maLoaiPhongId
  };
}

function mapContract(contractDoc) {
  if (!contractDoc) return null;
  const contract = contractDoc.toObject ? contractDoc.toObject() : contractDoc;
  const room = contract.maPhongId || {};
  const tenant = contract.maKhachThueIds?.[0] || {};
  
  return {
    id: contract._id.toString(),
    code: contract.code || `HD-${contract._id.toString().substring(18).toUpperCase()}`,
    propertyId: room.maNhaTroId ? (room.maNhaTroId._id?.toString() || room.maNhaTroId.toString()) : undefined,
    roomId: room.soPhong || room.maPhong || (room._id ? room._id.toString() : (contract.maPhongId ? contract.maPhongId.toString() : undefined)),
    tenantId: tenant.hoTen || (tenant._id ? tenant._id.toString() : (contract.maKhachThueIds?.[0] ? contract.maKhachThueIds[0].toString() : undefined)),
    tenantIds: contract.maKhachThueIds ? contract.maKhachThueIds.map(t => t._id?.toString() || t.toString()) : [],
    startDate: contract.ngayBatDau,
    endDate: contract.ngayKetThuc,
    deposit: contract.tienCoc,
    monthlyRent: room.giaThue || room.giaThueHienTai || 3500000,
    services: [
      { name: "Điện", price: 3500, unit: "kWh" },
      { name: "Nước", price: 15000, unit: "m3" },
      { name: "Internet", price: 100000, unit: "phòng" }
    ],
    status: contract.trangThai,
    pdfUrl: contract.duongDanPdf || null,
    createdAt: contract.createdAt
  };
}

function mapInvoice(invoiceDoc) {
  if (!invoiceDoc) return null;
  const invoice = invoiceDoc.toObject ? invoiceDoc.toObject() : invoiceDoc;
  const room = invoice.maPhongId || {};
  const contract = invoice.maHopDongId || {};
  const tenant = contract.maKhachThueIds?.[0] || {};
  
  return {
    id: invoice._id.toString(),
    code: invoice.code || `HD-${invoice._id.toString().substring(18).toUpperCase()}`,
    contractId: invoice.maHopDongId?._id ? invoice.maHopDongId._id.toString() : (invoice.maHopDongId ? invoice.maHopDongId.toString() : undefined),
    propertyId: room.maNhaTroId ? (room.maNhaTroId._id?.toString() || room.maNhaTroId.toString()) : undefined,
    roomId: room.soPhong || room.maPhong || (room._id ? room._id.toString() : (invoice.maPhongId ? invoice.maPhongId.toString() : undefined)),
    tenantId: tenant.hoTen || (tenant._id ? tenant._id.toString() : (contract.maKhachThueIds?.[0] ? contract.maKhachThueIds[0].toString() : undefined)),
    period: invoice.kyThanhToan,
    dueDate: invoice.hanThanhToan,
    deadline: invoice.hanThanhToan,
    items: (invoice.chiTiet || []).map(d => ({
      name: d.tenDichVu,
      qty: d.soLuong || 1,
      unit: d.donVi || 'phần',
      price: d.donGia,
      total: d.thanhTien || (d.donGia * (d.soLuong || 1))
    })),
    details: (invoice.chiTiet || []).map(d => ({
      name: d.tenDichVu,
      quantity: d.soLuong,
      price: d.donGia,
      amount: d.thanhTien
    })),
    subtotal: invoice.tongTien,
    total: invoice.tongTien,
    totalAmount: invoice.tongTien,
    status: invoice.trangThai,
    paidAt: invoice.updatedAt,
    paymentMethod: invoice.paymentMethod || null,
    receiptUrl: invoice.receiptUrl || null,
    meterReadings: invoice.meterReadings || null
  };
}

function mapNotification(notifDoc) {
  if (!notifDoc) return null;
  const n = notifDoc.toObject ? notifDoc.toObject() : notifDoc;
  return {
    id: n._id.toString(),
    userId: n.maNguoiDungId ? n.maNguoiDungId.toString() : undefined,
    title: n.tieuDe,
    body: n.noiDung,
    content: n.noiDung,
    channel: n.kenh,
    read: n.daDoc,
    isRead: n.daDoc,
    createdAt: n.createdAt
  };
}

function mapUser(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    id: u._id.toString(),
    fullName: u.hoTen,
    email: u.email,
    phone: u.sdt,
    role: u.vaiTro,
    avatar: u.avatar || null,
    status: u.trangThai,
    propertyIds: u.maNhaTroIds ? u.maNhaTroIds.map(p => p.toString()) : [],
    createdAt: u.createdAt
  };
}

// API Routes

// 1. Đăng ký tài khoản (Trực tiếp lưu tài khoản mới vào database MongoDB Atlas)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, role, tenantProfile } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin bắt buộc (họ tên, email, mật khẩu, số điện thoại)." });
    }

    const emailLower = email.toLowerCase();

    // Kiểm tra xem email đã được đăng ký chưa
    const existingUser = await User.findOne({ email: emailLower });
    
    if (existingUser) {
      if (existingUser.trangThai === 'active') {
        return res.status(400).json({ message: "Email này đã tồn tại và đã được kích hoạt trong hệ thống." });
      }
      
      // Nếu tài khoản đang ở trạng thái pending (chưa xác thực), chúng ta sẽ cho phép gửi lại mã OTP mới và cập nhật thông tin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // hết hạn trong 5 phút

      existingUser.hoTen = fullName;
      existingUser.matKhau = hashedPassword;
      existingUser.sdt = phone;
      existingUser.vaiTro = role || 'tenant';
      existingUser.thongTinKhachThue = role === 'tenant' ? {
        cccd: tenantProfile?.cccd,
        ngheNghiep: tenantProfile?.occupation,
        diaChiThuongTru: tenantProfile?.permanentAddress
      } : undefined;
      existingUser.otp = { maOtp: otpCode, hanSuDung: otpExpires };
      
      await existingUser.save();

      console.log(`[Database] Gửi lại mã OTP đăng ký mới cho tài khoản pending: ${emailLower} - OTP: ${otpCode}`);
      const emailSent = await emailService.sendOtpEmail(emailLower, fullName, otpCode);

      return res.status(200).json({
        message: emailSent
          ? "Mã OTP mới đã được gửi tới email của bạn. Vui lòng xác thực tài khoản."
          : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP mới của bạn là: ${otpCode}`,
        status: "pending",
        email: emailLower
      });
    }

    // Mã hoá mật khẩu bảo mật bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sinh mã OTP 6 chữ số ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // hết hạn trong 5 phút

    // Tạo user mới với trạng thái pending
    const newUser = await User.create({
      hoTen: fullName,
      email: emailLower,
      matKhau: hashedPassword,
      sdt: phone,
      vaiTro: role || 'tenant',
      trangThai: 'pending',
      thongTinKhachThue: role === 'tenant' ? {
        cccd: tenantProfile?.cccd,
        ngheNghiep: tenantProfile?.occupation,
        diaChiThuongTru: tenantProfile?.permanentAddress
      } : undefined,
      otp: { maOtp: otpCode, hanSuDung: otpExpires }
    });

    console.log(`[Database] Đăng ký tài khoản pending mới thành công: ${emailLower} - OTP: ${otpCode}`);
    
    // Gửi email thật
    const emailSent = await emailService.sendOtpEmail(emailLower, fullName, otpCode);

    res.status(201).json({
      message: emailSent
        ? "Mã OTP xác thực đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư!"
        : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP của bạn là: ${otpCode}`,
      status: "pending",
      email: emailLower
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký tài khoản." });
  }
});

// 1.1. Xác thực OTP đăng ký tài khoản
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ email và mã OTP." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    if (user.trangThai === 'active') {
      return res.status(400).json({ message: "Tài khoản đã được kích hoạt từ trước." });
    }

    if (!user.otp || !user.otp.maOtp) {
      return res.status(400).json({ message: "Không tìm thấy mã OTP nào đang chờ xác thực." });
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.otp.hanSuDung)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn (hiệu lực trong 5 phút). Vui lòng yêu cầu gửi lại mã mới." });
    }

    // Kiểm tra mã OTP khớp
    if (user.otp.maOtp !== otp.trim()) {
      return res.status(400).json({ message: "Mã OTP nhập vào không chính xác. Vui lòng kiểm tra lại." });
    }

    // Kích hoạt tài khoản thành công
    user.trangThai = 'active';
    user.otp = { maOtp: undefined, hanSuDung: undefined };
    await user.save();

    console.log(`[Database] Xác thực OTP thành công, kích hoạt tài khoản: ${emailLower}`);

    // Tạo token giả lập phiên làm việc giống login
    const token = `jwt.${user._id}.${Date.now()}`;

    res.status(200).json({
      message: "Kích hoạt tài khoản thành công!",
      token,
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi xác thực OTP." });
  }
});

// 1.2. Gửi lại mã OTP
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ email." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản nào đang chờ xác thực." });
    }

    if (user.trangThai === 'active') {
      return res.status(400).json({ message: "Tài khoản này đã được kích hoạt rồi." });
    }

    // Sinh mã OTP mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = { maOtp: otpCode, hanSuDung: otpExpires };
    await user.save();

    console.log(`[Database] Đã gửi lại mã OTP mới cho tài khoản: ${emailLower} - OTP mới: ${otpCode}`);

    // Gửi email thật
    const emailSent = await emailService.sendOtpEmail(emailLower, user.hoTen, otpCode);

    res.status(200).json({
      message: emailSent
        ? "Gửi lại mã OTP thành công! Vui lòng kiểm tra hòm thư email của bạn."
        : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP mới của bạn là: ${otpCode}`
    });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi gửi lại OTP." });
  }
});

// 1.3. Yêu cầu gửi OTP quên mật khẩu (dành riêng cho khách thuê - tenant)
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp địa chỉ email." });
    }

    const emailLower = email.toLowerCase();
    // Tìm user theo email, phải là active và có vai trò tenant
    const user = await User.findOne({ email: emailLower, vaiTro: 'tenant' });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản khách thuê nào đã kích hoạt với email này." });
    }

    if (user.trangThai !== 'active') {
      return res.status(400).json({ message: "Tài khoản khách thuê này chưa được kích hoạt xác thực." });
    }

    // Sinh mã OTP khôi phục mật khẩu mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = { maOtp: otpCode, hanSuDung: otpExpires };
    await user.save();

    console.log(`[Database] Đã gửi mã OTP quên mật khẩu cho tài khoản: ${emailLower} - OTP: ${otpCode}`);

    // Gửi email khôi phục
    const emailSent = await emailService.sendForgotPasswordOtpEmail(emailLower, user.hoTen, otpCode);

    res.status(200).json({
      message: emailSent
        ? "Mã OTP khôi phục mật khẩu đã được gửi thành công đến email của bạn!"
        : `[CHẾ ĐỘ THỬ NGHIỆM] Gửi email thất bại. Mã OTP khôi phục của bạn là: ${otpCode}`
    });
  } catch (error) {
    console.error("Lỗi yêu cầu OTP quên mật khẩu:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi yêu cầu quên mật khẩu." });
  }
});

// 1.4. Xác thực OTP quên mật khẩu và đặt lại mật khẩu mới
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin (email, mã OTP, mật khẩu mới)." });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower, vaiTro: 'tenant' });

    if (!user) {
      return res.status(404).json({ message: "Tài khoản khách thuê không tồn tại." });
    }

    if (!user.otp || !user.otp.maOtp) {
      return res.status(400).json({ message: "Không tìm thấy phiên yêu cầu OTP khôi phục mật khẩu." });
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.otp.hanSuDung)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng yêu cầu lại mã mới." });
    }

    // Kiểm tra mã OTP khớp
    if (user.otp.maOtp !== otp.trim()) {
      return res.status(400).json({ message: "Mã OTP nhập vào không chính xác. Vui lòng kiểm tra lại." });
    }

    // Hash mật khẩu mới bằng bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Lưu mật khẩu mới và xóa OTP
    user.matKhau = hashedPassword;
    user.otp = { maOtp: undefined, hanSuDung: undefined };
    await user.save();

    console.log(`[Database] Đặt lại mật khẩu thành công cho tài khoản khách thuê: ${emailLower}`);

    res.status(200).json({
      message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới."
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi khôi phục mật khẩu." });
  }
});

// 2. Đăng nhập (Kiểm tra tài khoản từ database MongoDB Atlas)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại." });
    }

    // So khớp mật khẩu đã băm
    const isMatch = await bcrypt.compare(password, user.matKhau);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác." });
    }

    // Tạo mã token mô phỏng phiên đăng nhập
    const token = `jwt.${user._id}.${Date.now()}`;

    console.log(`[Database] Người dùng đăng nhập thành công: ${email} (${user.vaiTro})`);
    res.json({
      token,
      user: mapUser(user)
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
  }
});

// 3. Lấy danh sách các cơ sở nhà trọ (220 cơ sở đã seed ở TP.HCM)
app.get('/api/properties', async (req, res) => {
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
        status: p.trangThai
      };
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách cơ sở:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 3.1. Lấy chi tiết cơ sở nhà trọ
app.get('/api/properties/:id', async (req, res) => {
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
      status: p.trangThai
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết cơ sở:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 4. Lấy danh sách phòng
app.get('/api/rooms', async (req, res) => {
  try {
    const { propertyId, status } = req.query;
    const filter = {};
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      filter.maNhaTroId = propertyId;
    }
    if (status) filter.trangThai = status;

    const rooms = await Room.find(filter).populate('maLoaiPhongId');
    res.json(rooms.map(mapRoom));
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 4.1. Tìm kiếm phòng nâng cao (cho visitor)
app.get('/api/rooms/search', async (req, res) => {
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
app.get('/api/rooms/:id', async (req, res) => {
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
app.get('/api/contracts', async (req, res) => {
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
app.get('/api/contracts/:id', async (req, res) => {
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
app.get('/api/invoices', async (req, res) => {
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
app.get('/api/invoices/:id', async (req, res) => {
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
app.post('/api/invoices/:id/pay', async (req, res) => {
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

    invoice.trangThai = 'paid';
    await invoice.save();

    await Payment.create({
      maHoaDonId: invoice._id,
      phuongThuc: method || 'vnpay',
      soTien: invoice.tongTien,
      trangThai: 'success'
    });

    res.json({ success: true, message: "Thanh toán hoá đơn thành công!", status: 'paid' });
  } catch (error) {
    console.error("Lỗi thanh toán hoá đơn:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 7. Lấy danh sách thông báo
app.get('/api/notifications', async (req, res) => {
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

// 8. Lấy danh sách người dùng
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.vaiTro = role;

    const users = await User.find(filter);
    res.json(users.map(mapUser));
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// 8.1. Lấy chi tiết người dùng
app.get('/api/users/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });
    res.json(mapUser(user));
  } catch (error) {
    console.error("Lỗi lấy chi tiết người dùng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// ==========================================
// BỔ SUNG CÁC API CRUD & THỐNG KÊ NGHIỆP VỤ
// ==========================================

// A. USER PROFILE & ADMIN OPERATIONS
// A.1 Cập nhật thông tin profile khách thuê
app.put('/api/users/:id', async (req, res) => {
  try {
    const { fullName, phone, tenantProfile } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    if (fullName) user.hoTen = fullName;
    if (phone) user.sdt = phone;
    if (tenantProfile) {
      user.thongTinKhachThue = {
        cccd: tenantProfile.cccd || user.thongTinKhachThue?.cccd,
        ngheNghiep: tenantProfile.occupation || tenantProfile.ngheNghiep || user.thongTinKhachThue?.ngheNghiep,
        diaChiThuongTru: tenantProfile.permanentAddress || tenantProfile.diaChiThuongTru || user.thongTinKhachThue?.diaChiThuongTru
      };
    }
    await user.save();
    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ." });
  }
});

// A.2 Khóa/Mở khóa tài khoản người dùng
app.patch('/api/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

    user.trangThai = status;
    await user.save();
    res.json({ success: true, user: mapUser(user) });
  } catch (error) {
    console.error("Lỗi đổi trạng thái tài khoản:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// B. CRUD PROPERTIES (NHÀ TRỌ)
// B.1 Thêm cơ sở nhà trọ mới
app.post('/api/properties', async (req, res) => {
  try {
    const { name, address, district, city, totalRooms, phone, email, managerIds } = req.body;
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
      trangThai: 'active'
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
      status: p.trangThai
    });
  } catch (error) {
    console.error("Lỗi tạo cơ sở nhà trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo nhà trọ." });
  }
});

// B.2 Cập nhật cơ sở nhà trọ
app.put('/api/properties/:id', async (req, res) => {
  try {
    const { name, address, district, city, totalRooms, occupiedRooms, managerIds, status } = req.body;
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
      status: p.trangThai
    });
  } catch (error) {
    console.error("Lỗi cập nhật nhà trọ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa nhà trọ." });
  }
});

// B.3 Xóa/Ngừng hoạt động nhà trọ
app.delete('/api/properties/:id', async (req, res) => {
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
app.post('/api/rooms', async (req, res) => {
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
app.put('/api/rooms/:id', async (req, res) => {
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
app.delete('/api/rooms/:id', async (req, res) => {
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
app.patch('/api/rooms/:id/status', async (req, res) => {
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
app.post('/api/rooms/:id/deposit', async (req, res) => {
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
app.post('/api/contracts', async (req, res) => {
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
      trangThai: 'active',
      duongDanPdf: `https://boardinghouse.vn/contracts/${code}.pdf`
    });

    room.trangThai = 'rented';
    await room.save();

    await Property.findByIdAndUpdate(room.maNhaTroId, { $inc: { soPhongDaThue: 1 } });

    const populated = await Contract.findById(contract._id).populate('maPhongId').populate('maKhachThueIds');
    res.status(201).json(mapContract(populated));
  } catch (error) {
    console.error("Lỗi lập hợp đồng:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi lập hợp đồng." });
  }
});

// D.2 Chấm dứt hợp đồng sớm
app.patch('/api/contracts/:id/terminate', async (req, res) => {
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
app.patch('/api/contracts/:id/extend', async (req, res) => {
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
app.get('/api/services', async (req, res) => {
  try {
    const { propertyId } = req.query;
    const filter = {};
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) return res.json([]);
      filter.maNhaTroId = propertyId;
    }
    const services = await Service.find(filter).lean();
    res.json(services.map(s => ({
      id: s._id.toString(),
      propertyId: s.maNhaTroId ? s.maNhaTroId.toString() : undefined,
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    })));
  } catch (error) {
    console.error("Lỗi lấy danh sách dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// E.2 Tạo dịch vụ mới
app.post('/api/services', async (req, res) => {
  try {
    const { propertyId, name, unit, price, type } = req.body;
    if (!propertyId || !name || !unit || price === undefined || !type) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin dịch vụ." });
    }

    const s = await Service.create({
      maNhaTroId: propertyId,
      tenDichVu: name,
      donVi: unit,
      donGia: Number(price),
      loaiTinh: type
    });

    res.status(201).json({
      id: s._id.toString(),
      propertyId: s.maNhaTroId.toString(),
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    });
  } catch (error) {
    console.error("Lỗi tạo dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo dịch vụ." });
  }
});

// E.3 Cập nhật dịch vụ
app.put('/api/services/:id', async (req, res) => {
  try {
    const { name, unit, price, type } = req.body;
    const s = await Service.findById(req.params.id);
    if (!s) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });

    if (name) s.tenDichVu = name;
    if (unit) s.donVi = unit;
    if (price !== undefined) s.donGia = Number(price);
    if (type) s.loaiTinh = type;

    await s.save();
    res.json({
      id: s._id.toString(),
      propertyId: s.maNhaTroId.toString(),
      name: s.tenDichVu,
      unit: s.donVi,
      price: s.donGia,
      type: s.loaiTinh
    });
  } catch (error) {
    console.error("Lỗi sửa dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống khi sửa dịch vụ." });
  }
});

// E.4 Xóa cấu hình dịch vụ
app.delete('/api/services/:id', async (req, res) => {
  try {
    const s = await Service.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ message: "Không tìm thấy dịch vụ." });
    res.json({ success: true, message: "Xóa dịch vụ thành công." });
  } catch (error) {
    console.error("Lỗi xóa dịch vụ:", error.message);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// F. READINGS (GHI CHỈ SỐ ĐIỆN NƯỚC)
// F.1 Lấy chỉ số điện nước theo phòng
app.get('/api/readings', async (req, res) => {
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
app.post('/api/readings', async (req, res) => {
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
app.post('/api/invoices/generate', async (req, res) => {
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
app.post('/api/invoices/:id/pay-cash', async (req, res) => {
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
app.post('/api/invoices/:id/reject-cash', async (req, res) => {
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
app.get('/api/reports/dashboard', async (req, res) => {
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
app.get('/api/reports/revenue', async (req, res) => {
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

// H.3 Tỷ lệ lấp đầy từng cơ sở
app.get('/api/reports/occupancy', async (req, res) => {
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
app.get('/api/reports/debts', async (req, res) => {
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

// Hàm lấy dữ liệu chi tiết thực tế của toàn bộ hệ thống từ MongoDB theo thời gian thực
async function getDetailedSystemContext() {
  try {
    // 1. Lấy toàn bộ chi nhánh nhà trọ
    const properties = await Property.find({}, 'tenNhaTro maNhaTro diaChi quanHuyen tongSoPhong soPhongDaThue');
    
    // 2. Lấy toàn bộ đơn giá dịch vụ
    const services = await Service.find({}, 'maNhaTroId tenDichVu donGia donVi loaiTinh');
    
    // 3. Lấy toàn bộ khách thuê
    const tenants = await User.find({ vaiTro: 'tenant' }, 'hoTen email sdt thongTinKhachThue trangThai');
    
    // 4. Lấy các phòng không trống và các phòng ở cơ sở Q1, Q3 chính để tránh nạp quá nhiều
    const q1q3PropIds = properties.filter(p => p.maNhaTro === 'NT-Q1-01' || p.maNhaTro === 'NT-Q3-01').map(p => p._id);
    const rooms = await Room.find({
      $or: [
        { trangThai: { $ne: 'empty' } },
        { maNhaTroId: { $in: q1q3PropIds } }
      ]
    }).populate('maLoaiPhongId');
    
    // 5. Lấy danh sách hợp đồng
    const contracts = await Contract.find()
      .populate('maPhongId')
      .populate('maKhachThueIds');
      
    // 6. Lấy các hóa đơn mới nhất
    const invoices = await Invoice.find()
      .populate('maPhongId')
      .sort({ createdAt: -1 })
      .limit(30);

    // Map ID nhà trọ -> Tên nhà trọ để định vị nhanh
    const propMap = {};
    properties.forEach(p => {
      propMap[p._id.toString()] = p.tenNhaTro;
    });

    let context = `\n[DỮ LIỆU THỰC TẾ HỆ THỐNG TRONG DATABASE]:\n`;
    
    // Chi nhánh
    context += `1. DANH SÁCH CHI NHÁNH NHÀ TRỌ (PROPERTIES) & DỊCH VỤ:\n`;
    properties.forEach(p => {
      const propServices = services.filter(s => s.maNhaTroId && s.maNhaTroId.toString() === p._id.toString());
      const serviceStr = propServices.map(s => `${s.tenDichVu}: ${s.donGia.toLocaleString('vi-VN')}đ/${s.donVi}`).join(', ');
      
      context += `- Chi nhánh: **${p.tenNhaTro}** (Mã: **${p.maNhaTro}**)
  Địa chỉ: ${p.diaChi}, ${p.quanHuyen}
  Số lượng phòng: ${p.tongSoPhong} phòng (Đã thuê: ${p.soPhongDaThue}, Trống: ${p.tongSoPhong - p.soPhongDaThue})
  Đơn giá dịch vụ: ${serviceStr || 'Chưa thiết lập'}\n`;
    });

    // Khách thuê
    context += `\n2. DANH SÁCH KHÁCH THUÊ (TENANTS):\n`;
    tenants.forEach(t => {
      const info = t.thongTinKhachThue || {};
      context += `- Khách thuê: **${t.hoTen}** (Email: ${t.email}, SĐT: **${t.sdt}**)
  CCCD: ${info.cccd || 'Chưa cập nhật'}, Nghề nghiệp: ${info.ngheNghiep || 'Chưa rõ'}
  Địa chỉ thường trú: ${info.diaChiThuongTru || 'Chưa rõ'}
  Trạng thái tài khoản: ${t.trangThai}\n`;
    });

    // Phòng chi tiết
    context += `\n3. TRẠNG THÁI PHÒNG TRỌ CHI TIẾT (ROOMS):\n`;
    rooms.forEach(r => {
      const propName = propMap[r.maNhaTroId?.toString()] || 'Không rõ chi nhánh';
      const typeName = r.maLoaiPhongId?.tenLoai || 'Standard';
      const assets = (r.taiSan || []).map(a => `${a.tenTaiSan} (${a.tinhTrang})`).join(', ');
      
      context += `- Phòng **${r.soPhong}** tại **${propName}** (Mã phòng: **${r.maPhong}**)
  Loại phòng: ${typeName}, Diện tích: ${r.dienTich} m2
  Giá thuê: **${r.giaThue.toLocaleString('vi-VN')}đ/tháng**
  Trạng thái: **${r.trangThai === 'rented' ? 'Đang thuê' : r.trangThai === 'deposit' ? 'Đã đặt cọc giữ phòng' : r.trangThai === 'maintenance' ? 'Đang bảo trì/sửa chữa' : 'Còn trống'}**
  Tài sản trong phòng: ${assets || 'Không có thiết bị đặc biệt'}\n`;
    });

    // Hợp đồng
    context += `\n4. DANH SÁCH HỢP ĐỒNG THUÊ PHÒNG (CONTRACTS):\n`;
    contracts.forEach(c => {
      const room = c.maPhongId || {};
      const tenantsList = (c.maKhachThueIds || []).map(t => t.hoTen).join(', ');
      const startDate = c.ngayBatDau ? new Date(c.ngayBatDau).toLocaleDateString('vi-VN') : 'Chưa rõ';
      const endDate = c.ngayKetThuc ? new Date(c.ngayKetThuc).toLocaleDateString('vi-VN') : 'Chưa rõ';
      
      context += `- Hợp đồng phòng **${room.soPhong || 'Chưa rõ'}**:
  Khách ký thuê: **${tenantsList || 'Chưa rõ'}**
  Thời gian: từ **${startDate}** đến **${endDate}**
  Tiền đặt cọc: **${c.tienCoc.toLocaleString('vi-VN')}đ**
  Trạng thái: **${c.trangThai === 'active' ? 'Đang hiệu lực (Active)' : c.trangThai === 'draft' ? 'Bản thảo/Chờ cọc (Draft)' : c.trangThai === 'terminated' ? 'Đã thanh lý/Kết thúc' : c.trangThai}**
  Tập tin PDF: ${c.duongDanPdf || 'Không có'}\n`;
    });

    // Hóa đơn
    context += `\n5. THÔNG TIN HÓA ĐƠN & CÔNG NỢ GẦN ĐÂY (INVOICES):\n`;
    invoices.forEach(inv => {
      const room = inv.maPhongId || {};
      const dueDate = inv.hanThanhToan ? new Date(inv.hanThanhToan).toLocaleDateString('vi-VN') : 'Chưa rõ';
      const statusMap = { 'pending': 'Chờ thanh toán', 'paid': 'Đã thanh toán', 'overdue': 'Quá hạn thanh toán' };
      
      context += `- Hóa đơn kỳ **${inv.kyThanhToan}** - Phòng **${room.soPhong || 'Chưa rõ'}**:
  Mã hóa đơn: **${inv.code || inv._id.toString()}**
  Tổng số tiền: **${inv.tongTien.toLocaleString('vi-VN')}đ**
  Hạn thanh toán: **${dueDate}**
  Trạng thái: **${statusMap[inv.trangThai] || inv.trangThai}**\n`;
    });

    context += `\n[Hướng dẫn nghiêm ngặt cho Trợ lý AI]:
1. Bạn phải dựa hoàn toàn vào [DỮ LIỆU THỰC TẾ HỆ THỐNG TRONG DATABASE] ở trên để trả lời ngay lập tức và chính xác khi người dùng hỏi các thông tin cụ thể (chứ không bảo người dùng tự đi xem hay kiểm tra).
2. Hãy đóng vai trò là một trợ lý ảo siêu việt, nắm lòng toàn bộ chuỗi nhà trọ BoardingHouse Pro, biết rõ ai đang ở đâu, tình hình thanh toán ra sao, các phòng trống cụ thể ở các cơ sở nào.
3. Nếu người dùng hỏi một thông tin không tồn tại trong danh sách trên, hãy trả lời lịch sự rằng bạn chưa tìm thấy bản ghi tương ứng trên hệ thống database.
4. ĐẶC BIỆT CHÚ Ý: Các từ khóa quan trọng (như tên khách, số phòng, giá thuê, ngày tháng, trạng thái) hãy bọc chúng trong cặp dấu sao kép \`**\` (ví dụ: \`**Phòng 101**\`, \`**Phạm Minh Đức**\`). Frontend của hệ thống đã được cấu hình tự động để gỡ bỏ ký tự \`**\` này và chuyển đổi màu chữ sang màu xanh thương hiệu (text-primary) vô cùng đẹp mắt thay vì in đậm truyền thống!`;

    return {
      properties,
      services,
      tenants,
      rooms,
      contracts,
      invoices,
      markdownText: context
    };
  } catch (error) {
    console.error("Lỗi lấy context chi tiết từ DB cho AI:", error.message);
    return { markdownText: "" };
  }
}

// Hàm sinh phản hồi ngoại tuyến thông minh dựa trên dữ liệu database thực tế khi Gemini API gặp sự cố
function getFallbackResponse(message, dbData) {
  const query = (message || '').toLowerCase();
  let introduction = `[Trợ lý Offline — Dữ liệu MongoDB thực tế]\n\n`;
  
  const properties = dbData.properties || [];
  const rooms = dbData.rooms || [];
  const tenants = dbData.tenants || [];
  const contracts = dbData.contracts || [];
  const invoices = dbData.invoices || [];

  // Tạo map ID nhà trọ -> Tên nhà trọ để định vị nhanh
  const propMap = {};
  properties.forEach(p => {
    propMap[p._id.toString()] = p.tenNhaTro;
  });

  // 1. Xử lý câu hỏi về phòng rẻ nhất
  if (query.includes('rẻ nhất') || query.includes('re nhat') || query.includes('thấp nhất') || query.includes('re nhat la bao nhieu')) {
    if (rooms.length > 0) {
      const activeRooms = rooms.filter(r => r.trangThai !== 'paused');
      const cheapest = [...activeRooms].sort((a, b) => a.giaThue - b.giaThue)[0];
      
      if (cheapest) {
        const propName = propMap[cheapest.maNhaTroId?.toString()] || 'Hệ thống';
        const statusMap = { 'rented': 'Đang thuê', 'deposit': 'Đã cọc giữ phòng', 'maintenance': 'Đang bảo trì', 'empty': 'Còn trống' };
        return `${introduction}Phòng trọ có giá thuê **rẻ nhất** trên hệ thống hiện tại là **Phòng ${cheapest.soPhong}** tại **${propName}**.
- Diện tích: **${cheapest.dienTich} m2**
- Giá thuê: **${cheapest.giaThue.toLocaleString('vi-VN')}đ/tháng**
- Trạng thái hiện tại: **${statusMap[cheapest.trangThai] || 'Còn trống'}**
- Tiện ích: Đầy đủ điều hòa nhiệt độ Daikin, công tơ điện tử, an ninh tốt.`;
      }
    }
  }

  // 2. Xử lý câu hỏi về phòng mắc nhất / đắt nhất
  if (query.includes('mắc nhất') || query.includes('mac nhat') || query.includes('đắt nhất') || query.includes('dat nhat') || query.includes('cao nhất') || query.includes('dat nhat la bao nhieu')) {
    if (rooms.length > 0) {
      const activeRooms = rooms.filter(r => r.trangThai !== 'paused');
      const mostExpensive = [...activeRooms].sort((a, b) => b.giaThue - a.giaThue)[0];
      
      if (mostExpensive) {
        const propName = propMap[mostExpensive.maNhaTroId?.toString()] || 'Hệ thống';
        const typeName = mostExpensive.maLoaiPhongId?.tenLoai || 'Penthouse cao cấp';
        const statusMap = { 'rented': 'Đang thuê', 'deposit': 'Đã cọc giữ phòng', 'maintenance': 'Đang bảo trì', 'empty': 'Còn trống' };
        return `${introduction}Phòng trọ có giá thuê **mắc nhất** trên hệ thống hiện tại là **Phòng ${mostExpensive.soPhong}** (Loại phòng: **${typeName}**) tại **${propName}**.
- Diện tích rộng rãi: **${mostExpensive.dienTich} m2**
- Giá thuê: **${mostExpensive.giaThue.toLocaleString('vi-VN')}đ/tháng**
- Trạng thái hiện tại: **${statusMap[mostExpensive.trangThai] || 'Còn trống'}**
- Tiện ích nổi bật: Máy lạnh Daikin, ban công thoáng mát, tủ lạnh, bếp riêng, máy giặt, WC khép kín.`;
      }
    }
  }

  // 3. Xử lý câu hỏi về một số phòng cụ thể (ví dụ: phòng 101, phòng 104)
  const roomMatch = query.match(/phòng\s*(\d+)/i) || query.match(/phong\s*(\d+)/i);
  if (roomMatch) {
    const roomNo = roomMatch[1];
    const targetRooms = rooms.filter(r => r.soPhong === roomNo);
    
    if (targetRooms.length > 0) {
      let reply = `${introduction}Thông tin tra cứu của **Phòng ${roomNo}** trên hệ thống:\n\n`;
      targetRooms.forEach(r => {
        const propName = propMap[r.maNhaTroId?.toString()] || 'Hệ thống';
        const typeName = r.maLoaiPhongId?.tenLoai || 'Standard';
        const statusMap = { 'rented': 'Đang thuê', 'deposit': 'Đã cọc giữ phòng', 'maintenance': 'Đang bảo trì', 'empty': 'Còn trống' };
        
        reply += `*   Cơ sở: **${propName}** (Mã: **${r.maPhong}**)
    - Loại phòng: **${typeName}**, Diện tích: **${r.dienTich} m2**
    - Giá thuê: **${r.giaThue.toLocaleString('vi-VN')}đ/tháng**
    - Trạng thái: **${statusMap[r.trangThai] || 'Còn trống'}**\n`;
        
        // Tra cứu khách thuê và hợp đồng
        const rContract = contracts.find(c => c.maPhongId && c.maPhongId._id.toString() === r._id.toString() && c.trangThai === 'active');
        if (rContract) {
          const tenantNames = (rContract.maKhachThueIds || []).map(t => `**${t.hoTen}** (${t.sdt})`).join(', ');
          reply += `    - Khách ở hiện tại: ${tenantNames || 'Chưa rõ'}
    - Hợp đồng: Hiệu lực từ **${new Date(rContract.ngayBatDau).toLocaleDateString('vi-VN')}** đến **${new Date(rContract.ngayKetThuc).toLocaleDateString('vi-VN')}**, đặt cọc **${rContract.tienCoc.toLocaleString('vi-VN')}đ**.\n`;
        }
        
        // Tra cứu hóa đơn
        const rInvoices = invoices.filter(inv => inv.maPhongId && inv.maPhongId._id.toString() === r._id.toString());
        const pendingInv = rInvoices.find(inv => inv.trangThai === 'pending' || inv.trangThai === 'overdue');
        if (pendingInv) {
          reply += `    - Công nợ: hóa đơn **${pendingInv.kyThanhToan}** trị giá **${pendingInv.tongTien.toLocaleString('vi-VN')}đ** đang **${pendingInv.trangThai === 'overdue' ? 'QUÁ HẠN' : 'chờ thanh toán'}** (Hạn chót: ${new Date(pendingInv.hanThanhToan).toLocaleDateString('vi-VN')}).\n`;
        }
        reply += `\n`;
      });
      return reply;
    }
  }

  // 4. Xử lý tra cứu khách thuê cụ thể
  const matchingTenant = tenants.find(t => query.includes(t.hoTen.toLowerCase()) || t.hoTen.toLowerCase().includes(query));
  if (matchingTenant) {
    const tContract = contracts.find(c => c.maKhachThueIds && c.maKhachThueIds.some(kt => kt._id.toString() === matchingTenant._id.toString()) && c.trangThai === 'active');
    
    let info = `${introduction}Thông tin khách thuê **${matchingTenant.hoTen}** tra cứu từ DB:
- Điện thoại: **${matchingTenant.sdt}**
- Email: **${matchingTenant.email}**
- Nghề nghiệp: **${matchingTenant.thongTinKhachThue?.ngheNghiep || 'Chưa rõ'}**
- CCCD: **${matchingTenant.thongTinKhachThue?.cccd || 'Chưa cập nhật'}**
- Tài khoản: **${matchingTenant.trangThai === 'active' ? 'Hoạt động' : 'Bị khóa'}**\n`;

    if (tContract) {
      const room = rooms.find(r => r._id.toString() === tContract.maPhongId?._id?.toString());
      const propName = room ? (propMap[room.maNhaTroId?.toString()] || '') : '';
      info += `- Đang thuê phòng: **Phòng ${room ? room.soPhong : 'Chưa rõ'}** tại **${propName}**
- Hợp đồng: Từ ngày **${new Date(tContract.ngayBatDau).toLocaleDateString('vi-VN')}** đến **${new Date(tContract.ngayKetThuc).toLocaleDateString('vi-VN')}**
- Tiền cọc giữ phòng: **${tContract.tienCoc.toLocaleString('vi-VN')}đ**`;
    } else {
      info += `- Hiện tại không có hợp đồng thuê phòng nào đang hoạt động.`;
    }
    return info;
  }

  // 5. Lọc danh sách theo quận huyện hoặc chi nhánh
  for (const p of properties) {
    if (query.includes(p.quanHuyen.toLowerCase()) || query.includes(p.maNhaTro.toLowerCase()) || query.includes(p.tenNhaTro.toLowerCase())) {
      const targetRooms = rooms.filter(r => r.maNhaTroId?.toString() === p._id.toString());
      const emptyRooms = targetRooms.filter(r => r.trangThai === 'empty');
      const emptyRoomNumbers = emptyRooms.slice(0, 5).map(r => `**Phòng ${r.soPhong}** (${r.dienTich}m2, **${r.giaThue.toLocaleString('vi-VN')}đ/tháng**)`).join(', ');
      
      let reply = `${introduction}Thông tin chi nhánh **${p.tenNhaTro}** (Mã: **${p.maNhaTro}**):
- Địa chỉ: **${p.diaChi}, ${p.quanHuyen}**
- Quy mô: **${p.tongSoPhong} phòng** (Đã cho thuê: **${p.soPhongDaThue}**, phòng trống: **${p.tongSoPhong - p.soPhongDaThue}**)
- Một số phòng trống nổi bật: ${emptyRoomNumbers || 'Hiện tại cơ sở này đã kín phòng'}\n`;

      const propServices = dbData.services.filter(s => s.maNhaTroId?.toString() === p._id.toString());
      if (propServices.length > 0) {
        reply += `- Đơn giá dịch vụ:\n`;
        propServices.forEach(s => {
          reply += `  + **${s.tenDichVu}**: **${s.donGia.toLocaleString('vi-VN')}đ/${s.donVi}** (${s.loaiTinh === 'metered' ? 'Chỉ số thực tế' : 'Cố định'})\n`;
        });
      }
      return reply;
    }
  }

  // 6. Xử lý câu hỏi về hóa đơn và công nợ
  if (query.includes('hóa đơn') || query.includes('công nợ') || query.includes('nợ') || query.includes('tiền trọ') || query.includes('thanh toán') || query.includes('quá hạn') || query.includes('chưa đóng')) {
    const overdueInvoices = invoices.filter(inv => inv.trangThai === 'overdue' || inv.trangThai === 'pending');
    
    if (overdueInvoices.length > 0) {
      let reply = `${introduction}Danh sách các hóa đơn chờ thanh toán & quá hạn trên hệ thống:\n\n`;
      overdueInvoices.slice(0, 5).forEach(inv => {
        const room = rooms.find(r => r._id.toString() === inv.maPhongId?._id?.toString()) || {};
        const propName = room.maNhaTroId ? (propMap[room.maNhaTroId.toString()] || 'Hệ thống') : 'Hệ thống';
        const dueDate = inv.hanThanhToan ? new Date(inv.hanThanhToan).toLocaleDateString('vi-VN') : 'Chưa rõ';
        
        reply += `*   **Hóa đơn phòng ${room.soPhong || 'Chưa rõ'}** tại **${propName}**:
    - Số tiền: **${inv.tongTien.toLocaleString('vi-VN')}đ** (Hạn thanh toán: **${dueDate}**)
    - Trạng thái: **${inv.trangThai === 'overdue' ? 'QUÁ HẠN THANH TOÁN (Trễ)' : 'Chờ thanh toán'}**\n\n`;
      });
      return reply;
    }
  }

  // 7. Mặc định trả về thông tin tổng quan cực kỳ ngắn gọn, trúng đích
  const propCount = properties.length;
  const roomCount = rooms.length;
  const tenantCount = tenants.length;
  const occupiedCount = rooms.filter(r => r.trangThai === 'rented').length;

  return `${introduction}Chào bạn! Tôi là Trợ lý ngoại tuyến chuỗi nhà trọ **BoardingHouse Pro**. Do dịch vụ AI Gemini đang gián đoạn tạm thời, tôi đã tự động tra cứu nhanh MongoDB để gửi bạn số liệu thực tế:

*   **Quy mô**: **${propCount} cơ sở** nhà trọ hoạt động tại TP.HCM.
*   **Tổng số phòng**: **${roomCount} phòng** (Đã cho thuê: **${occupiedCount}**, phòng trống: **${roomCount - occupiedCount}**).
*   **Tổng số khách thuê**: **${tenantCount} thành viên** đang sinh sống.

Bạn có thể hỏi nhanh về dữ liệu hệ thống trúng đích như:
1. *"Phòng trọ nào rẻ nhất / mắc nhất?"*
2. *"Tìm phòng trống ở Quận 1 / Bình Thạnh / Quận 3..."*
3. *"Thông tin phòng 101 / phòng 104..."*
4. *"Danh sách công nợ quá hạn / hóa đơn"*
5. *"Thông tin khách thuê Phạm Minh Đức / Trần Văn Muộn..."*`;
}

// 9. API Chatbot AI kết nối MongoDB
app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Vui lòng nhập tin nhắn." });
  }

  try {
    // Lấy context dữ liệu thực tế từ Database theo thời gian thực
    const dbData = await getDetailedSystemContext();
    const statsContext = dbData.markdownText;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Chatbot AI] Chưa cấu hình GEMINI_API_KEY, tự động chạy chế độ Offline.");
      const fallbackReply = getFallbackResponse(message, dbData);
      return res.json({ reply: fallbackReply, isOnline: false });
    }

    // Map history to Gemini API format
    const contents = history.map(item => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content || item.text || '' }]
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const systemInstruction = {
      parts: [{
        text: `Bạn là BoardingHouse AI, trợ lý ảo thông minh của hệ thống quản lý chuỗi nhà trọ BoardingHouse Pro. 
Hãy giúp đỡ Admin (chủ trọ), Manager (quản lý) hoặc Tenant (khách thuê) giải quyết các thắc mắc của họ một cách ngắn gọn, súc tích và hữu ích nhất.
Ngôn ngữ sử dụng: Tiếng Việt, văn phong thân thiện, chuyên nghiệp, lịch sự.
${statsContext}`
      }]
    };

    // Gọi Gemini API sử dụng fetch native của Node.js với cơ chế tự động thử lại (Retry)
    let response;
    const attempts = 3;
    const delay = 600; // ms
    
    for (let i = 0; i < attempts; i++) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents,
            systemInstruction
          })
        });
        
        if (response.ok) {
          break; // Thành công
        }
        
        const errorData = await response.clone().json().catch(() => ({}));
        console.warn(`[Gemini API] Lần thử ${i + 1} thất bại (Status ${response.status}):`, errorData.error?.message || "Lỗi không xác định");
        
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Tăng dần thời gian chờ
        }
      } catch (err) {
        console.warn(`[Gemini API] Lần thử ${i + 1} gặp lỗi kết nối:`, err.message);
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        } else {
          throw err;
        }
      }
    }

    if (!response || !response.ok) {
      const errorData = await response?.json().catch(() => ({}));
      console.error("Lỗi API Gemini sau tất cả các lần thử:", errorData);
      throw new Error(errorData?.error?.message || "Không thể gọi Gemini API sau nhiều lần thử");
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể tìm thấy câu trả lời phù hợp lúc này.";

    res.json({ reply: replyText, isOnline: true });
  } catch (error) {
    console.error("Lỗi API Chatbot:", error.message);
    try {
      console.log("[Chatbot AI] Kích hoạt cơ chế Trợ lý Offline dựa trên dữ liệu database thực tế do lỗi kết nối AI.");
      const dbData = await getDetailedSystemContext();
      const fallbackReply = getFallbackResponse(message, dbData);
      return res.json({ reply: fallbackReply, isOnline: false });
    } catch (fallbackError) {
      console.error("Lỗi cả fallback ngoại tuyến:", fallbackError.message);
      res.status(500).json({ message: "Trợ lý AI đang gặp sự cố kết nối và không thể tải dữ liệu offline." });
    }
  }
});

// Khởi chạy Server
const server = app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

connectDB().catch(err => {
  console.error("Warning: Failed to connect to MongoDB Atlas:", err.message);
  console.error("Please ensure your public IP is whitelisted on MongoDB Atlas.");
});
