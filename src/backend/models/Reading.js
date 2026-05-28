import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  maPhongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  maDichVuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  kyThanhToan: { type: String, required: true }, // '2026-05'
  chiSoCu: { type: Number, required: true },
  chiSoMoi: { type: Number, required: true },
  tieuThu: { type: Number, required: true }
}, { timestamps: true });

export const Reading = mongoose.model('Reading', readingSchema);
