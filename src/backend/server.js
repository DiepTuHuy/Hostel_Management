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
  const roomType = room.roomTypeId || {};
  
  let type = 'private';
  if (roomType.name) {
    const nameLower = roomType.name.toLowerCase();
    if (nameLower.includes('studio') || nameLower.includes('đôi') || nameLower.includes('vip') || nameLower.includes('penthouse') || nameLower.includes('cao cấp')) {
      type = 'studio';
    } else if (nameLower.includes('ký túc xá') || nameLower.includes('shared') || nameLower.includes('ghép')) {
      type = 'shared';
    }
  }

  return {
    id: room._id.toString(),
    code: room.roomNumber || room.code,
    propertyId: room.propertyId ? room.propertyId.toString() : undefined,
    floor: room.floor,
    type: type,
    area: room.area || roomType.area || 0,
    price: room.price || room.currentPrice || roomType.basePrice || 0,
    amenities: roomType.amenities || [],
    status: room.status,
    currentTenantId: room.currentTenantId ? room.currentTenantId.toString() : null,
    photos: room.photos || [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
    ],
    description: room.description || `Phòng sạch sẽ, thoáng mát tại ${roomType.name || 'nhà trọ'}. Đầy đủ tiện nghi cơ bản.`,
    roomNumber: room.roomNumber,
    roomTypeId: room.roomTypeId?._id || room.roomTypeId
  };
}

function mapContract(contractDoc) {
  if (!contractDoc) return null;
  const contract = contractDoc.toObject ? contractDoc.toObject() : contractDoc;
  const room = contract.roomId || {};
  const tenant = contract.tenantIds?.[0] || {};
  
  return {
    id: contract._id.toString(),
    code: contract.code || `HD-${contract._id.toString().substring(18).toUpperCase()}`,
    propertyId: room.propertyId ? (room.propertyId._id?.toString() || room.propertyId.toString()) : undefined,
    roomId: room.roomNumber || room.code || (room._id ? room._id.toString() : (contract.roomId ? contract.roomId.toString() : undefined)),
    tenantId: tenant.fullName || (tenant._id ? tenant._id.toString() : (contract.tenantIds?.[0] ? contract.tenantIds[0].toString() : undefined)),
    tenantIds: contract.tenantIds ? contract.tenantIds.map(t => t._id?.toString() || t.toString()) : [],
    startDate: contract.startDate,
    endDate: contract.endDate,
    deposit: contract.deposit,
    monthlyRent: room.price || room.currentPrice || 3500000,
    services: [
      { name: "Điện", price: 3500, unit: "kWh" },
      { name: "Nước", price: 15000, unit: "m3" },
      { name: "Internet", price: 100000, unit: "phòng" }
    ],
    status: contract.status,
    pdfUrl: contract.fileUrl || null,
    createdAt: contract.createdAt
  };
}

function mapInvoice(invoiceDoc) {
  if (!invoiceDoc) return null;
  const invoice = invoiceDoc.toObject ? invoiceDoc.toObject() : invoiceDoc;
  const room = invoice.roomId || {};
  const contract = invoice.contractId || {};
  const tenant = contract.tenantIds?.[0] || {};
  
  return {
    id: invoice._id.toString(),
    code: invoice.code || `HD-${invoice._id.toString().substring(18).toUpperCase()}`,
    contractId: invoice.contractId?._id ? invoice.contractId._id.toString() : (invoice.contractId ? invoice.contractId.toString() : undefined),
    propertyId: room.propertyId ? (room.propertyId._id?.toString() || room.propertyId.toString()) : undefined,
    roomId: room.roomNumber || room.code || (room._id ? room._id.toString() : (invoice.roomId ? invoice.roomId.toString() : undefined)),
    tenantId: tenant.fullName || (tenant._id ? tenant._id.toString() : (contract.tenantIds?.[0] ? contract.tenantIds[0].toString() : undefined)),
    period: invoice.period,
    dueDate: invoice.deadline || invoice.dueDate,
    deadline: invoice.deadline,
    items: (invoice.details || []).map(d => ({
      name: d.name,
      qty: d.quantity || 1,
      unit: d.unit || 'phần',
      price: d.price,
      total: d.amount || (d.price * (d.quantity || 1))
    })),
    details: invoice.details || [],
    subtotal: invoice.totalAmount,
    total: invoice.totalAmount,
    totalAmount: invoice.totalAmount,
    status: invoice.status,
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
    userId: n.userId ? n.userId.toString() : undefined,
    title: n.title,
    body: n.content,
    content: n.content,
    channel: n.channel,
    read: n.isRead,
    isRead: n.isRead,
    createdAt: n.createdAt
  };
}

function mapUser(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatar: u.avatar || null,
    status: u.status,
    propertyIds: u.propertyIds ? u.propertyIds.map(p => p.toString()) : [],
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
      if (existingUser.status === 'active') {
        return res.status(400).json({ message: "Email này đã tồn tại và đã được kích hoạt trong hệ thống." });
      }
      
      // Nếu tài khoản đang ở trạng thái pending (chưa xác thực), chúng ta sẽ cho phép gửi lại mã OTP mới và cập nhật thông tin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Sinh mã OTP 6 chữ số ngẫu nhiên
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // hết hạn trong 5 phút

      existingUser.fullName = fullName;
      existingUser.password = hashedPassword;
      existingUser.phone = phone;
      existingUser.role = role || 'tenant';
      existingUser.tenantProfile = role === 'tenant' ? tenantProfile : undefined;
      existingUser.otp = { code: otpCode, expiresAt: otpExpires };
      
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
      fullName,
      email: emailLower,
      password: hashedPassword,
      phone,
      role: role || 'tenant',
      status: 'pending',
      tenantProfile: role === 'tenant' ? tenantProfile : undefined,
      otp: { code: otpCode, expiresAt: otpExpires }
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

    if (user.status === 'active') {
      return res.status(400).json({ message: "Tài khoản đã được kích hoạt từ trước." });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: "Không tìm thấy mã OTP nào đang chờ xác thực." });
    }

    // Kiểm tra hết hạn OTP
    if (new Date() > new Date(user.otp.expiresAt)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn (hiệu lực trong 5 phút). Vui lòng yêu cầu gửi lại mã mới." });
    }

    // Kiểm tra mã OTP khớp
    if (user.otp.code !== otp.trim()) {
      return res.status(400).json({ message: "Mã OTP nhập vào không chính xác. Vui lòng kiểm tra lại." });
    }

    // Kích hoạt tài khoản thành công
    user.status = 'active';
    user.otp = { code: undefined, expiresAt: undefined };
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

    if (user.status === 'active') {
      return res.status(400).json({ message: "Tài khoản này đã được kích hoạt rồi." });
    }

    // Sinh mã OTP mới
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    console.log(`[Database] Đã gửi lại mã OTP mới cho tài khoản: ${emailLower} - OTP mới: ${otpCode}`);

    // Gửi email thật
    const emailSent = await emailService.sendOtpEmail(emailLower, user.fullName, otpCode);

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
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác." });
    }

    // Tạo mã token mô phỏng phiên đăng nhập
    const token = `jwt.${user._id}.${Date.now()}`;

    console.log(`[Database] Người dùng đăng nhập thành công: ${email} (${user.role})`);
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
      p.id = p._id ? p._id.toString() : undefined;
      if (p.managerIds) p.managerIds = p.managerIds.map(m => m.toString());
      if (p.ownerId) p.ownerId = p.ownerId.toString();
      return p;
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
    const property = await Property.findById(req.params.id).lean();
    if (!property) return res.status(404).json({ message: "Không tìm thấy cơ sở." });
    property.id = property._id ? property._id.toString() : undefined;
    if (property.managerIds) property.managerIds = property.managerIds.map(m => m.toString());
    if (property.ownerId) property.ownerId = property.ownerId.toString();
    res.json(property);
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
      filter.propertyId = propertyId;
    }
    if (status) filter.status = status;

    const rooms = await Room.find(filter).populate('roomTypeId');
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
        district: new RegExp(district, 'i')
      });
      filter.propertyId = { $in: propertiesInDistrict.map(p => p._id) };
    }

    // Filter by price
    if (priceMin || priceMax) {
      filter.$or = [
        { price: {} },
        { currentPrice: {} }
      ];
      if (priceMin) {
        filter.$or[0].price = { $gte: Number(priceMin) };
        filter.$or[1].currentPrice = { $gte: Number(priceMin) };
      }
      if (priceMax) {
        if (!filter.$or[0].price) filter.$or[0].price = {};
        if (!filter.$or[1].currentPrice) filter.$or[1].currentPrice = {};
        filter.$or[0].price.$lte = Number(priceMax);
        filter.$or[1].currentPrice.$lte = Number(priceMax);
      }
    }

    let rooms = await Room.find(filter).populate('roomTypeId');

    // Filter by amenities
    if (amenities) {
      const amList = amenities.split(',').map(a => a.trim().toLowerCase());
      rooms = rooms.filter(room => {
        const roomType = room.roomTypeId || {};
        const roomAmList = (roomType.amenities || []).map(a => a.toLowerCase());
        return amList.every(a => roomAmList.includes(a));
      });
    }

    // Filter by keyword
    if (keyword) {
      const kw = keyword.toLowerCase();
      const allProps = await Property.find();
      const propMap = new Map(allProps.map(p => [p._id.toString(), p.name.toLowerCase()]));

      rooms = rooms.filter(room => {
        const roomType = room.roomTypeId || {};
        const propName = propMap.get(room.propertyId?.toString()) || '';
        const roomNum = room.roomNumber || '';
        const typeName = roomType.name || '';
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
    const room = await Room.findById(req.params.id).populate('roomTypeId');
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
      filter.tenantIds = tenantId;
    }
    if (status) filter.status = status;

        const contracts = await Contract.find(filter).populate('roomId').populate('tenantIds');
    
    let results = contracts;
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      results = contracts.filter(c => c.roomId?.propertyId?.toString() === propertyId);
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
    const contract = await Contract.findById(req.params.id).populate('roomId').populate('tenantIds');
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
      const tenantContracts = await Contract.find({ tenantIds: tenantId });
      filter.contractId = { $in: tenantContracts.map(c => c._id) };
    }
    if (status) filter.status = status;
    if (period) filter.period = period;

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'contractId',
        populate: {
          path: 'tenantIds',
          select: 'fullName'
        }
      })
      .populate('roomId');

    let results = invoices;
    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return res.json([]);
      }
      results = invoices.filter(inv => inv.roomId?.propertyId?.toString() === propertyId);
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
        path: 'contractId',
        populate: {
          path: 'tenantIds',
          select: 'fullName'
        }
      })
      .populate('roomId');
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

    invoice.status = 'paid';
    await invoice.save();

    await Payment.create({
      invoiceId: invoice._id,
      method: method || 'vnpay',
      amount: invoice.totalAmount,
      status: 'success'
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
      filter.userId = userId;
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
    if (role) filter.role = role;

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

// Khởi chạy Server sau khi kết nối CSDL thành công
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start backend server due to DB connection error:", err.message);
});
