import { useState, useEffect } from 'react';
import { Send, FileDown, Filter, X, Check, Loader2, CreditCard, Bell, Eye, CheckCircle2 } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge, Toast, Loading } from '../../components/common';
import { useInvoices } from '../../controllers/useInvoices.js';
import { useProperties } from '../../controllers/useProperties.js';
import { INVOICE_STATUS_META } from '../../models/Invoice.js';
import { formatCurrency, formatDate, formatPeriod } from '../../utils/format.js';

function BatchPublishModal({ onClose, onPublish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Đang kết nối cổng dữ liệu...');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let curr = 0;
    const timer = setInterval(() => {
      curr += 8;
      if (curr === 16) {
        setStatusText('BƯỚC 1: Quét số liệu điện nước & dịch vụ chốt cuối tháng...');
      } else if (curr === 48) {
        setStatusText('BƯỚC 2: Tính toán tự động giá thuê phòng, phụ phí điện nước lũy tiến...');
      } else if (curr === 72) {
        setStatusText('BƯỚC 3: Tạo hóa đơn nháp & thực hiện đối soát tự động...');
      } else if (curr === 88) {
        setStatusText('BƯỚC 4: Xuất bản hàng loạt & sẵn sàng gửi SMS/Zalo Brandname...');
      } else if (curr >= 100) {
        clearInterval(timer);
        setCompleted(true);
        setStatusText('Đã xuất bản thành công lô hóa đơn tháng này!');
      }
      setProgress(Math.min(curr, 100));
    }, 90);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-[fadeInScale_0.3s_ease-out] text-center">
        {!completed ? (
          <div className="space-y-4">
            <Loader2 size={36} className="mx-auto text-primary animate-spin" />
            <h3 className="text-lg font-bold text-ink">Tiến trình phát hành lô hóa đơn</h3>
            <p className="text-xs sm:text-sm text-ink-muted h-12 flex items-center justify-center px-2">{statusText}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-ink-muted font-mono">{progress}%</div>
          </div>
        ) : (
          <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="h-12 w-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold text-ink">Phát hành lô thành công!</h3>
            <p className="text-sm text-ink-muted">Toàn bộ hóa đơn chờ trong kỳ đã chuyển trạng thái sang "Chờ thanh toán" và gửi SMS/Zalo hóa đơn điện tử cho từng phòng.</p>
            <div className="pt-2">
              <Button className="w-full" onClick={onPublish}>Hoàn tất</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ViewReceiptModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-[fadeInScale_0.3s_ease-out] flex flex-col text-ink">
        <div className="flex justify-between items-center pb-3 border-b border-line mb-4">
          <h3 className="font-bold text-lg text-primary flex items-center gap-1.5"><CheckCircle2 className="text-success" size={20} /> Biên lai thu tiền</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-3.5 text-sm flex-1">
          <div className="text-center py-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <div className="text-xs font-semibold uppercase tracking-wider">Số tiền đã thu</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(invoice.total)}</div>
            <div className="text-xs text-emerald-600 mt-1">Giao dịch thành công qua Cổng thanh toán</div>
          </div>

          <div className="divide-y divide-line text-xs sm:text-sm">
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Mã hóa đơn</span>
              <span className="font-semibold text-ink">{invoice.code}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Khách thuê</span>
              <span className="font-semibold text-ink">{invoice.tenantId}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Số phòng</span>
              <span className="font-semibold text-ink">{invoice.roomId}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Kỳ hóa đơn</span>
              <span className="font-semibold text-ink">{formatPeriod(invoice.period)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Thời gian thu</span>
              <span className="font-semibold text-ink">{new Date().toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Phương thức thanh toán</span>
              <span className="font-semibold text-primary">Cổng ví điện tử liên kết</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-line mt-4 flex">
          <Button className="w-full" onClick={onClose}>Đóng biên lai</Button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const { data: initialInvoices = [], loading } = useInvoices();
  const { data: properties = [] } = useProperties();
  const [localInvoices, setLocalInvoices] = useState([]);
  
  const [tab, setTab] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('05/2026');
  const [branchFilter, setBranchFilter] = useState('all');
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Sync loaded invoices
  useEffect(() => {
    if (initialInvoices.length > 0 && localInvoices.length === 0) {
      setLocalInvoices(initialInvoices);
    }
  }, [initialInvoices, localInvoices]);

  const handleExportExcel = () => {
    setExcelLoading(true);
    setTimeout(() => {
      setExcelLoading(false);
      setToast({
        message: 'Đã xuất dữ liệu danh sách hóa đơn ra file Excel thành công!',
        type: 'success'
      });
    }, 600);
  };

  const handlePublishFinish = () => {
    // Modify any pending invoices to unpaid to simulate active billing release
    setLocalInvoices(prev => 
      prev.map(i => i.status === 'pending' ? { ...i, status: 'unpaid' } : i)
    );
    setShowPublishModal(false);
    setToast({
      message: 'Hệ thống đã phát hành đồng loạt và cập nhật trạng thái hóa đơn thành công!',
      type: 'success'
    });
  };

  const handleApprovePayment = (invoice) => {
    setLocalInvoices(prev => 
      prev.map(i => i.id === invoice.id ? { ...i, status: 'paid' } : i)
    );
    setToast({
      message: `Đã phê duyệt thu tiền cho hóa đơn "${invoice.code}" thành công!`,
      type: 'success'
    });
  };

  const handleSendReminder = (invoice) => {
    setToast({
      message: `Đã phát thông báo gửi nhắc thanh toán hóa đơn ${invoice.code} qua Zalo & SMS thành công!`,
      type: 'success'
    });
  };

  const handleToggleAdvancedFilters = () => {
    setShowAdvancedFilters(prev => !prev);
  };

  const handleResetFilters = () => {
    setMinAmount('');
    setMaxAmount('');
    setToast({
      message: 'Đã thiết lập lại bộ lọc nâng cao!',
      type: 'info'
    });
  };

  // Filter listings by period, branch, and status tabs
  const filtered = localInvoices
    .filter(i => {
      if (periodFilter === 'all') return true;
      const checkVal = periodFilter === '05/2026' ? '05/2026' : periodFilter === '04/2026' ? '04/2026' : '03/2026';
      return i.period === checkVal;
    })
    .filter(i => {
      if (branchFilter === 'all') return true;
      return i.propertyId === branchFilter;
    })
    .filter(i => {
      if (tab === 'all') return true;
      if (tab === 'pending') return i.status === 'pending' || i.status === 'unpaid';
      return i.status === tab;
    })
    .filter(i => {
      if (minAmount && i.total < parseFloat(minAmount)) return false;
      if (maxAmount && i.total > parseFloat(maxAmount)) return false;
      return true;
    });

  const counts = {
    all: localInvoices.length,
    pending: localInvoices.filter(i => i.status === 'pending' || i.status === 'unpaid').length,
    pending_cash: localInvoices.filter(i => i.status === 'pending_cash').length,
    paid: localInvoices.filter(i => i.status === 'paid').length,
    overdue: localInvoices.filter(i => i.status === 'overdue').length,
  };

  return (
    <>
      <PageHeader
        title="Hoá đơn"
        subtitle="Phát hành &amp; theo dõi hoá đơn cuối tháng"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              icon={<FileDown size={16} />}
              onClick={handleExportExcel}
              loading={excelLoading}
            >
              Xuất Excel
            </Button>
            <Button icon={<Send size={16} />} onClick={() => setShowPublishModal(true)}>Phát hành lô</Button>
          </div>
        }
      />

      <Card className="mb-4 animate-[fadeIn_0.3s_ease-out]" padded={false}>
        <div className="px-6 pt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all',          label: 'Tất cả',  count: counts.all },
              { value: 'pending',      label: 'Đang chờ', count: counts.pending },
              { value: 'pending_cash', label: 'Chờ xác nhận', count: counts.pending_cash },
              { value: 'paid',         label: 'Đã thanh toán', count: counts.paid },
              { value: 'overdue',      label: 'Quá hạn', count: counts.overdue },
            ]}
          />
        </div>
        <div className="p-4 border-b border-line bg-gray-50 flex flex-wrap gap-3 items-center">
          <select 
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full sm:w-44 h-10 px-3 bg-white border border-line rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="05/2026">Kỳ: Tháng 05/2026</option>
            <option value="04/2026">Kỳ: Tháng 04/2026</option>
            <option value="03/2026">Kỳ: Tháng 03/2026</option>
          </select>
          
          <select 
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full sm:w-44 h-10 px-3 bg-white border border-line rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">Cơ sở: Tất cả</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>

          <Button 
            variant="ghost" 
            icon={<Filter size={16} />} 
            onClick={handleToggleAdvancedFilters}
            className={showAdvancedFilters ? 'bg-primary-soft text-primary font-bold' : ''}
          >
            {showAdvancedFilters ? 'Đóng bộ lọc' : 'Lọc thêm'}
          </Button>
        </div>

        {/* Dynamic Premium Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="p-4 bg-gray-50/50 border-b border-line grid grid-cols-1 sm:grid-cols-3 gap-4 animate-[fadeIn_0.2s_ease-out]">
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase mb-1.5">Số tiền tối thiểu (đ)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="VD: 2000000"
                className="w-full h-9 px-3 bg-white border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-muted uppercase mb-1.5">Số tiền tối đa (đ)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="VD: 10000000"
                className="w-full h-9 px-3 bg-white border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button size="sm" variant="secondary" className="h-9 flex-1" onClick={handleResetFilters}>Thiết lập lại</Button>
              <div className="text-xs text-ink-muted pb-2 flex-1 text-right sm:text-left">Khớp: {filtered.length} kết quả</div>
            </div>
          </div>
        )}
      </Card>

      {loading && localInvoices.length === 0 ? <Loading /> : (
        <div className="animate-[fadeIn_0.3s_ease-out] border border-line rounded-3xl bg-white shadow-sm overflow-hidden">
          <Table
            columns={[
              { key: 'code',   header: 'Mã hoá đơn', render: (i) => <span className="font-semibold text-primary">{i.code}</span> },
              { key: 'tenant', header: 'Khách thuê', render: (i) => i.tenantId || 'Nguyễn Văn Hải' },
              { key: 'room',   header: 'Phòng',      render: (i) => i.roomId },
              { key: 'period', header: 'Kỳ',         render: (i) => formatPeriod(i.period) },
              { key: 'total',  header: 'Tổng tiền', className: 'text-right font-semibold text-ink', render: (i) => formatCurrency(i.total) },
              { key: 'due',    header: 'Hạn TT',     render: (i) => formatDate(i.dueDate) },
              { key: 'status', header: 'Trạng thái',
                render: (i) => {
                  const meta = INVOICE_STATUS_META[i.status] || { label: i.status, color: 'neutral' };
                  return <Badge color={meta.color}>{meta.label || 'Chờ gửi'}</Badge>;
                } 
              },
              { key: 'action', header: 'Thao tác', className: 'text-center',
                render: (i) => (
                  <div className="flex items-center justify-center gap-1.5">
                    {i.status === 'pending_cash' && (
                      <button
                        onClick={() => handleApprovePayment(i)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-success hover:text-white rounded-lg transition-all apple-press flex items-center gap-1 text-xs font-semibold"
                        title="Duyệt thu tiền mặt"
                      >
                        <CreditCard size={13} /> Duyệt thu
                      </button>
                    )}
                    {(i.status === 'unpaid' || i.status === 'overdue') && (
                      <button
                        onClick={() => handleSendReminder(i)}
                        className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg transition-all apple-press flex items-center gap-1 text-xs font-semibold"
                        title="Gửi nhắc nợ"
                      >
                        <Bell size={13} /> Nhắc nợ
                      </button>
                    )}
                    {i.status === 'paid' && (
                      <button
                        onClick={() => setViewingReceipt(i)}
                        className="p-1.5 bg-primary-soft text-primary hover:bg-primary hover:text-white rounded-lg transition-all apple-press flex items-center gap-1 text-xs font-semibold"
                        title="Xem biên lai"
                      >
                        <Eye size={13} /> Biên lai
                      </button>
                    )}
                  </div>
                )
              }
            ]}
            data={filtered}
            emptyText="Không tìm thấy hóa đơn phù hợp"
          />
        </div>
      )}

      {showPublishModal && (
        <BatchPublishModal
          onClose={() => setShowPublishModal(false)}
          onPublish={handlePublishFinish}
        />
      )}

      {viewingReceipt && (
        <ViewReceiptModal
          invoice={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
