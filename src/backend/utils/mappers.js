export function mapDocument(doc) {
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

export function mapRoom(roomDoc) {
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
    depositAt: room.depositAt ? room.depositAt.toISOString() : null,
    currentTenantId: room.currentTenantId ? room.currentTenantId.toString() : null,
    photos: room.hinhAnh || [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'
    ],
    description: room.moTa || `Phòng sạch sẽ, thoáng mát tại ${roomType.tenLoai || 'nhà trọ'}. Đầy đủ tiện nghi cơ bản.`,
    roomNumber: room.soPhong,
    roomTypeId: room.maLoaiPhongId?._id || room.maLoaiPhongId,
    assets: (room.taiSan || []).map(a => ({
      id: a._id ? a._id.toString() : Math.random().toString(),
      name: a.tenTaiSan,
      value: a.giaTri,
      condition: a.tinhTrang
    })),
    taiSan: room.taiSan || []
  };
}

export function mapContract(contractDoc) {
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

export function mapInvoice(invoiceDoc) {
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

export function mapNotification(notifDoc) {
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

export function mapUser(userDoc) {
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
