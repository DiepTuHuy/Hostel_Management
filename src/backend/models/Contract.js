import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  maPhongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  maKhachThueIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  ngayBatDau: { type: Date, required: true },
  ngayKetThuc: { type: Date, required: true },
  tienCoc: { type: Number, required: true },
  trangThai: { type: String, enum: ['draft', 'active', 'expired', 'terminated'], default: 'draft' },
  duongDanPdf: { type: String }
}, { timestamps: true });

export const Contract = mongoose.model('Contract', contractSchema);
