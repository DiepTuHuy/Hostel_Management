import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  maHopDongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  maPhongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  kyThanhToan: { type: String, required: true }, // '2026-05'
  tongTien: { type: Number, required: true },
  hanThanhToan: { type: Date, required: true },
  trangThai: { type: String, enum: ['pending', 'pending_cash', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  // Phương thức khách chọn khi thanh toán (phục vụ đối soát 2 bước & ghi Payment đúng kênh)
  paymentMethod: { type: String, enum: ['vnpay', 'cash', 'bank_transfer'] },
  chiTiet: [{
    maDichVuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    tenDichVu: { type: String, required: true },
    soLuong: { type: Number, required: true },
    donGia: { type: Number, required: true },
    thanhTien: { type: Number, required: true }
  }]
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
