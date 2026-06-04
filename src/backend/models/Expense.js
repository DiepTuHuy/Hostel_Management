import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  maNhaTroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  tenChiPhi: { type: String, required: true },
  soTien: { type: Number, required: true },
  danhMuc: {
    type: String,
    enum: ['sua_chua', 'bao_tri', 'dien_nuoc_chung', 'dich_vu_ngoai', 'khac'],
    default: 'khac'
  },
  ngayChi: { type: Date, default: Date.now },
  ghiChu: { type: String }
}, { timestamps: true });

export const Expense = mongoose.model('Expense', expenseSchema);
