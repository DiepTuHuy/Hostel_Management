import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  maHoaDonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: false },
  // Gắn với phòng cho giao dịch đặt cọc của khách vãng lai (không có hóa đơn)
  maPhongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: false },
  phuongThuc: { type: String, enum: ['vnpay', 'momo', 'cash', 'bank_transfer'], required: true },
  soTien: { type: Number, required: true },
  ngayGiaoDich: { type: Date, default: Date.now },
  trangThai: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  // Ghi chú đối soát (vd: thông tin người đặt cọc)
  ghiChu: { type: String }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
