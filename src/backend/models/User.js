import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'tenant'], default: 'tenant' },
  status: { type: String, enum: ['active', 'inactive', 'locked'], default: 'active' },
  propertyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  tenantProfile: {
    cccd: { type: String },
    occupation: { type: String },
    permanentAddress: { type: String },
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
