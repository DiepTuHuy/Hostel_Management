import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  maNhaTro: { type: String, required: true, unique: true },
  tenNhaTro: { type: String, required: true },
  diaChi: { type: String, required: true },
  quanHuyen: { type: String, required: true },
  thanhPho: { type: String, default: 'TP. Hồ Chí Minh' },
  hinhAnh: { type: String },
  tongSoPhong: { type: Number, default: 0 },
  soPhongDaThue: { type: Number, default: 0 },
  maQuanLyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maChuTroId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  trangThai: { type: String, enum: ['active', 'inactive'], default: 'active' },
  qrCodeUrl: { type: String }
}, { timestamps: true });

export const Property = mongoose.model('Property', propertySchema);
