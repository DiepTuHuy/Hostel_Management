import { useState, useEffect } from 'react';
import { Bell, FileText, Receipt, Shield, AlertCircle, CheckCheck, Inbox } from 'lucide-react';
import { PageHeader, Card, Tabs, Badge, Toast, Button } from '../../components/common';
import { formatRelative } from '../../utils/format.js';

const INITIAL_ADMIN_NOTIFICATIONS = [
  { id: '1', type: 'system', title: 'Hệ thống phát hiện truy cập bất thường', body: 'IP: 192.168.1.105 đăng nhập tài khoản Manager thất bại 5 lần', createdAt: '2026-05-22T08:15:00Z', read: false, important: true },
  { id: '2', type: 'invoice', title: 'Doanh thu tháng 05 đạt mốc 380Mđ', body: 'Tăng trưởng 12.5% so với tháng trước', createdAt: '2026-05-22T00:00:00Z', read: false, important: false },
  { id: '3', type: 'contract', title: 'Cảnh báo 12 hợp đồng sắp hết hạn trong 30 ngày', body: 'Yêu cầu các Manager kiểm tra và gửi yêu cầu ký gia hạn', createdAt: '2026-05-21T10:00:00Z', read: false, important: true },
  { id: '4', type: 'debt', title: 'Tổng công nợ quá hạn vượt ngưỡng 5Mđ', body: 'Cơ sở Quận 1 và Bình Thạnh có tỷ lệ trễ hạn cao nhất', createdAt: '2026-05-20T14:30:00Z', read: true, important: true },
  { id: '5', type: 'system', title: 'Bản sao lưu dữ liệu tự động hoàn tất', body: 'Dung lượng 145MB sao lưu thành công lên Cloud Storage', createdAt: '2026-05-19T23:00:00Z', read: true, important: false },
];

export default function AdminNotificationsPage() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('bhpro_notifications_admin');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          setItems(INITIAL_ADMIN_NOTIFICATIONS);
        }
      } else {
        setItems(INITIAL_ADMIN_NOTIFICATIONS);
        localStorage.setItem('bhpro_notifications_admin', JSON.stringify(INITIAL_ADMIN_NOTIFICATIONS));
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
    localStorage.setItem('bhpro_notifications_admin', JSON.stringify(newItems));
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
      case 'system': return <Shield size={20} />;
      case 'contract': return <FileText size={20} />;
      case 'invoice': return <Receipt size={20} />;
      case 'debt': return <AlertCircle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <>
      <PageHeader 
        title="Trung tâm thông báo" 
        subtitle="Quản trị hệ thống, hiệu suất kinh doanh, hợp đồng và công nợ"
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
                className={`p-4 flex gap-4 items-start hover:bg-gray-50/85 cursor-pointer transition-all duration-200 apple-press ${
                  !n.read ? 'bg-primary-soft/10 font-semibold' : ''
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'system' ? 'bg-red-50 text-danger' :
                  n.type === 'contract' ? 'bg-amber-50 text-warning' :
                  n.type === 'invoice' ? 'bg-sky-50 text-info' :
                  n.type === 'debt' ? 'bg-rose-50 text-rose-600' :
                  'bg-primary-soft text-primary'
                }`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-sm ${!n.read ? 'font-semibold text-ink' : 'text-ink font-normal'}`}>{n.title}</h4>
                    {n.important && <Badge color="warning">Quan trọng</Badge>}
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-ink-muted mt-1">{formatRelative(n.createdAt)}</p>
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
