import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  method: { type: String, enum: ['vnpay', 'momo', 'cash', 'bank_transfer'], required: true },
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
