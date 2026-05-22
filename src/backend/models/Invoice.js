import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  period: { type: String, required: true }, // '2026-05'
  totalAmount: { type: Number, required: true },
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  details: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }
  }]
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
