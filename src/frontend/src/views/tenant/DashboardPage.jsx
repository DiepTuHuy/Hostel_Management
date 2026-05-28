import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { invoiceService } from '../../services/invoiceService.js';
import { contractService } from '../../services/contractService.js';
import { notificationService } from '../../services/notificationService.js';
import { formatCurrency, formatPeriod, formatDate } from '../../utils/format.js';
import { Wallet, FileText, Bell, Zap, HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [contract, setContract] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        invoiceService.list({ tenantId: user.id }),
        contractService.list({ tenantId: user.id }),
        notificationService.list(user.id)
      ]).then(([invs, cons, notifs]) => {
        const unpaid = invs.find(i => i.status === 'pending' || i.status === 'overdue' || i.status === 'pending_cash');
        setInvoice(unpaid || invs[0] || null);
        setContract(cons[0] || null);
        setNotifications(notifs.slice(0, 3));
        setLoading(false);
      }).catch(err => {
        console.error('Lỗi khi tải thông tin dashboard:', err);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs text-white/70 block uppercase font-bold tracking-wider">Chào mừng quay lại</span>
          <h2 className="text-2xl font-extrabold mt-1">{user?.fullName}</h2>
          <p className="text-xs text-white/80 mt-1">
            Phòng {contract ? contract.roomId : '305'} · Cơ sở An Phú Quận 1
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {invoice && (
            <div className="bg-white rounded-3xl border border-line shadow-card overflow-hidden">
              <div className="p-6 bg-gradient-to-br from-primary via-primary-dark to-[#1B41AE] text-white relative shadow-inner">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Hoá đơn hiện tại</span>
                    <h3 className="text-lg font-bold mt-1">{formatPeriod(invoice.period)}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-green-500/20 text-green-300' : invoice.status === 'overdue' ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-white/20 text-white'}`}>
                    {invoice.statusMeta?.label}
                  </span>
                </div>
                
                <div className="mt-8 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-white/60 block uppercase tracking-wider">Tổng số tiền cần thanh toán</span>
                    <span className="text-3xl font-black">{formatCurrency(invoice.total)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/60 block uppercase tracking-wider">Hạn thanh toán</span>
                    <span className="text-xs font-bold">{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2.5 text-xs text-ink-muted">
                  {invoice.items.map(item => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span>{item.name} {item.qty > 1 && `(x${item.qty} ${item.unit})`}</span>
                      <span className="font-semibold text-ink">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>

                {invoice.status !== 'paid' && invoice.status !== 'pending_cash' ? (
                  <button
                    onClick={() => navigate(`/tenant/invoices?pay=${invoice.id}`)}
                    className="w-full h-12 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-[0px_4px_12px_rgba(58,91,199,0.3)] hover:bg-primary-dark transition-all duration-300 active:scale-[0.98]"
                  >
                    <Wallet size={16} /> Thanh toán ngay
                  </button>
                ) : invoice.status === 'pending_cash' ? (
                  <div className="w-full h-12 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs">
                    Chờ Quản lý xác nhận tiền mặt...
                  </div>
                ) : (
                  <div className="w-full h-12 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-bold flex items-center justify-center gap-2 text-xs">
                    Đã thanh toán hoàn tất
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                <Bell size={16} className="text-primary" /> Thông báo gần đây
              </h3>
              <Link to="/tenant/notifications" className="text-xs text-primary font-semibold hover:underline">Xem tất cả</Link>
            </div>
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="p-4 bg-white border border-line rounded-2xl flex gap-3 shadow-card hover:bg-gray-50 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${n.read ? 'bg-gray-300' : 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-ink leading-snug">{n.title}</h4>
                    <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-1">{n.body}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-6 bg-white border border-line rounded-2xl text-center text-xs text-ink-muted">
                  Không có thông báo mới.
                </div>
              )}
            </div>
          </div>

          {contract && (
            <div className="bg-white rounded-2xl border border-line p-5 shadow-card space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-ink flex items-center gap-1.5">
                  <FileText size={16} className="text-primary" /> Hợp đồng thuê của tôi
                </h3>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Đang hiệu lực
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-ink-muted block">Mã số hợp đồng</span>
                  <span className="font-semibold text-ink">{contract.code}</span>
                </div>
                <div>
                  <span className="text-ink-muted block">Thời hạn thuê</span>
                  <span className="font-semibold text-ink">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
                </div>
              </div>
              <Link to="/tenant/contracts" className="btn btn-secondary h-10 w-full rounded-xl font-bold flex items-center justify-center gap-2 text-xs">
                Xem chi tiết điều khoản hợp đồng
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
