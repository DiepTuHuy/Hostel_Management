import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  tenantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  deposit: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'active', 'expired', 'terminated'], default: 'draft' },
  fileUrl: { type: String }
}, { timestamps: true });

export const Contract = mongoose.model('Contract', contractSchema);
