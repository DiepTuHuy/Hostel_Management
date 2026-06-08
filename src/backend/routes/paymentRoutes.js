import express from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Contract } from '../models/Contract.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { RoomType } from '../models/RoomType.js';
import { Service } from '../models/Service.js';
import { Reading } from '../models/Reading.js';
import { Expense } from '../models/Expense.js';

import { emailService } from '../services/emailService.js';
import vnpayService from '../services/vnpayService.js';
import pdfReportService from '../services/pdfReportService.js';

import { mapDocument, mapRoom, mapContract, mapInvoice, mapNotification, mapUser } from '../utils/mappers.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();
router.get('/api/payments/vnpay-return', async (req, res) => {
  try {
    const queryParams = req.query;
    const isValid = vnpayService.verifyCallback(queryParams);
    if (!isValid) {
      return res.redirect(`${process.env.VNP_RETURNURL}?status=error&message=Chu%20ky%20khong%20hop%20le`);
    }

    const orderId = queryParams['vnp_TxnRef'];
    const responseCode = queryParams['vnp_ResponseCode'];
    const amount = Number(queryParams['vnp_Amount']) / 100;

    if (responseCode === '00') {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        const invoice = await Invoice.findById(orderId);
        if (invoice) {
          if (invoice.trangThai !== 'paid') {
            invoice.trangThai = 'paid';
            invoice.paymentMethod = 'vnpay';
            await invoice.save();

            await Payment.create({
              maHoaDonId: invoice._id,
              phuongThuc: 'vnpay',
              soTien: amount,
              trangThai: 'success'
            });
            console.log(`[VNPay] Thanh toan thanh cong hoa don: ${invoice.code || orderId}`);
          }
          return res.redirect(`${process.env.VNP_RETURNURL}?status=success&amount=${amount}&invoiceId=${invoice._id}&invoiceCode=${invoice.code || orderId}`);
        }
      }
      return res.redirect(`${process.env.VNP_RETURNURL}?status=error&message=Khong%20tim%20thay%20hoa%20don`);
    } else {
      return res.redirect(`${process.env.VNP_RETURNURL}?status=cancel&code=${responseCode}`);
    }
  } catch (error) {
    console.error("Lỗi callback VNPay Return:", error.message);
    res.redirect(`${process.env.VNP_RETURNURL}?status=error&message=Loi%20he%20thong`);
  }
});

// 6.4. VNPay IPN Callback (Bất đồng bộ server-to-server)
router.get('/api/payments/vnpay-ipn', async (req, res) => {
  try {
    const queryParams = req.query;
    const isValid = vnpayService.verifyCallback(queryParams);
    if (!isValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }

    const orderId = queryParams['vnp_TxnRef'];
    const responseCode = queryParams['vnp_ResponseCode'];
    const amount = Number(queryParams['vnp_Amount']) / 100;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    const invoice = await Invoice.findById(orderId);
    if (!invoice) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (invoice.tongTien !== amount) {
      return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
    }

    if (invoice.trangThai === 'paid') {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    if (responseCode === '00') {
      invoice.trangThai = 'paid';
      invoice.paymentMethod = 'vnpay';
      await invoice.save();

      await Payment.create({
        maHoaDonId: invoice._id,
        phuongThuc: 'vnpay',
        soTien: amount,
        trangThai: 'success'
      });
      return res.status(200).json({ RspCode: '00', Message: 'Confirm success' });
    } else {
      return res.status(200).json({ RspCode: '00', Message: 'Confirm success (Transaction failed)' });
    }
  } catch (error) {
    console.error("Lỗi callback VNPay IPN:", error.message);
    res.status(200).json({ RspCode: '99', Message: 'System Error' });
  }
});


// 7. Lấy danh sách thông báo


export default router;
