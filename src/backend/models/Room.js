import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true },
  roomNumber: { type: String, required: true },
  floor: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  price: { type: Number },
  area: { type: Number },
  code: { type: String },
  status: { type: String, enum: ['empty', 'rented', 'deposit', 'maintenance'], default: 'empty' },
  assets: [{
    name: { type: String, required: true },
    value: { type: Number, default: 0 },
    condition: { type: String, default: 'Tốt' }
  }]
}, { timestamps: true });

export const Room = mongoose.model('Room', roomSchema);
