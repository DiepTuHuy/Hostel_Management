import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  name: { type: String, required: true },
  area: { type: Number, required: true }, // m2
  basePrice: { type: Number, required: true },
  amenities: [{ type: String }]
}, { timestamps: true });

export const RoomType = mongoose.model('RoomType', roomTypeSchema);
