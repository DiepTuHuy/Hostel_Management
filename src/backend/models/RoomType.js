import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  maNhaTroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenLoai: { type: String, required: true },
  dienTich: { type: Number, required: true }, // m2
  giaCoBan: { type: Number, required: true },
  tienNghi: [{ type: String }]
}, { timestamps: true });

export const RoomType = mongoose.model('RoomType', roomTypeSchema);
