import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  /**
   * Gửi mã OTP xác thực đăng ký đến Email thật của người dùng
   * @param {string} email 
   * @param {string} fullName 
   * @param {string} otp 
   */
  async sendOtpEmail(email, fullName, otp) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Xác thực tài khoản BoardingHouse Pro</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
      padding: 40px;
      text-align: center;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-icon {
      background: linear-gradient(135deg, #3a5bc7 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      padding: 10px 14px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    h1 {
      font-size: 22px;
      color: #0f172a;
      margin-bottom: 12px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 24px 0;
      text-align: left;
    }
    .otp-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 20px;
      padding: 30px 24px;
      margin: 28px 0;
      border: 1px solid #e2e8f0;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.01);
    }
    .otp-code {
      font-size: 38px;
      letter-spacing: 10px;
      font-weight: 800;
      color: #3a5bc7;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      margin: 0;
      text-shadow: 0 2px 4px rgba(58,91,199,0.05);
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }
    .expiry-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 14px;
      font-weight: 500;
    }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #f1f5f9;
      padding-top: 24px;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <span class="logo-icon">BH</span>
        <span class="brand-name">BoardingHouse Pro</span>
      </div>
      <h1>Xác thực tài khoản</h1>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống BoardingHouse Pro. Vui lòng sử dụng mã OTP dưới đây để xác thực địa chỉ email và kích hoạt tài khoản của bạn:</p>
      
      <div class="otp-card">
        <div class="otp-label">Mã xác thực OTP của bạn</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry-note">Hiệu lực trong vòng 5 phút (Không chia sẻ mã này cho bất kỳ ai)</div>
      </div>
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        Nếu bạn không thực hiện yêu cầu này, vui lòng an tâm bỏ qua email này.
      </p>
      
      <div class="footer">
        Bản quyền thuộc về © 2026 BoardingHouse Pro Inc.<br>
        Hệ thống Quản lý và Vận hành Chuỗi Nhà trọ thông minh chuyên nghiệp.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const hasConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!hasConfig) {
      console.log(`\n==================================================`);
      console.log(`[Email Service - MOCK LOG]`);
      console.log(`SMTP chưa được cấu hình đầy đủ trong tệp .env!`);
      console.log(`Đang giả lập gửi mã OTP 6 chữ số đến email: ${email}`);
      console.log(`MÃ OTP CỦA BẠN LÀ: ${otp}`);
      console.log(`==================================================\n`);
      return true;
    }

    try {
      const mailOptions = {
        from: `"BoardingHouse Pro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[BoardingHouse Pro] Mã OTP xác thực tài khoản: ${otp}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Đã gửi thành công OTP email đến: ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Service - LỖI GỬI EMAIL]:`, error.message);
      console.log(`[Email Service - FALLBACK] Mã OTP của bạn là: ${otp}`);
      return false;
    }
  },

  async sendForgotPasswordOtpEmail(email, fullName, otp) {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Khôi phục mật khẩu BoardingHouse Pro</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02);
      padding: 40px;
      text-align: center;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .logo-icon {
      background: linear-gradient(135deg, #3a5bc7 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 18px;
      padding: 10px 14px;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    h1 {
      font-size: 22px;
      color: #0f172a;
      margin-bottom: 12px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 24px 0;
      text-align: left;
    }
    .otp-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 20px;
      padding: 30px 24px;
      margin: 28px 0;
      border: 1px solid #e2e8f0;
      box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.01);
    }
    .otp-code {
      font-size: 38px;
      letter-spacing: 10px;
      font-weight: 800;
      color: #dc2626;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      margin: 0;
      text-shadow: 0 2px 4px rgba(220,38,38,0.05);
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 12px;
    }
    .expiry-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 14px;
      font-weight: 500;
    }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #f1f5f9;
      padding-top: 24px;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <span class="logo-icon">BH</span>
        <span class="brand-name">BoardingHouse Pro</span>
      </div>
      <h1>Khôi phục mật khẩu</h1>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để thiết lập lại mật khẩu mới:</p>
      
      <div class="otp-card">
        <div class="otp-label">Mã OTP khôi phục mật khẩu của bạn</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry-note">Hiệu lực trong vòng 5 phút (Không chia sẻ mã này cho bất kỳ ai)</div>
      </div>
      
      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
        Nếu bạn không thực hiện yêu cầu này, vui lòng an tâm bỏ qua email này. Mật khẩu của bạn vẫn sẽ được giữ nguyên.
      </p>
      
      <div class="footer">
        Bản quyền thuộc về © 2026 BoardingHouse Pro Inc.<br>
        Hệ thống Quản lý và Vận hành Chuỗi Nhà trọ thông minh chuyên nghiệp.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const hasConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

    if (!hasConfig) {
      console.log(`\n==================================================`);
      console.log(`[Email Service - MOCK LOG]`);
      console.log(`SMTP chưa được cấu hình đầy đủ trong tệp .env!`);
      console.log(`Đang giả lập gửi mã OTP quên mật khẩu đến email: ${email}`);
      console.log(`MÃ OTP QUÊN MẬT KHẨU CỦA BẠN LÀ: ${otp}`);
      console.log(`==================================================\n`);
      return true;
    }

    try {
      const mailOptions = {
        from: `"BoardingHouse Pro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[BoardingHouse Pro] Mã OTP khôi phục mật khẩu: ${otp}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Đã gửi thành công OTP email quên mật khẩu đến: ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Service - LỖI GỬI EMAIL]:`, error.message);
      console.log(`[Email Service - FALLBACK] Mã OTP quên mật khẩu của bạn là: ${otp}`);
      return false;
    }
  }
}
