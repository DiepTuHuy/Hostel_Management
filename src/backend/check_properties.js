import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { connectDB } from './db.js';
import { Property } from './models/Property.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

async function run() {
  try {
    await connectDB();
    const properties = await Property.find();
    console.log(`Found ${properties.length} properties in database.`);
    properties.forEach((p, idx) => {
      console.log(`${idx + 1}. ID: ${p._id}, Code: ${p.maNhaTro}, Name: ${p.tenNhaTro}, qrCodeUrl length: ${p.qrCodeUrl ? p.qrCodeUrl.length : 0}, startsWith: ${p.qrCodeUrl ? p.qrCodeUrl.substring(0, 50) : 'N/A'}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
