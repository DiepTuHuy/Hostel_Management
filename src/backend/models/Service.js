import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  maNhaTroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenDichVu: { type: String, required: true },
  donVi: { type: String, required: true }, // kWh, m3, phòng, chiếc
  donGia: { type: Number, required: true },
  loaiTinh: { type: String, enum: ['metered', 'fixed'], required: true }
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
