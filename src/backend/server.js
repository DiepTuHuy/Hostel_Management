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

// 9. API Chatbot AI với Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập tin nhắn." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Chưa cấu hình API Key của Gemini." });
    }

    // Lấy một số số liệu thống kê thực tế từ DB để AI trả lời thông minh hơn
    let statsContext = '';
    try {
      const propCount = await Property.countDocuments();
      const roomCount = await Room.countDocuments();
      const tenantCount = await User.countDocuments({ vaiTro: 'tenant' });
      const occupiedRooms = await Room.countDocuments({ trangThai: 'rented' });
      statsContext = `\n[Thông tin thực tế hệ thống hiện tại]:
- Tổng số chi nhánh nhà trọ: ${propCount}
- Tổng số phòng trọ: ${roomCount} (Đã cho thuê: ${occupiedRooms}, phòng trống: ${roomCount - occupiedRooms})
- Tổng số khách thuê: ${tenantCount}
Bạn có thể dùng các số liệu này để trả lời người dùng nếu họ hỏi về tình hình phòng hoặc quy mô hệ thống.`;
    } catch (e) {
      console.log("Không thể lấy context thống kê hệ thống cho AI:", e.message);
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

    // Gọi Gemini API sử dụng fetch native của Node.js với cơ chế tự động thử lại (Retry) để xử lý lỗi 503 UNAVAILABLE tạm thời
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

    res.json({ reply: replyText });
  } catch (error) {
    console.error("Lỗi API Chatbot:", error.message);
    res.status(500).json({ message: "Trợ lý AI đang gặp sự cố kết nối. Vui lòng thử lại sau." });
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
