import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  hoTen: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  matKhau: { type: String, required: true },
  sdt: { type: String, required: true },
  vaiTro: { type: String, enum: ['admin', 'manager', 'tenant'], default: 'tenant' },
  trangThai: { type: String, enum: ['active', 'inactive', 'locked', 'pending'], default: 'pending' },
  maNhaTroIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  thongTinKhachThue: {
    cccd: { type: String },
    ngheNghiep: { type: String },
    diaChiThuongTru: { type: String },
  },
  otp: {
    maOtp: { type: String },
    hanSuDung: { type: Date }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
