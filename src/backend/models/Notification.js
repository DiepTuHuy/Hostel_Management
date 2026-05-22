import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  maNguoiDungId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tieuDe: { type: String, required: true },
  noiDung: { type: String, required: true },
  kenh: { type: String, enum: ['email', 'sms', 'zalo', 'push'], default: 'push' },
  daDoc: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
