import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true }, // kWh, m3, phòng, chiếc
  price: { type: Number, required: true },
  type: { type: String, enum: ['metered', 'fixed'], required: true }
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
