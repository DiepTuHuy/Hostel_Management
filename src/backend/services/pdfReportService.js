// =====================================================================
//  pdfReportService.js — Sinh báo cáo, hợp đồng, hóa đơn PDF THẬT bằng thư viện pdfkit
//  - Nhúng font DejaVu Sans hỗ trợ đầy đủ tiếng Việt không lỗi font
//  - Hỗ trợ stream trực tiếp ra HTTP Response
// =====================================================================
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONT_REGULAR = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'assets', 'fonts', 'DejaVuSans-Bold.ttf');

const C = {
  primary: '#3A5BC7',
  success: '#16A34A',
  danger: '#DC2626',
  ink: '#1F2D3D',
  sub: '#6B7280',
  line: '#D7DEEA',
  zebra: '#F4F7FC',
  headBg: '#3A5BC7',
  headText: '#FFFFFF',
};

/** Định dạng tiền VND: 3.000.000 đ */
export function formatVnd(n) {
  return (Number(n) || 0).toLocaleString('vi-VN') + ' đ';
}

/** Định dạng ngày tháng: dd/mm/yyyy */
function formatDate(d) {
  if (!d) return 'Chưa xác định';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * Stream một báo cáo PDF ra response Express.
 */
export function streamReportPdf(res, { title, subtitle = '', columns, rows, summary = [], filename = 'bao_cao.pdf' }) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true, info: { Title: title, Author: 'BoardingHouse Pro' } });

  if (res && res.setHeader) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  }
  doc.pipe(res);

  doc.registerFont('reg', FONT_REGULAR);
  doc.registerFont('bold', FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---------- HEADER thương hiệu ----------
  doc.rect(0, 0, doc.page.width, 70).fill(C.primary);
  doc.fillColor('#FFFFFF').font('bold').fontSize(17).text('BoardingHouse Pro', left, 18);
  doc.font('reg').fontSize(9).fillColor('#DCE4FB')
    .text('Hệ thống Quản lý chuỗi Nhà trọ', left, 42);
  doc.font('reg').fontSize(9).fillColor('#DCE4FB')
    .text('Ngày xuất: ' + new Date().toLocaleString('vi-VN'), left, 18, { width: contentW, align: 'right' });

  // ---------- Tiêu đề báo cáo ----------
  let y = 92;
  doc.fillColor(C.ink).font('bold').fontSize(16).text(title, left, y, { width: contentW });
  y = doc.y + 2;
  if (subtitle) {
    doc.fillColor(C.sub).font('reg').fontSize(10).text(subtitle, left, y, { width: contentW });
    y = doc.y + 6;
  }
  doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(C.line).stroke();
  y += 12;

  // ---------- Bảng ----------
  const rowH = 22;
  const totalUnits = columns.reduce((s, c) => s + c.width, 0);
  const colX = [];
  let acc = left;
  for (const c of columns) {
    colX.push(acc);
    acc += (c.width / totalUnits) * contentW;
  }
  const colW = columns.map((c) => (c.width / totalUnits) * contentW);

  function drawHeaderRow(yy) {
    doc.rect(left, yy, contentW, rowH).fill(C.headBg);
    doc.fillColor(C.headText).font('bold').fontSize(9.5);
    columns.forEach((c, i) => {
      doc.text(c.header, colX[i] + 6, yy + 6, { width: colW[i] - 12, align: c.align || 'left', lineBreak: false });
    });
    return yy + rowH;
  }

  y = drawHeaderRow(y);

  doc.font('reg').fontSize(9.5);
  rows.forEach((row, idx) => {
    if (y + rowH > doc.page.height - 55) {
      doc.addPage();
      y = drawHeaderRow(doc.page.margins.top);
      doc.font('reg').fontSize(9.5);
    }
    if (idx % 2 === 1) {
      doc.rect(left, y, contentW, rowH).fill(C.zebra);
    }
    doc.fillColor(C.ink);
    columns.forEach((c, i) => {
      const val = row[c.key] == null ? '' : String(row[c.key]);
      doc.text(val, colX[i] + 6, y + 6, { width: colW[i] - 12, align: c.align || 'left', lineBreak: false });
    });
    doc.moveTo(left, y + rowH).lineTo(right, y + rowH).lineWidth(0.5).strokeColor(C.line).stroke();
    y += rowH;
  });

  // ---------- Tổng kết ----------
  if (summary.length) {
    y += 14;
    if (y + summary.length * 18 > doc.page.height - 55) { doc.addPage(); y = doc.page.margins.top; }
    doc.font('bold').fontSize(11).fillColor(C.primary).text('TỔNG KẾT', left, y);
    y = doc.y + 4;
    doc.font('reg').fontSize(10).fillColor(C.ink);
    summary.forEach((s) => {
      doc.font('reg').text(s.label, left, y, { width: contentW * 0.6, continued: false });
      doc.font('bold').text(s.value, left, y, { width: contentW, align: 'right' });
      y += 18;
    });
  }

  // ---------- Footer số trang ----------
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const fy = doc.page.height - 30;
    doc.moveTo(left, fy - 8).lineTo(right, fy - 8).lineWidth(0.5).strokeColor(C.line).stroke();
    doc.font('reg').fontSize(8).fillColor(C.sub)
      .text('BoardingHouse Pro — Báo cáo được sinh tự động', left, fy, { lineBreak: false });
    const pn = `Trang ${i + 1} / ${range.count}`;
    const pnW = doc.widthOfString(pn);
    doc.text(pn, right - pnW, fy, { lineBreak: false });
  }
  doc.flushPages();
  doc.end();
}

/**
 * Stream Hợp đồng PDF thật ra response Express
 */
export function streamContractPdf(res, contract) {
  const doc = new PDFDocument({ size: 'A4', margin: 45, bufferPages: true, info: { Title: `Hợp đồng ${contract.code}`, Author: 'BoardingHouse Pro' } });

  if (res && res.setHeader) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Hop_Dong_${contract.code}.pdf"`);
  }
  doc.pipe(res);

  doc.registerFont('reg', FONT_REGULAR);
  doc.registerFont('bold', FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---------- Tiêu đề quốc gia ----------
  doc.fillColor(C.ink).font('bold').fontSize(12).text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', left, 45, { align: 'center', width: contentW });
  doc.font('reg').fontSize(11).text('Độc lập - Tự do - Hạnh phúc', { align: 'center', width: contentW });
  doc.moveTo(doc.page.width / 2 - 60, doc.y + 4).lineTo(doc.page.width / 2 + 60, doc.y + 4).lineWidth(1).strokeColor(C.ink).stroke();

  // ---------- Tiêu đề văn bản ----------
  doc.y += 30;
  doc.font('bold').fontSize(15).text('HỢP ĐỒNG THUÊ PHÒNG TRỌ CHI TIẾT', { align: 'center', width: contentW });
  doc.font('reg').fontSize(10).fillColor(C.sub).text(`Mã tài liệu: ${contract.code}.pdf`, { align: 'center', width: contentW });
  
  doc.y += 15;
  doc.fillColor(C.ink).font('reg').fontSize(11);
  doc.text(`Hôm nay, ngày ${formatDate(contract.startDate)}, chúng tôi gồm:`, left);

  doc.y += 8;
  doc.font('bold').text('BÊN CHO THUÊ (BÊN A): BAN QUẢN TRỊ BOARDINGHOUSE GROUP');
  doc.font('reg').text('Địa chỉ văn phòng: 123 Nguyễn Thị Minh Khai, Bến Thành, Quận 1, TP. HCM');
  doc.text('Đại diện pháp lý: Ông Nguyễn Văn Admin  -  Chức vụ: Giám đốc Chuỗi cơ sở');

  doc.y += 8;
  doc.font('bold').text('BÊN THUÊ PHÒNG (BÊN B): KHÁCH HÀNG THUÊ TRỌ');
  doc.font('reg').text(`Họ và tên khách thuê: ${contract.tenantId || 'Nguyễn Văn Hải'}`);
  doc.text(`Số điện thoại: ${contract.tenantPhone || '098xxxxxxx'}  —  Mã căn hộ: ${contract.roomId || 'P.102'}`);

  doc.y += 12;
  doc.font('bold').text('Điều 1: Phòng thuê và Thời hạn');
  doc.font('reg').text(`1. Bên A đồng ý cho Bên B thuê phòng số ${contract.roomId} tại cơ sở thuộc chuỗi BoardingHouse Pro.`);
  doc.text(`2. Thời gian thuê hợp đồng là 01 năm, tính từ ngày ${formatDate(contract.startDate)} đến hết ngày ${formatDate(contract.endDate)}.`);

  doc.y += 8;
  doc.font('bold').text('Điều 2: Giá thuê và Phương thức thanh toán');
  doc.font('reg').text(`1. Tiền thuê phòng cố định mỗi tháng là: ${formatVnd(contract.monthlyRent)}/tháng.`);
  doc.text(`2. Tiền đặt cọc Bên B bàn giao cho Bên A là: ${formatVnd(contract.deposit)} (sẽ được hoàn trả đầy đủ khi thanh lý hợp đồng hợp lệ).`);
  doc.text('3. Thanh toán tiền phòng hàng kỳ từ ngày 01 đến ngày 05 hàng tháng qua cổng VNPay hoặc tiền mặt.');

  // ---------- Ký tên & Dấu đỏ số ----------
  let signY = doc.y + 40;
  if (signY + 80 > doc.page.height - 50) {
    doc.addPage();
    signY = doc.page.margins.top + 20;
  }

  doc.font('bold').fontSize(11);
  doc.text('ĐẠI DIỆN BÊN B (KHÁCH THUÊ)', left, signY, { width: contentW / 2, align: 'center' });
  doc.text('ĐẠI DIỆN BÊN A (BOARDINGHOUSE)', left + contentW / 2, signY, { width: contentW / 2, align: 'center' });

  doc.font('reg').fontSize(9).fillColor(C.sub);
  doc.text('(Ký và ghi rõ họ tên)', left, signY + 16, { width: contentW / 2, align: 'center' });
  doc.text('(Ký, đóng dấu số)', left + contentW / 2, signY + 16, { width: contentW / 2, align: 'center' });

  // Vẽ con dấu hoặc chữ ký
  doc.font('bold').fillColor('#BBBBBB');
  doc.text('[Đã ký số điện tử]', left, signY + 50, { width: contentW / 2, align: 'center' });

  // Dấu đỏ đại diện Bên A
  const stampX = left + contentW / 2 + 20;
  const stampY = signY + 35;
  doc.rect(stampX, stampY, 195, 55).dash(3, { space: 2 }).lineWidth(1.5).strokeColor(C.danger).stroke();
  doc.fillColor(C.danger).font('bold').fontSize(9);
  doc.text('✔ ĐÃ KÝ SỐ PHÁP LÝ', stampX + 10, stampY + 8);
  doc.font('bold').fontSize(8.5).text('BOARDINGHOUSE GROUP JSC', stampX + 10, stampY + 20);
  doc.font('reg').fontSize(7.5).text(`Thời gian: ${new Date(contract.createdAt || contract.startDate).toLocaleString('vi-VN')}`, stampX + 10, stampY + 32);
  doc.text('Chứng thư: CA-BH-PRO-2026', stampX + 10, stampY + 42);

  doc.end();
}

/**
 * Stream Hóa đơn/Biên lai tiền phòng PDF thật ra response Express
 */
export function streamInvoicePdf(res, invoice) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true, info: { Title: `Hóa đơn ${invoice.code}`, Author: 'BoardingHouse Pro' } });

  if (res && res.setHeader) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Hoa_Don_${invoice.code}.pdf"`);
  }
  doc.pipe(res);

  doc.registerFont('reg', FONT_REGULAR);
  doc.registerFont('bold', FONT_BOLD);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const contentW = right - left;

  // ---------- HEADER thương hiệu ----------
  doc.rect(0, 0, doc.page.width, 70).fill(C.primary);
  doc.fillColor('#FFFFFF').font('bold').fontSize(16).text('BoardingHouse Pro', left, 18);
  doc.font('reg').fontSize(8.5).fillColor('#DCE4FB')
    .text('Hệ thống Quản lý chuỗi Nhà trọ', left, 40);
  doc.font('reg').fontSize(8.5).fillColor('#DCE4FB')
    .text('Tổng đài: 1900 8686', left, 18, { width: contentW, align: 'right' });

  // ---------- Tiêu đề Hóa đơn ----------
  let y = 92;
  doc.fillColor(C.ink).font('bold').fontSize(15).text('HÓA ĐƠN TIỀN PHÒNG & DỊCH VỤ', left, y, { width: contentW, align: 'center' });
  y = doc.y + 2;
  doc.fillColor(C.sub).font('reg').fontSize(9).text(`Kỳ thanh toán: ${invoice.period}   |   Mã hóa đơn: ${invoice.code}`, left, y, { width: contentW, align: 'center' });
  
  y = doc.y + 12;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(C.line).stroke();
  y += 12;

  // ---------- Thông tin Khách thuê ----------
  doc.fillColor(C.ink).font('bold').fontSize(10).text('THÔNG TIN KHÁCH THUÊ', left, y);
  y = doc.y + 4;
  doc.font('reg').fontSize(9.5);
  doc.text(`Khách hàng: ${invoice.tenantId || 'Chưa cập nhật'}`, left, y);
  doc.text(`Mã căn hộ: Phòng ${invoice.roomId}`, left + contentW / 2, y);
  y = doc.y + 4;
  doc.text(`Hạn thanh toán: ${formatDate(invoice.dueDate)}`, left, y);
  doc.text(`Trạng thái: ${invoice.status === 'paid' ? 'Đã thanh toán' : invoice.status === 'pending_cash' ? 'Chờ xác nhận tiền mặt' : 'Chưa thanh toán'}`, left + contentW / 2, y);

  y = doc.y + 15;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.5).strokeColor(C.line).stroke();
  y += 12;

  // ---------- Chi tiết dịch vụ (Bảng) ----------
  doc.font('bold').fontSize(10).text('CHI TIẾT THANH TOÁN', left, y);
  y = doc.y + 6;

  const colW = [30, 200, 80, 95, 110]; // STT, Dịch vụ, Số lượng, Đơn giá, Thành tiền
  const colX = [left];
  for (let i = 1; i < colW.length; i++) {
    colX.push(colX[i-1] + colW[i-1]);
  }

  // Header bảng
  doc.rect(left, y, contentW, 20).fill(C.primary);
  doc.fillColor('#FFFFFF').font('bold').fontSize(9);
  doc.text('STT', colX[0] + 5, y + 5);
  doc.text('Mục chi phí/Dịch vụ', colX[1] + 5, y + 5);
  doc.text('Số lượng', colX[2] + 5, y + 5);
  doc.text('Đơn giá', colX[3] + 5, y + 5);
  doc.text('Thành tiền', colX[4] + 5, y + 5, { align: 'right', width: colW[4] - 10 });
  y += 20;

  // Hàng số liệu
  doc.font('reg').fontSize(9).fillColor(C.ink);
  const items = invoice.items || [];
  items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.rect(left, y, contentW, 20).fill(C.zebra);
    }
    doc.fillColor(C.ink);
    doc.text(String(idx + 1), colX[0] + 5, y + 5);
    doc.text(item.name, colX[1] + 5, y + 5);
    doc.text(`${item.qty} ${item.unit || ''}`, colX[2] + 5, y + 5);
    doc.text(formatVnd(item.price), colX[3] + 5, y + 5);
    doc.text(formatVnd(item.total), colX[4] + 5, y + 5, { align: 'right', width: colW[4] - 10 });
    y += 20;
  });

  y += 10;
  doc.moveTo(left, y).lineTo(right, y).lineWidth(1).strokeColor(C.line).stroke();
  y += 8;

  // ---------- Tổng tiền ----------
  doc.font('bold').fontSize(11).fillColor(C.primary);
  doc.text('TỔNG CỘNG TIỀN CẦN THANH TOÁN:', left, y);
  doc.text(formatVnd(invoice.total), left, y, { align: 'right', width: contentW });

  // ---------- Đóng dấu thanh toán ----------
  if (invoice.status === 'paid') {
    let stampY = y + 35;
    if (stampY + 60 > doc.page.height - 40) {
      doc.addPage();
      stampY = doc.page.margins.top + 20;
    }
    // Vẽ khung dấu ĐÃ THANH TOÁN màu xanh lá
    const stampX = right - 180;
    doc.rect(stampX, stampY, 160, 48).dash(2, { space: 1 }).lineWidth(2).strokeColor(C.success).stroke();
    doc.fillColor(C.success).font('bold').fontSize(11);
    doc.text('✔ ĐÃ THANH TOÁN', stampX + 10, stampY + 8, { width: 140, align: 'center' });
    doc.font('reg').fontSize(7.5).fillColor(C.sub);
    doc.text(`Phương thức: ${invoice.paymentMethod === 'vnpay' ? 'Ví VNPay' : 'Tiền mặt'}`, stampX + 10, stampY + 22, { width: 140, align: 'center' });
    doc.text(`Thời gian: ${new Date(invoice.paidAt).toLocaleString('vi-VN')}`, stampX + 10, stampY + 32, { width: 140, align: 'center' });
  }

  doc.end();
}

export default { streamReportPdf, streamContractPdf, streamInvoicePdf, formatVnd };
