import { useState, useEffect } from 'react';
import { useAuth } from '../../controllers/useAuth.jsx';
import { notificationService } from '../../services/notificationService.js';
import { formatRelative } from '../../utils/format.js';
import { Bell, Check, Inbox, FileText, Receipt, Shield, Award } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      notificationService.list(user.id).then(res => {
        setNotifications(res);
        setLoading(false);
      });
    }
  }, [user]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'invoice': return <Receipt size={16} className="text-primary" />;
      case 'contract': return <FileText size={16} className="text-amber-500" />;
      case 'system': return <Shield size={16} className="text-red-500" />;
      default: return <Bell size={16} className="text-sky-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-ink">Thông báo của tôi</h2>
          <p className="text-xs text-ink-muted mt-0.5">Hộp thư nhận các cập nhật quan trọng từ hệ thống.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
          >
            <Check size={14} /> Đọc tất cả
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-4 bg-white border rounded-2xl flex gap-3.5 shadow-card transition-all relative ${n.read ? 'border-line opacity-80' : 'border-primary ring-1 ring-primary/5'}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-gray-50' : 'bg-primary-soft'}`}>
              {getIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0 pr-3">
              <h4 className={`text-xs font-bold text-ink leading-snug ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title}</h4>
              <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">{n.body}</p>
              <span className="text-[9px] text-ink-muted block mt-2 font-medium">
                {formatRelative(n.createdAt)}
              </span>
            </div>
            {!n.read && (
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-line p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 border border-line rounded-2xl flex items-center justify-center mx-auto mb-4 text-ink-muted">
              <Inbox size={24} />
            </div>
            <h3 className="font-bold text-lg text-ink">Hộp thư trống</h3>
            <p className="text-sm text-ink-muted mt-2">Bạn không có thông báo mới nào từ hệ thống trọ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
