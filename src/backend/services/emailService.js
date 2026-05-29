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
  },

  /**
   * Gửi thông báo hợp đồng mới cần ký số qua Email thật
   */
  async sendContractNotificationEmail(email, fullName, contractCode, monthlyRent, deposit, startDate, endDate) {
    const formattedRent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(monthlyRent);
    const formattedDeposit = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deposit);
    const formattedStart = new Date(startDate).toLocaleDateString('vi-VN');
    const formattedEnd = new Date(endDate).toLocaleDateString('vi-VN');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hợp đồng thuê phòng trọ mới cần ký kết - BoardingHouse Pro</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
    .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02); }
    .logo-icon { background: linear-gradient(135deg, #3a5bc7 0%, #2563eb 100%); color: #ffffff; font-weight: 800; font-size: 18px; padding: 10px 14px; border-radius: 12px; display: inline-block; }
    .brand-name { font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 8px; vertical-align: middle; }
    h1 { font-size: 20px; color: #0f172a; margin: 24px 0 12px 0; font-weight: 700; }
    p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .details-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .details-table td.label { color: #64748b; font-weight: 500; }
    .details-table td.value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { background: linear-gradient(135deg, #3a5bc7 0%, #2563eb 100%); color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.2); }
    .footer { border-top: 1px solid #f1f5f9; padding-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div>
        <span class="logo-icon">BH</span>
        <span class="brand-name">BoardingHouse Pro</span>
      </div>
      <h1>Hợp đồng thuê phòng mới</h1>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Ban quản lý cơ sở trọ vừa khởi tạo thành công hợp đồng thuê phòng trọ mới dành cho bạn trên hệ thống. Vui lòng đăng nhập và thực hiện ký số điện tử để kích hoạt hợp đồng:</p>
      
      <table class="details-table">
        <tr>
          <td class="label">Mã hợp đồng:</td>
          <td class="value">${contractCode}</td>
        </tr>
        <tr>
          <td class="label">Tiền phòng hằng tháng:</td>
          <td class="value" style="color: #2563eb;">${formattedRent}</td>
        </tr>
        <tr>
          <td class="label">Tiền đặt cọc phòng:</td>
          <td class="value">${formattedDeposit}</td>
        </tr>
        <tr>
          <td class="label">Thời hạn thuê:</td>
          <td class="value">${formattedStart} → ${formattedEnd}</td>
        </tr>
      </table>

      <div class="btn-container">
        <a href="http://localhost:5173/forgot-password" class="btn">Đăng Nhập Ký Số Hợp Đồng</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Nếu bạn chưa có tài khoản, vui lòng dùng email này để lấy lại mật khẩu hoặc liên hệ Quản lý.
      </p>

      <div class="footer">
        Bản quyền thuộc về © 2026 BoardingHouse Pro Inc.<br>
        Chuỗi căn hộ dịch vụ và phòng trọ thông minh chất lượng cao.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const hasConfig = process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!hasConfig) {
      console.log(`\n==================================================`);
      console.log(`[Email Service - MOCK LOG] Gửi thông báo hợp đồng mới`);
      console.log(`Đang giả lập gửi mail hợp đồng ${contractCode} đến email: ${email}`);
      console.log(`==================================================\n`);
      return true;
    }

    try {
      const mailOptions = {
        from: `"BoardingHouse Pro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[BoardingHouse Pro] Thông báo ký số hợp đồng thuê phòng trọ mới: ${contractCode}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Đã gửi thành công email hợp đồng đến: ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Service - LỖI GỬI EMAIL HỢP ĐỒNG]:`, error.message);
      return false;
    }
  },

  /**
   * Gửi email nhắc nợ công nợ hóa đơn trễ hạn qua Email thật
   */
  async sendDebtReminderEmail(email, fullName, amount, dueDate, invoiceCode, period) {
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    const formattedDueDate = new Date(dueDate).toLocaleDateString('vi-VN');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thông báo nhắc đóng tiền phòng trọ - BoardingHouse Pro</title>
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 40px 0; }
    .container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02); }
    .logo-icon { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff; font-weight: 800; font-size: 18px; padding: 10px 14px; border-radius: 12px; display: inline-block; }
    .brand-name { font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 8px; vertical-align: middle; }
    h1 { font-size: 20px; color: #be123c; margin: 24px 0 12px 0; font-weight: 700; }
    p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .details-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .details-table td.label { color: #64748b; font-weight: 500; }
    .details-table td.value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(225,29,72,0.2); }
    .footer { border-top: 1px solid #f1f5f9; padding-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div>
        <span class="logo-icon">BH</span>
        <span class="brand-name">BoardingHouse Pro</span>
      </div>
      <h1>Nhắc nhở thanh toán hóa đơn quá hạn</h1>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Hệ thống ghi nhận hóa đơn dịch vụ định kỳ của bạn đã quá hạn thanh toán. Vui lòng sắp xếp thanh toán trong thời gian sớm nhất để tránh bị gián đoạn dịch vụ:</p>
      
      <table class="details-table">
        <tr>
          <td class="label">Mã hóa đơn:</td>
          <td class="value">${invoiceCode}</td>
        </tr>
        <tr>
          <td class="label">Kỳ hóa đơn:</td>
          <td class="value">${period}</td>
        </tr>
        <tr>
          <td class="label">Tổng tiền cần thanh toán:</td>
          <td class="value" style="color: #e11d48;">${formattedAmount}</td>
        </tr>
        <tr>
          <td class="label">Hạn thanh toán ban đầu:</td>
          <td class="value">${formattedDueDate}</td>
        </tr>
      </table>

      <div class="btn-container">
        <a href="http://localhost:5173/forgot-password" class="btn">Thanh Toán Trực Tuyến Ngay</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center;">
        Nếu bạn đã thanh toán rồi, vui lòng liên hệ Ban quản lý cơ sở để xác nhận gỡ nợ trên hệ thống.
      </p>

      <div class="footer">
        Bản quyền thuộc về © 2026 BoardingHouse Pro Inc.<br>
        Chuỗi căn hộ dịch vụ và phòng trọ thông minh chất lượng cao.
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const hasConfig = process.env.SMTP_USER && process.env.SMTP_PASS;
    if (!hasConfig) {
      console.log(`\n==================================================`);
      console.log(`[Email Service - MOCK LOG] Nhắc nợ công nợ hóa đơn`);
      console.log(`Đang giả lập gửi email nhắc nợ ${invoiceCode} trị giá ${formattedAmount} đến email: ${email}`);
      console.log(`==================================================\n`);
      return true;
    }

    try {
      const mailOptions = {
        from: `"BoardingHouse Pro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `[CẢNH BÁO QUÁ HẠN] Nhắc đóng tiền phòng trọ kỳ ${period} - Mã hóa đơn: ${invoiceCode}`,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Đã gửi thành công email nhắc nợ đến: ${email}. MessageId: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`[Email Service - LỖI GỬI EMAIL NHẮC NỢ]:`, error.message);
      return false;
    }
  }
};
