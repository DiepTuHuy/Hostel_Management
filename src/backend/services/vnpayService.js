import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Định dạng ngày theo chuẩn VNPay: yyyyMMddHHmmss
 */
function getVnpDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Sắp xếp các tham số của object theo thứ tự chữ cái và sinh chuỗi query
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      sorted[key] = obj[key];
    }
  }
  return sorted;
}

/**
 * Sinh URL thanh toán VNPay
 * @param {Object} req - Request object từ Express
 * @param {Object} params
 * @param {string} params.orderId - Mã giao dịch (Mã hóa đơn)
 * @param {number} params.amount - Số tiền thanh toán (VND)
 * @param {string} params.orderInfo - Nội dung thanh toán
 * @returns {string} URL thanh toán
 */
export function createPaymentUrl(req, { orderId, amount, orderInfo }) {
  const tmnCode = process.env.VNP_TMNCODE || 'VNP_BHPRO_2026';
  const secretKey = process.env.VNP_HASHSECRET || '83f5647a98db2cf984aef5476a21cf92';
  let vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNP_RETURNURL || 'http://localhost:5173/tenant/payment-return';

  const date = new Date();
  const createDate = getVnpDate(date);
  
  let ipAddr = 
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  
  if (ipAddr.includes('::ffff:')) {
    ipAddr = ipAddr.replace('::ffff:', '');
  }

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(amount * 100), // VNPay tính theo đơn vị đồng x 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  // Sinh chuỗi query data
  const signData = Object.keys(vnp_Params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  vnp_Params['vnp_SecureHash'] = signed;

  // Ghép chuỗi query đầy đủ
  const query = Object.keys(vnp_Params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(vnp_Params[key])}`)
    .join('&');

  return `${vnpUrl}?${query}`;
}

/**
 * Xác thực signature trả về từ VNPay
 * @param {Object} queryParams - req.query nhận từ callback
 * @returns {boolean} Kết quả xác thực
 */
export function verifyCallback(queryParams) {
  const secretKey = process.env.VNP_HASHSECRET || '83f5647a98db2cf984aef5476a21cf92';
  const secureHash = queryParams['vnp_SecureHash'];

  // Tạo bản sao để lọc bỏ trường hash
  const vnp_Params = { ...queryParams };
  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  const sortedParams = sortObject(vnp_Params);

  // Sinh chuỗi query data để đối soát
  const signData = Object.keys(sortedParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === signed;
}

export default { createPaymentUrl, verifyCallback };
