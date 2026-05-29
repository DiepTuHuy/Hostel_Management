import { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/useAuth.jsx';
import { contractService } from '../../services/contractService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { FileText, Eye, Info, Sparkles, RefreshCcw, X, Download } from 'lucide-react';

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContract, setActiveContract] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendTerm, setExtendTerm] = useState('6');
  const [requestSent, setRequestSent] = useState(false);
  const [selectedPdfContract, setSelectedPdfContract] = useState(null);

  useEffect(() => {
    if (user) {
      contractService.list({ tenantId: user.id }).then(res => {
        setContracts(res);
        if (res.length > 0) setActiveContract(res[0]);
        setLoading(false);
      }).catch(err => {
        console.error('Lỗi khi tải danh sách hợp đồng:', err);
        setLoading(false);
      });
    }
  }, [user]);

  const handleExtendRequest = (e) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setShowExtendModal(false);
      alert('Đã gửi yêu cầu gia hạn đến Quản lý trọ thành công!');
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink">Hợp đồng của tôi</h2>
        <p className="text-xs text-ink-muted mt-0.5">Theo dõi lịch sử hợp đồng và thông tin điều khoản thuê phòng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map(c => (
          <div key={c.id} className={`bg-white rounded-2xl border p-5 shadow-card space-y-4 transition-all ${activeContract?.id === c.id ? 'border-primary ring-2 ring-primary/10' : 'border-line'}`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">{c.code}</h3>
                  <span className="text-[10px] text-ink-muted">Tạo ngày {formatDate(c.createdAt || c.startDate)}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {c.statusMeta?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-line text-xs">
              <div>
                <span className="text-ink-muted block">Tiền phòng hằng tháng</span>
                <span className="font-bold text-ink">{formatCurrency(c.monthlyRent)}</span>
              </div>
              <div>
                <span className="text-ink-muted block">Tiền đặt cọc</span>
                <span className="font-bold text-ink">{formatCurrency(c.deposit)}</span>
              </div>
              <div>
                <span className="text-ink-muted block">Ngày bắt đầu</span>
                <span className="font-semibold text-ink">{formatDate(c.startDate)}</span>
              </div>
              <div>
                <span className="text-ink-muted block">Ngày kết thúc</span>
                <span className="font-semibold text-ink">{formatDate(c.endDate)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-ink">Dịch vụ đi kèm:</h4>
              <div className="grid grid-cols-2 gap-1.5 text-ink-muted">
                {c.services.map(s => (
                  <div key={s.name} className="flex justify-between p-1.5 bg-gray-50 border border-line rounded-lg">
                    <span>{s.name}</span>
                    <span className="font-semibold text-ink">{formatCurrency(s.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedPdfContract(c)}
                className="flex-1 h-10 bg-gray-50 text-ink border border-line rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-gray-100 transition-colors"
              >
                <Eye size={14} /> Xem văn bản PDF
              </button>
              {c.status === 'active' && (
                <button
                  onClick={() => setShowExtendModal(true)}
                  className="flex-1 h-10 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs hover:bg-primary-dark transition-colors shadow-sm"
                >
                  <RefreshCcw size={14} /> Yêu cầu gia hạn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {contracts.length === 0 && (
        <div className="bg-white rounded-2xl border border-line p-10 text-center text-xs text-ink-muted">
          Không tìm thấy hợp đồng thuê nào của bạn.
        </div>
      )}

      {showExtendModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line p-6 max-w-sm w-full space-y-5 animate-fade-in shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-soft text-primary rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Gia hạn hợp đồng</h3>
                <p className="text-[10px] text-ink-muted">Yêu cầu gia hạn thời gian thuê của phòng trọ hiện tại</p>
              </div>
            </div>

            <form onSubmit={handleExtendRequest} className="space-y-4">
              <div>
                <label className="label">Chọn thời gian gia hạn thêm</label>
                <select
                  value={extendTerm}
                  onChange={e => setExtendTerm(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-xs font-semibold text-ink"
                >
                  <option value="3">Thêm 3 tháng</option>
                  <option value="6">Thêm 6 tháng (Khuyên dùng)</option>
                  <option value="12">Thêm 12 tháng</option>
                </select>
              </div>

              <div className="p-3 bg-gray-50 border border-line rounded-xl flex gap-2 text-[10px] text-ink-muted leading-relaxed">
                <Info size={14} className="shrink-0 text-primary mt-0.5" />
                <span>Yêu cầu này sẽ được gửi đến Quản lý cơ sở để cập nhật hợp đồng phụ lục mới và gửi lại bạn để ký số.</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="flex-1 h-10 bg-white border border-line text-ink rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={requestSent}
                  className="flex-1 h-10 bg-primary text-white rounded-xl text-xs font-bold flex items-center justify-center"
                >
                  {requestSent ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPdfContract && (
        <ViewPdfModal 
          contract={selectedPdfContract}
          onClose={() => setSelectedPdfContract(null)}
          onDownload={handleDownloadPdf}
        />
      )}
    </div>
  );
}

// Handle real PDF print & download inside viewer via dynamic iframe
const handleDownloadPdf = (contractCode) => {
  const printContent = document.getElementById('contract-print-area');
  if (!printContent) {
    window.print();
    return;
  }

  // Tạo một iframe ẩn tạm thời để in riêng nội dung hợp đồng sạch sẽ, tránh lẫn giao diện web
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Hop_Dong_${contractCode}</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            padding: 3rem;
            background-color: white;
          }
          .text-primary {
            color: #2563eb;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              size: A4;
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="max-w-2xl mx-auto">
          ${printContent.innerHTML}
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.frameElement.remove();
            }, 200);
          }
        </script>
      </body>
    </html>
  `);
  doc.close();
};

// Beautiful PDF Viewer Drawer with simulated signatures and progress
function ViewPdfModal({ contract, onClose, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      onDownload(contract.code);
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out] flex flex-col">
        {/* Drawer Header */}
        <div className="p-4 border-b border-line flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="text-red-500" size={24} />
            <div>
              <h2 className="text-base font-bold text-ink">Bản xem trước Hợp đồng ký số</h2>
              <p className="text-xs text-ink-muted">Mã tài liệu: {contract.code}.pdf</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadClick}
              disabled={downloading}
              className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50"
            >
              {downloading ? 'Đang chuẩn bị...' : 'Tải PDF'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl text-ink-muted transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Paper Contract Simulator View */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[calc(90vh-8rem)] bg-gray-100 text-gray-800 text-sm font-serif leading-relaxed">
          <div id="contract-print-area" className="max-w-2xl mx-auto bg-white p-12 shadow-md border border-line/60 rounded-sm relative min-h-[800px]">
            {/* National Title */}
            <div className="text-center font-bold font-sans tracking-wide mb-6">
              <p className="text-base">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-sm">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-40 h-[1.5px] bg-black mx-auto mt-2" />
            </div>

            {/* Document Title */}
            <div className="text-center font-bold font-sans text-lg my-8 tracking-wider uppercase">
              HỢP ĐỒNG THUÊ PHÒNG TRỌ CHI TIẾT
            </div>

            {/* Contract content */}
            <div className="space-y-4 font-sans text-xs sm:text-sm">
              <p>Hôm nay, ngày {new Date(contract.startDate).toLocaleDateString('vi-VN')}, chúng tôi gồm:</p>
              <div>
                <p className="font-bold">BÊN CHO THUÊ (BÊN A): BAN QUẢN TRỊ BOARDINGHOUSE GROUP</p>
                <p>Địa chỉ văn phòng: 123 Nguyễn Thị Minh Khai, Bến Thành, Quận 1, TP. HCM</p>
                <p>Đại diện pháp lý: Ông Nguyễn Văn Admin - Chức vụ: Giám đốc Chuỗi cơ sở</p>
              </div>

              <div>
                <p className="font-bold">BÊN THUÊ PHÒNG (BÊN B): KHÁCH HÀNG THUÊ TRỌ</p>
                <p>Họ và tên khách thuê: <span className="font-bold text-black border-b border-dashed border-gray-400 px-1">{contract.tenantId || 'Phạm Minh Đức'}</span></p>
                <p>Số điện thoại: {contract.tenantPhone || '098xxxxxxx'} — Mã căn hộ: {contract.roomId || '101'}</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black">Điều 1: Phòng thuê và Thời hạn</p>
                <p>1. Bên A đồng ý cho Bên B thuê phòng số {contract.roomId} tại cơ sở để cư trú phục vụ đời sống.</p>
                <p>2. Thời gian thuê hợp đồng là 01 năm, tính từ ngày <span className="font-semibold">{formatDate(contract.startDate)}</span> đến hết ngày <span className="font-semibold">{formatDate(contract.endDate)}</span>.</p>
              </div>

              <div>
                <p className="font-bold uppercase text-black">Điều 2: Giá thuê và Phương thức thanh toán</p>
                <p>1. Tiền thuê phòng cố định mỗi tháng là: <span className="font-bold text-primary">{formatCurrency(contract.monthlyRent)}/tháng</span>.</p>
                <p>2. Tiền cọc giữ phòng Bên B bàn giao cho Bên A là: <span className="font-semibold">{formatCurrency(contract.deposit)}</span> (sẽ được hoàn trả đầy đủ sau khi hết hạn thuê phòng nếu không gây hư hại).</p>
                <p>3. Tiền phòng thanh toán từ ngày 01 đến ngày 05 đầu tháng qua chuyển khoản ngân hàng hoặc ví VNPAY/MoMo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
