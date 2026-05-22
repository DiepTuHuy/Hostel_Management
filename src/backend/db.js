import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      throw new Error("MONGODB_URI is not defined in environment variables. Please check your .env file.");
    }
    // Mask the password in connection log for security
    const maskedUri = connStr.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB at: ${maskedUri}`);
    
    await mongoose.connect(connStr);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};
