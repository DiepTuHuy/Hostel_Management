import { useState, useEffect } from 'react';
import { Bell, FileText, Receipt, Users, AlertCircle, CheckCheck, Inbox } from 'lucide-react';
import { PageHeader, Card, Tabs, Badge, Toast, Button } from '../../components/common';
import { formatRelative } from '../../utils/format.js';

const INITIAL_ITEMS = [
  { id: '1', type: 'contract', title: 'Hợp đồng HD2025-002 cần ký gia hạn', body: 'Khách: Hoàng Thuỳ Linh — phòng 201', createdAt: '2026-05-22T07:30:00Z', read: false, important: true },
  { id: '2', type: 'invoice', title: '39/40 hoá đơn tháng 05 đã phát hành', body: 'Còn 1 hoá đơn chưa hoàn tất chỉ số nước', createdAt: '2026-05-21T22:00:00Z', read: false, important: false },
  { id: '3', type: 'visitor', title: 'Khách vãng lai đặt cọc phòng 103', body: 'Hồ Văn Khang đã đặt cọc 500.000đ — chờ ký hợp đồng', createdAt: '2026-05-21T15:00:00Z', read: false, important: true },
  { id: '4', type: 'debt', title: 'Hoá đơn HD-202603-001 quá hạn 48 ngày', body: 'Khách: Hoàng Thuỳ Linh — cần gửi nhắc nợ', createdAt: '2026-05-20T09:00:00Z', read: true, important: true },
  { id: '5', type: 'invoice', title: 'Thanh toán thành công hoá đơn HD-202604-001', body: 'Phạm Minh Đức — 5.136.000đ qua VNPay', createdAt: '2026-05-02T10:14:00Z', read: true, important: false },
];

export default function ManagerNotificationsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('bhpro_notifications_manager');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          setItems(INITIAL_ITEMS);
        }
      } else {
        setItems(INITIAL_ITEMS);
        localStorage.setItem('bhpro_notifications_manager', JSON.stringify(INITIAL_ITEMS));
      }
    };

    load();
    window.addEventListener('storage', load);
    window.addEventListener('notifications-update', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('notifications-update', load);
    };
  }, []);

  const saveNotifications = (newItems) => {
    setItems(newItems);
    localStorage.setItem('bhpro_notifications_manager', JSON.stringify(newItems));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('notifications-update'));
  };

  const markAsRead = (id) => {
    const newItems = items.map((i) => {
      if (i.id === id && !i.read) {
        return { ...i, read: true };
      }
      return i;
    });
    saveNotifications(newItems);
  };

  const markAllAsRead = () => {
    const unreadCount = items.filter(i => !i.read).length;
    if (unreadCount === 0) {
      setToast({ message: 'Không có thông báo mới nào chưa đọc.', type: 'info' });
      return;
    }
    const newItems = items.map((i) => ({ ...i, read: true }));
    saveNotifications(newItems);
    setToast({ message: `Đã đánh dấu đọc toàn bộ ${unreadCount} thông báo mới!`, type: 'success' });
  };

  const filtered = items.filter((i) => {
    if (tab === 'unread') return !i.read;
    if (tab === 'important') return i.important;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'contract': return <FileText size={20} />;
      case 'invoice': return <Receipt size={20} />;
      case 'visitor': return <Users size={20} />;
      case 'debt': return <AlertCircle size={20} />;
      default: return <Bell size={20} />;
    }
  };

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
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 border border-line rounded-2xl flex items-center justify-center mx-auto mb-4 text-ink-muted">
              <Inbox size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Hộp thư trống</h3>
            <p className="text-sm text-ink-muted mt-2">Không có thông báo nào trong danh mục này.</p>
          </div>
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
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm ${!n.read ? 'font-semibold text-ink' : 'text-ink font-normal'}`}>{n.title}</h4>
                    {n.important && <Badge color="warning">Quan trọng</Badge>}
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <p className="text-sm text-ink-muted mt-0.5">{n.body}</p>
                  <p className="text-xs text-ink-muted mt-1">{formatRelative(n.createdAt)}</p>
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
