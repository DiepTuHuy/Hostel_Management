import { useState, useEffect } from 'react';
import { Check, X, Upload, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Modal, Input, Toast } from '../../components/common';
import { useInvoices } from '../../controllers/useInvoices.js';
import { invoiceService } from '../../services/index.js';
import { formatCurrency, formatPeriod } from '../../utils/format.js';

export default function CashReceiptsPage() {
  const [propertyId, setPropertyId] = useState(localStorage.getItem('bhpro_selected_property_id') || '');

  useEffect(() => {
    const handlePropertyChange = () => {
      const activeId = localStorage.getItem('bhpro_selected_property_id') || '';
      setPropertyId(activeId);
    };
    window.addEventListener('bhpro_property_changed', handlePropertyChange);
    return () => {
      window.removeEventListener('bhpro_property_changed', handlePropertyChange);
    };
  }, []);

  const { data: fetchedInvoices = [], loading } = useInvoices({ status: 'pending_cash', propertyId });
  const [invoices, setInvoices] = useState([]);
  
  // State for Toast alerts
  const [toast, setToast] = useState(null);
  
  // State for confirm modal
  const [confirmInvoice, setConfirmInvoice] = useState(null);
  const [actualDate, setActualDate] = useState('2026-05-22');
  const [actualAmount, setActualAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState('');
  
  // State for reject modal
  const [rejectInvoice, setRejectInvoice] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Sync fetched invoices to local state
  useEffect(() => {
    if (!loading) {
      setInvoices(fetchedInvoices || []);
    }
  }, [fetchedInvoices, loading]);

  // Set default amount when modal opens
  useEffect(() => {
    if (confirmInvoice) {
      setActualAmount(confirmInvoice.total);
      setActualDate('2026-05-22');
      setReceiptFile('');
    }
  }, [confirmInvoice]);

  const handleOpenConfirm = (inv) => {
    setConfirmInvoice(inv);
  };

  const handleOpenReject = (inv) => {
    setRejectInvoice(inv);
    setRejectReason('');
  };

  const handleConfirmSubmit = async () => {
    if (!actualAmount) {
      setToast({ message: 'Vui lòng nhập số tiền thực nhận', type: 'error' });
      return;
    }
    
    try {
      await invoiceService.payWithCash(confirmInvoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== confirmInvoice.id));
      setToast({
        message: `Xác nhận đã thu thành công ${formatCurrency(parseFloat(actualAmount))} tiền mặt cho hoá đơn ${confirmInvoice.code}!`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Lỗi hệ thống khi xác thực tiền mặt', type: 'error' });
    }
    setConfirmInvoice(null);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setToast({ message: 'Vui lòng nhập lý do từ chối', type: 'error' });
      return;
    }

    try {
      await invoiceService.rejectCash(rejectInvoice.id);
      setInvoices((prev) => prev.filter((i) => i.id !== rejectInvoice.id));
      setToast({
        message: `Đã từ chối xác nhận thanh toán hoá đơn ${rejectInvoice.code}. Lý do: ${rejectReason}`,
        type: 'warning'
      });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Lỗi hệ thống khi từ chối thanh toán', type: 'error' });
    }
    setRejectInvoice(null);
  };

  const simulateUpload = () => {
    if (confirmInvoice) {
      setReceiptFile(`bien_lai_${confirmInvoice.code}_${Date.now().toString().slice(-4)}.png`);
      setToast({ message: 'Đã giả lập tải lên biên lai thành công!', type: 'info' });
    }
  };

  return (
    <>
      <PageHeader
        title="Xác nhận thu tiền mặt"
        subtitle="Các khoản tiền mặt đang chờ Quản lý xác nhận đã thu"
      />

      <div className="space-y-3">
        {loading && invoices.length === 0 ? (
          <Card><p className="text-center text-ink-muted py-8">Đang tải danh sách hoá đơn...</p></Card>
        ) : invoices.length === 0 ? (
          <Card><p className="text-center text-ink-muted py-8">Hiện chưa có hoá đơn nào chờ xác nhận tiền mặt</p></Card>
        ) : (
          invoices.map((inv) => (
            <Card key={inv.id} className="transition-all duration-300 hover:shadow-md apple-card-hover">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-50 text-warning flex items-center justify-center font-bold">{inv.code.slice(-3)}</div>
                  <div>
                    <div className="font-semibold text-ink">{inv.code}</div>
                    <div className="text-sm text-ink-muted">Khách: {inv.tenantId} · Phòng {inv.roomId} · {formatPeriod(inv.period)}</div>
                    <Badge color="warning" className="mt-1">Chờ xác nhận tiền mặt</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink">{formatCurrency(inv.total)}</div>
                  <div className="text-xs text-ink-muted">Phương thức: {inv.paymentMethod}</div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    variant="secondary" 
                    icon={<X size={16} />} 
                    className="apple-press hover:bg-red-50 hover:text-danger hover:border-red-200 transition-colors"
                    onClick={() => handleOpenReject(inv)}
                  >
                    Từ chối
                  </Button>
                  <Button 
                    icon={<Check size={16} />}
                    className="apple-press transition-transform"
                    onClick={() => handleOpenConfirm(inv)}
                  >
                    Xác nhận đã thu
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-gutter bg-blue-50/30 border-blue-100 p-6 rounded-2xl">
        <h3 className="text-title-lg font-semibold text-ink mb-2">Quy trình xác nhận</h3>
        <p className="text-sm text-ink-muted leading-relaxed">
          Khi xác nhận, hãy chọn ngày thực thu, nhập số tiền thực nhận và tải lên ảnh biên lai (nếu có).
          Trạng thái hoá đơn sẽ tự động chuyển sang <strong className="text-success">Đã thanh toán</strong> và hệ thống tự động ghi nhận doanh thu thực tế.
        </p>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        open={!!confirmInvoice}
        onClose={() => setConfirmInvoice(null)}
        title="Xác nhận đã nhận tiền mặt"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmInvoice(null)} className="apple-press">Huỷ</Button>
            <Button onClick={handleConfirmSubmit} className="apple-press">Xác thực đã thu</Button>
          </>
        }
      >
        {confirmInvoice && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl mb-2">
              <div className="flex justify-between items-center text-sm border-b border-line pb-2 mb-2">
                <span className="text-ink-muted">Mã hoá đơn:</span>
                <span className="font-semibold text-ink">{confirmInvoice.code}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Tổng số tiền cần thu:</span>
                <span className="font-bold text-primary text-base">{formatCurrency(confirmInvoice.total)}</span>
              </div>
            </div>

            <Input
              type="date"
              label="Ngày thực nhận"
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
              prefix={<Calendar size={16} className="mt-0.5" />}
            />

            <Input
              type="number"
              label="Số tiền thực tế đã thu"
              value={actualAmount}
              onChange={(e) => setActualAmount(e.target.value)}
              prefix={<DollarSign size={16} className="mt-0.5" />}
              helper="Mặc định là toàn bộ giá trị hoá đơn."
            />

            <div>
              <label className="label">Biên nhận / Ảnh hoá đơn</label>
              <div 
                onClick={simulateUpload}
                className="border-2 border-dashed border-line hover:border-primary bg-gray-50/50 hover:bg-primary-soft/20 rounded-xl p-6 text-center cursor-pointer transition-all duration-300"
              >
                {receiptFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="text-success animate-apple-pop" size={32} />
                    <span className="text-sm font-semibold text-ink">{receiptFile}</span>
                    <span className="text-xs text-ink-muted">Nhấp để tải lên tệp khác</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-ink-muted" size={24} />
                    <span className="text-sm font-medium text-ink">Bấm vào đây để giả lập tải ảnh biên lai</span>
                    <span className="text-xs text-ink-muted">Hỗ trợ PNG, JPG, PDF tối đa 5MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        open={!!rejectInvoice}
        onClose={() => setRejectInvoice(null)}
        title="Từ chối xác nhận tiền mặt"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectInvoice(null)} className="apple-press">Bỏ qua</Button>
            <Button variant="danger" onClick={handleRejectSubmit} className="apple-press">Từ chối thanh toán</Button>
          </>
        }
      >
        {rejectInvoice && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50/30 border border-red-100 rounded-xl">
              <p className="text-sm text-ink-muted">
                Bạn đang thực hiện từ chối xác nhận thanh toán tiền mặt cho hoá đơn <strong className="text-ink font-semibold">{rejectInvoice.code}</strong> số tiền <strong className="text-danger font-semibold">{formatCurrency(rejectInvoice.total)}</strong>.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <label className="label">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (ví dụ: Khách chưa chuyển khoản đủ, sai số tiền, ...)"
                className="w-full min-h-[100px] input py-2.5 resize-none focus:ring-danger/20 focus:border-danger"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Floating Apple-Style Toast */}
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
