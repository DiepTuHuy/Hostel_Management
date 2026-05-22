import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, default: 'TP. Hồ Chí Minh' },
  image: { type: String },
  totalRooms: { type: Number, default: 0 },
  occupiedRooms: { type: Number, default: 0 },
  managerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

export const Property = mongoose.model('Property', propertySchema);
