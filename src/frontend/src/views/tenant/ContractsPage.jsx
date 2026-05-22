import { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/useAuth.jsx';
import { contractService } from '../../services/contractService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { FileText, Eye, Info, Sparkles, RefreshCcw } from 'lucide-react';

export default function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContract, setActiveContract] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendTerm, setExtendTerm] = useState('6');
  const [requestSent, setRequestSent] = useState(false);

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
                onClick={() => alert('Đang hiển thị bản preview hợp đồng PDF dưới dạng mô phỏng')}
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
    </div>
  );
}
