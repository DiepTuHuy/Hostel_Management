import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  maNhaTroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  maLoaiPhongId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  soPhong: { type: String, required: true },
  tang: { type: Number, required: true },
  giaThueHienTai: { type: Number, required: true },
  giaThue: { type: Number },
  dienTich: { type: Number },
  maPhong: { type: String },
  trangThai: { type: String, enum: ['empty', 'rented', 'deposit', 'maintenance'], default: 'empty' },
  hinhAnh: [{ type: String }],
  moTa: { type: String },
  taiSan: [{
    tenTaiSan: { type: String, required: true },
    giaTri: { type: Number, default: 0 },
    tinhTrang: { type: String, default: 'Tốt' }
  }]
}, { timestamps: true });

export const Room = mongoose.model('Room', roomSchema);
