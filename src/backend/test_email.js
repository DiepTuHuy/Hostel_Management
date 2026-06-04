import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // try using it as is
  },
});

async function verify() {
  try {
    const success = await transporter.verify();
    console.log("Server is ready to take our messages", success);

    const info = await transporter.sendMail({
      from: `"BoardingHouse Pro" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // send to self
      subject: "Test Email from BoardingHouse Pro",
      text: "If you see this, email sending works!",
    });
    console.log("Test email sent:", info.messageId);
  } catch (error) {
    console.error("Verification/Send error:", error);
  }
}

verify();
