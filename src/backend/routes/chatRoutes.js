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
router.post('/api/chat', async (req, res) => {
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

// CRUD ROOMTYPE (LOẠI PHÒNG & TIỆN NGHI - UC11)


export default router;
