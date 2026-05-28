import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  maHoaDonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  phuongThuc: { type: String, enum: ['vnpay', 'momo', 'cash', 'bank_transfer'], required: true },
  soTien: { type: Number, required: true },
  ngayGiaoDich: { type: Date, default: Date.now },
  trangThai: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
