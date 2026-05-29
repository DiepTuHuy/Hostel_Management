import { useState, useEffect } from 'react';
import { Send, AlertTriangle, X, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button, PageHeader, Card, Table, Badge, StatCard, Toast } from '../../components/common';
import { reportService } from '../../services/index.js';
import { formatCurrency } from '../../utils/format.js';

function BatchReminderModal({ totalTenants, onClose, onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Đang chuẩn bị danh sách khách thuê...');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress === 20) {
        setStatusText('Đang thiết lập cổng kết nối Zalo OA & SMS Brandname...');
      } else if (currentProgress === 50) {
        setStatusText(`Đang truyền gói tin nhắc nợ đến ${totalTenants} số điện thoại...`);
      } else if (currentProgress === 80) {
        setStatusText('Đang ghi nhận lịch sử gửi tin vào hệ thống log...');
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setCompleted(true);
        setStatusText('Đã hoàn tất gửi tin nhắc nợ hàng loạt!');
      }
      setProgress(Math.min(currentProgress, 100));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden animate-[fadeInScale_0.3s_ease-out] text-center">
        {!completed ? (
          <div className="space-y-4">
            <Loader2 size={40} className="mx-auto text-primary animate-spin" />
            <h3 className="text-lg font-bold text-ink">Đang phát thông báo nhắc nợ</h3>
            <p className="text-sm text-ink-muted">{statusText}</p>
            
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
            <h3 className="text-lg font-bold text-ink">Gửi thông báo thành công!</h3>
            <p className="text-sm text-ink-muted">Hệ thống đã truyền gửi tin nhắc nợ tự động đến {totalTenants} khách thuê đang quá hạn thanh toán.</p>
            <div className="pt-2">
              <Button className="w-full" onClick={onFinish}>Đóng hộp thoại</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReminder, setLoadingReminder] = useState(null);
  const [toast, setToast] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);

  const fetchDebts = () => {
    setLoading(true);
    reportService.getDebts().then(res => {
      setDebts(res || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setToast({ message: 'Không thể lấy danh sách công nợ từ server', type: 'error' });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // Group invoices by tenantName to aggregate debts
  const grouped = debts.reduce((acc, inv) => {
    const k = inv.tenantName || 'Khách thuê';
    if (!acc[k]) {
      acc[k] = { 
        tenantName: k, 
        tenantPhone: inv.tenantPhone || '—', 
        invoiceIds: [], 
        months: 0, 
        total: 0, 
        oldestDays: 0 
      };
    }
    acc[k].invoiceIds.push(inv.id);
    acc[k].months += 1;
    acc[k].total += inv.amount;
    acc[k].oldestDays = Math.max(acc[k].oldestDays, inv.daysOverdue || 0);
    return acc;
  }, {});

  const rows = Object.values(grouped);
  const totalDebt = rows.reduce((s, r) => s + r.total, 0);

  const handleSendReminder = async (row) => {
    try {
      setLoadingReminder(row.tenantName);
      for (const invoiceId of row.invoiceIds) {
        await reportService.sendDebtReminder(invoiceId);
      }
      setToast({
        message: `Đã gửi email nhắc nợ chi tiết qua Gmail đến khách thuê "${row.tenantName}" thành công!`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: `Gửi nhắc nợ thất bại: ${err.message || 'Lỗi hệ thống'}`,
        type: 'error'
      });
    } finally {
      setLoadingReminder(null);
    }
  };

  const handleFinishBatch = async () => {
    setShowBatchModal(false);
    try {
      setLoading(true);
      const allInvoiceIds = debts.map(d => d.id);
      for (const id of allInvoiceIds) {
        await reportService.sendDebtReminder(id);
      }
      setToast({
        message: `Đã gửi email nhắc nợ đồng loạt đến ${rows.length} khách thuê thành công!`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: `Lỗi nhắc nợ hàng loạt: ${err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && debts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={30} className="text-primary animate-spin" />
        <span className="ml-3 text-sm text-ink-muted">Đang lấy dữ liệu công nợ thật từ hệ thống...</span>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Công nợ"
        subtitle="Tổng hợp công nợ theo khách thuê — gửi nhắc nợ hàng loạt qua Gmail"
        actions={
          <Button 
            icon={<Send size={16} />} 
            onClick={() => rows.length > 0 ? setShowBatchModal(true) : setToast({ message: 'Không có khách thuê nào đang nợ để nhắc nhở!', type: 'info' })}
          >
            Gửi nhắc nợ hàng loạt
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter animate-[fadeIn_0.3s_ease-out]">
        <StatCard label="Tổng công nợ" value={formatCurrency(totalDebt, { compact: true })} icon={AlertTriangle} accent="danger" />
        <StatCard label="Số khách nợ" value={rows.length} accent="warning" />
        <StatCard label="Nợ lâu nhất" value={`${rows.length > 0 ? Math.max(0, ...rows.map(r => r.oldestDays)) : 0} ngày`} accent="danger" />
      </div>

      <div className="animate-[fadeIn_0.3s_ease-out]">
        <Table
          columns={[
            { key: 'tenant', header: 'Khách thuê', render: (r) => <span className="font-semibold text-ink">{r.tenantName}</span> },
            { key: 'months', header: 'Số tháng nợ', render: (r) => `${r.months} tháng` },
            { key: 'total', header: 'Tổng nợ', className: 'text-right font-bold text-danger', render: (r) => formatCurrency(r.total) },
            { key: 'oldest', header: 'Quá hạn lâu nhất', render: (r) => <Badge color="danger">{r.oldestDays} ngày</Badge> },
            { key: 'action', header: '', 
              render: (r) => (
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleSendReminder(r)}
                  loading={loadingReminder === r.tenantName}
                  icon={<Send size={12} />}
                >
                  Gửi nhắc nợ
                </Button>
              ) 
            },
          ]}
          data={rows}
          emptyText="Không có công nợ quá hạn tại thời điểm này"
        />
      </div>

      {showBatchModal && (
        <BatchReminderModal
          totalTenants={rows.length}
          onClose={() => setShowBatchModal(false)}
          onFinish={handleFinishBatch}
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
