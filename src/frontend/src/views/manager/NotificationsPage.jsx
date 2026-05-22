import { useState } from 'react';
import { Bell, FileText, Receipt, Users, AlertCircle, CheckCheck } from 'lucide-react';
import { PageHeader, Card, Tabs, Badge, Toast, Button } from '../../components/common';
import { formatRelative } from '../../utils/format.js';

const INITIAL_ITEMS = [
  { id: 1, type: 'contract', icon: FileText, title: 'Hợp đồng HD2025-002 cần ký gia hạn', body: 'Khách: Hoàng Thuỳ Linh — phòng 201', time: '2026-05-22T07:30:00Z', read: false, important: true },
  { id: 2, type: 'invoice', icon: Receipt, title: '39/40 hoá đơn tháng 05 đã phát hành', body: 'Còn 1 hoá đơn chưa hoàn tất chỉ số nước', time: '2026-05-21T22:00:00Z', read: false, important: false },
  { id: 3, type: 'visitor', icon: Users, title: 'Khách vãng lai đặt cọc phòng 103', body: 'Hồ Văn Khang đã đặt cọc 500.000đ — chờ ký hợp đồng', time: '2026-05-21T15:00:00Z', read: false, important: true },
  { id: 4, type: 'debt', icon: AlertCircle, title: 'Hoá đơn HD-202603-001 quá hạn 48 ngày', body: 'Khách: Hoàng Thuỳ Linh — cần gửi nhắc nợ', time: '2026-05-20T09:00:00Z', read: true, important: true },
  { id: 5, type: 'invoice', icon: Receipt, title: 'Thanh toán thành công hoá đơn HD-202604-001', body: 'Phạm Minh Đức — 5.136.000đ qua VNPay', time: '2026-05-02T10:14:00Z', read: true, important: false },
];

export default function ManagerNotificationsPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [tab, setTab] = useState('all');
  const [toast, setToast] = useState(null);

  const markAsRead = (id) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id && !i.read) {
          return { ...i, read: true };
        }
        return i;
      })
    );
  };

  const markAllAsRead = () => {
    const unreadCount = items.filter(i => !i.read).length;
    if (unreadCount === 0) {
      setToast({ message: 'Không có thông báo mới nào chưa đọc.', type: 'info' });
      return;
    }
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    setToast({ message: `Đã đánh dấu đọc toàn bộ ${unreadCount} thông báo mới!`, type: 'success' });
  };

  const filtered = items.filter((i) => {
    if (tab === 'unread') return !i.read;
    if (tab === 'important') return i.important;
    return true;
  });

  return (
    <>
      <PageHeader 
        title="Trung tâm thông báo" 
        subtitle="Hợp đồng, hoá đơn, đặt cọc, công nợ và các cảnh báo"
        actions={
          <Button 
            variant="secondary" 
            icon={<CheckCheck size={16} />} 
            onClick={markAllAsRead}
            className="apple-press text-sm"
          >
            Đánh dấu đọc tất cả
          </Button>
        }
      />

      <Card padded={false} className="mb-4 px-6 pt-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'Tất cả', count: items.length },
            { value: 'unread', label: 'Chưa đọc', count: items.filter((i) => !i.read).length },
            { value: 'important', label: 'Quan trọng', count: items.filter((i) => i.important).length },
          ]}
        />
      </Card>

      <Card padded={false}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-ink-muted">Không có thông báo nào trong danh mục này.</div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((n) => (
              <li 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={`p-4 flex gap-4 items-start hover:bg-gray-50/80 cursor-pointer transition-all duration-300 apple-press ${
                  !n.read ? 'bg-primary-soft/10 font-semibold' : ''
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'contract' ? 'bg-amber-50 text-warning' :
                  n.type === 'invoice' ? 'bg-sky-50 text-info' :
                  n.type === 'visitor' ? 'bg-green-50 text-success' :
                  'bg-red-50 text-danger'
                }`}>
                  <n.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm ${!n.read ? 'font-semibold text-ink' : 'text-ink font-normal'}`}>{n.title}</h4>
                    {n.important && <Badge color="warning">Quan trọng</Badge>}
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <p className="text-sm text-ink-muted mt-0.5">{n.body}</p>
                  <p className="text-xs text-ink-muted mt-1">{formatRelative(n.time)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Toast Alert */}
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
