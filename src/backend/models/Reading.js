import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  period: { type: String, required: true }, // '2026-05'
  oldValue: { type: Number, required: true },
  newValue: { type: Number, required: true },
  consumption: { type: Number, required: true }
}, { timestamps: true });

export const Reading = mongoose.model('Reading', readingSchema);
