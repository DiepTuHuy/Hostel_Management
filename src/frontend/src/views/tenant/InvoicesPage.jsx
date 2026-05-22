import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { invoiceService } from '../../services/invoiceService.js';
import { formatCurrency, formatPeriod, formatDate } from '../../utils/format.js';
import { FileText, ChevronRight, Zap, CheckCircle2, AlertCircle, Calendar, CreditCard, ChevronDown, Check } from 'lucide-react';

export default function InvoicesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unpaid');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState(1);
  const [payMethod, setPayMethod] = useState('vnpay');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (user) {
      invoiceService.list({ tenantId: user.id }).then(res => {
        setInvoices(res);
        const urlPayId = searchParams.get('pay');
        if (urlPayId) {
          const inv = res.find(i => i.id === urlPayId);
          if (inv) {
            setSelectedInvoice(inv);
            setShowPayModal(true);
          }
        } else if (res.length > 0) {
          setSelectedInvoice(res[0]);
        }
        setLoading(false);
      });
    }
  }, [user, searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filtered = invoices.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return i.status === 'paid';
    return i.status === 'pending' || i.status === 'overdue' || i.status === 'pending_cash';
  });

  const handleSelectInvoice = (inv) => {
    setSelectedInvoice(inv);
    setSearchParams({});
  };

  const handleOpenPay = () => {
    setPayStep(1);
    setShowPayModal(true);
  };

  const handlePaymentSubmit = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      if (payMethod === 'cash') {
        setSelectedInvoice(prev => ({ ...prev, status: 'pending_cash' }));
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'pending_cash' } : inv));
        setPayStep(3);
      } else {
        setSelectedInvoice(prev => ({ ...prev, status: 'paid', paidAt: new Date().toISOString(), paymentMethod: payMethod }));
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'paid', paidAt: new Date().toISOString(), paymentMethod: payMethod } : inv));
        setPayStep(3);
      }
    }, 1500);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-ink">Danh sách hoá đơn</h2>
          <p className="text-xs text-ink-muted mt-0.5">Quản lý và thanh toán các hoá đơn dịch vụ định kỳ.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => handleTabChange('unpaid')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === 'unpaid' ? 'bg-white text-primary shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
          Chưa thanh toán
        </button>
        <button
          onClick={() => handleTabChange('paid')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === 'paid' ? 'bg-white text-primary shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
          Đã thanh toán
        </button>
        <button
          onClick={() => handleTabChange('all')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-primary shadow-sm' : 'text-ink-muted hover:text-ink'}`}
        >
          Tất cả
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(i => (
          <div
            key={i.id}
            onClick={() => handleSelectInvoice(i)}
            className={`p-4 rounded-2xl border text-left cursor-pointer transition-all flex justify-between items-center ${selectedInvoice?.id === i.id ? 'bg-white border-primary shadow-elevated ring-1 ring-primary/5' : 'bg-white border-line hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i.status === 'paid' ? 'bg-green-50 text-green-600' : i.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-primary-soft text-primary'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink">{formatPeriod(i.period)}</h4>
                <p className="text-[10px] text-ink-muted mt-0.5">Hạn đóng: {formatDate(i.dueDate)}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-2">
              <div>
                <span className="text-sm font-extrabold text-ink block">{formatCurrency(i.total)}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${i.status === 'paid' ? 'bg-green-50 text-green-700' : i.status === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {i.statusMeta?.label}
                </span>
              </div>
              <ChevronRight size={16} className="text-ink-muted" />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 bg-white border border-line rounded-2xl text-center text-xs text-ink-muted">
            Không tìm thấy hoá đơn nào.
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div className="bg-white rounded-2xl border border-line p-5 shadow-card space-y-4">
          <div className="border-b border-line pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-ink">Chi tiết hoá đơn {selectedInvoice.code}</h3>
              <p className="text-[10px] text-ink-muted">Kỳ thu tiền: {formatPeriod(selectedInvoice.period)}</p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${selectedInvoice.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {selectedInvoice.statusMeta?.label}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {selectedInvoice.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-ink-muted">{item.name} {item.qty > 1 && `(x${item.qty} ${item.unit})`}</span>
                <span className="font-semibold text-ink">{formatCurrency(item.total)}</span>
              </div>
            ))}
          </div>

          {selectedInvoice.meterReadings && (
            <div className="bg-gray-50 border border-line rounded-xl p-3 space-y-2 text-[11px]">
              <div className="font-bold text-ink flex items-center gap-1">
                <Zap size={14} className="text-primary" /> Chỉ số điện nước tiêu thụ
              </div>
              <div className="grid grid-cols-2 gap-4 text-ink-muted">
                {selectedInvoice.meterReadings.electricity && (
                  <div>
                    <span className="block font-medium">Chỉ số điện:</span>
                    <span>{selectedInvoice.meterReadings.electricity.previous} kWh → {selectedInvoice.meterReadings.electricity.current} kWh ({selectedInvoice.meterReadings.electricity.current - selectedInvoice.meterReadings.electricity.previous} kWh)</span>
                  </div>
                )}
                {selectedInvoice.meterReadings.water && (
                  <div>
                    <span className="block font-medium">Chỉ số nước:</span>
                    <span>{selectedInvoice.meterReadings.water.previous} m³ → {selectedInvoice.meterReadings.water.current} m³ ({selectedInvoice.meterReadings.water.current - selectedInvoice.meterReadings.water.previous} m³)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t border-line pt-3 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-ink-muted block leading-none">Tổng cộng chi phí</span>
              <span className="text-xl font-extrabold text-primary">{formatCurrency(selectedInvoice.total)}</span>
            </div>

            {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'pending_cash' ? (
              <button
                onClick={handleOpenPay}
                className="btn btn-primary btn-md rounded-xl font-bold px-5 flex items-center justify-center shadow-md transition-all active:scale-98"
              >
                Thanh toán ngay
              </button>
            ) : selectedInvoice.status === 'pending_cash' ? (
              <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                Đang chờ xác nhận
              </span>
            ) : (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-semibold">
                Đã thanh toán
              </span>
            )}
          </div>
        </div>
      )}

      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-line p-6 max-w-sm w-full space-y-5 animate-fade-in shadow-elevated">
            
            {payStep === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-ink">Chọn phương thức thanh toán</h3>
                  <button onClick={() => setShowPayModal(false)} className="text-xs text-ink-muted hover:text-ink font-semibold">Đóng</button>
                </div>
                <div className="space-y-2">
                  <button onClick={() => setPayMethod('vnpay')} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${payMethod === 'vnpay' ? 'bg-primary-soft text-primary border-primary' : 'bg-gray-50 text-ink border-line hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <div>
                        <div className="text-xs font-bold">Thanh toán ví VNPay</div>
                        <div className="text-[9px] text-ink-muted">Tự động đối soát realtime</div>
                      </div>
                    </div>
                    {payMethod === 'vnpay' && <Check size={14} />}
                  </button>

                  <button onClick={() => setPayMethod('momo')} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${payMethod === 'momo' ? 'bg-primary-soft text-primary border-primary' : 'bg-gray-50 text-ink border-line hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <div>
                        <div className="text-xs font-bold">Thanh toán ví MoMo</div>
                        <div className="text-[9px] text-ink-muted">Xử lý nhanh chóng bảo mật</div>
                      </div>
                    </div>
                    {payMethod === 'momo' && <Check size={14} />}
                  </button>

                  <button onClick={() => setPayMethod('cash')} className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${payMethod === 'cash' ? 'bg-primary-soft text-primary border-primary' : 'bg-gray-50 text-ink border-line hover:bg-gray-100'}`}>
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} />
                      <div>
                        <div className="text-xs font-bold">Trả tiền mặt trực tiếp</div>
                        <div className="text-[9px] text-ink-muted">Đưa cho Quản lý chi nhánh xác nhận</div>
                      </div>
                    </div>
                    {payMethod === 'cash' && <Check size={14} />}
                  </button>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-line pt-3">
                  <span className="text-ink-muted">Số tiền cần đóng:</span>
                  <span className="font-extrabold text-primary text-base">{formatCurrency(selectedInvoice.total)}</span>
                </div>

                <button
                  onClick={() => setPayStep(2)}
                  className="btn btn-primary h-11 w-full rounded-xl font-bold flex items-center justify-center"
                >
                  Xác nhận phương thức
                </button>
              </div>
            )}

            {payStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-ink">Xác nhận thanh toán</h3>
                <p className="text-xs text-ink-muted">
                  {payMethod === 'cash'
                    ? 'Bạn xác nhận sẽ trả bằng tiền mặt cho quản lý trọ? Hoá đơn sẽ chuyển sang trạng thái chờ xác nhận tiền mặt.'
                    : `Hệ thống sẽ kết nối đến cổng thanh toán trực tuyến ${payMethod.toUpperCase()} để hoàn tất thanh toán.`}
                </p>

                <div className="border border-line rounded-xl p-3 bg-gray-50 text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-ink-muted">Hoá đơn kỳ:</span> <span className="font-semibold text-ink">{formatPeriod(selectedInvoice.period)}</span></div>
                  <div className="flex justify-between"><span className="text-ink-muted">Tổng cộng:</span> <span className="font-bold text-primary">{formatCurrency(selectedInvoice.total)}</span></div>
                </div>

                <button
                  onClick={handlePaymentSubmit}
                  disabled={paying}
                  className="btn btn-primary h-11 w-full rounded-xl font-bold flex items-center justify-center"
                >
                  {paying ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Xác nhận ngay'}
                </button>
                <button
                  onClick={() => setPayStep(1)}
                  disabled={paying}
                  className="btn btn-secondary h-11 w-full rounded-xl font-bold"
                >
                  Quay lại
                </button>
              </div>
            )}

            {payStep === 3 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-ink">Gửi thông tin thành công</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    {payMethod === 'cash'
                      ? 'Vui lòng bàn giao tiền mặt trực tiếp cho quản lý cơ sở để xác nhận hoàn tất thanh toán trên hệ thống.'
                      : 'Giao dịch qua ví điện tử đã được đối soát thành công. Cảm ơn bạn!'}
                  </p>
                </div>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="btn btn-primary h-10 w-full rounded-xl font-bold text-xs"
                >
                  Đóng
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
