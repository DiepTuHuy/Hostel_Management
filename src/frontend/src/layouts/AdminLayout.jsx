import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, Receipt,
  Wallet, Settings2, BarChart3, Settings, LogOut, Bell, Search, HelpCircle, Menu, X,
  Shield, AlertCircle
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { cn } from '../utils/cn.js';
import { AIChatbot } from '../components/common';

const NAV = [
  { to: '/admin',             label: 'Tổng quan',         icon: LayoutDashboard, end: true },
  { to: '/admin/branches',    label: 'Nhà trọ & chi nhánh', icon: Building2 },
  { to: '/admin/users',       label: 'Người dùng',        icon: Users },
  { to: '/admin/contracts',   label: 'Hợp đồng',          icon: FileText },
  { to: '/admin/invoices',    label: 'Hoá đơn',           icon: Receipt },
  { to: '/admin/debts',       label: 'Công nợ',           icon: Wallet },
  { to: '/admin/services',    label: 'Dịch vụ & đơn giá', icon: Settings2 },
  { to: '/admin/reports',     label: 'Báo cáo & thống kê', icon: BarChart3 },
  { to: '/admin/settings',    label: 'Cài đặt',           icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0
  });

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('.active');
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          top: activeEl.offsetTop,
          width: activeEl.offsetWidth,
          height: activeEl.offsetHeight,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    const saved = localStorage.getItem('bhpro_notifications_admin');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      const MOCK_ADMIN_NOTIFICATIONS = [
        { id: '1', type: 'system', title: 'Hệ thống phát hiện truy cập bất thường', body: 'IP: 192.168.1.105 đăng nhập tài khoản Manager thất bại 5 lần', createdAt: '2026-05-22T08:15:00Z', read: false, important: true },
        { id: '2', type: 'invoice', title: 'Doanh thu tháng 05 đạt mốc 380Mđ', body: 'Tăng trưởng 12.5% so với tháng trước', createdAt: '2026-05-22T00:00:00Z', read: false, important: false },
        { id: '3', type: 'contract', title: 'Cảnh báo 12 hợp đồng sắp hết hạn trong 30 ngày', body: 'Yêu cầu các Manager kiểm tra và gửi yêu cầu ký gia hạn', createdAt: '2026-05-21T10:00:00Z', read: false, important: true },
        { id: '4', type: 'debt', title: 'Tổng công nợ quá hạn vượt ngưỡng 5Mđ', body: 'Cơ sở Quận 1 và Bình Thạnh có tỷ lệ trễ hạn cao nhất', createdAt: '2026-05-20T14:30:00Z', read: true, important: true },
        { id: '5', type: 'system', title: 'Bản sao lưu dữ liệu tự động hoàn tất', body: 'Dung lượng 145MB sao lưu thành công lên Cloud Storage', createdAt: '2026-05-19T23:00:00Z', read: true, important: false },
      ];
      setNotifications(MOCK_ADMIN_NOTIFICATIONS);
      localStorage.setItem('bhpro_notifications_admin', JSON.stringify(MOCK_ADMIN_NOTIFICATIONS));
    }
  };

  useEffect(() => {
    loadNotifications();
    const handleStorage = () => loadNotifications();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('notifications-update', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('notifications-update', handleStorage);
    };
  }, []);

  const saveNotifications = (newItems) => {
    setNotifications(newItems);
    localStorage.setItem('bhpro_notifications_admin', JSON.stringify(newItems));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('notifications-update'));
  };

  const handleMarkAsRead = (id) => {
    const newItems = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(newItems);
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    const newItems = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(newItems);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'system': return <Shield size={16} />;
      case 'contract': return <FileText size={16} />;
      case 'invoice': return <Receipt size={16} />;
      case 'debt': return <AlertCircle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-[240px] bg-surface border-r border-line flex flex-col z-50 lg:z-20 transition-transform duration-500 [transition-timing-function:var(--ease-apple-spring)] lg:transform-none lg:translate-x-0",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <div>
            <h1 className="text-headline-sm text-primary font-bold">BoardingHouse</h1>
            <p className="text-xs text-ink-muted mt-0.5">Quản trị hệ thống</p>
          </div>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted lg:hidden apple-press"
            onClick={() => setIsDrawerOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 relative">
          <div
            className="absolute bg-primary-soft rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0 shadow-[0_4px_12px_-2px_rgba(58,91,199,0.12)]"
            style={{
              left: `${indicatorStyle.left}px`,
              top: `${indicatorStyle.top}px`,
              width: `${indicatorStyle.width}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
          />
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold relative apple-press transition-apple duration-200 z-10',
                  isActive
                    ? 'text-primary'
                    : 'text-ink-muted hover:bg-gray-100/70 hover:text-ink hover:translate-x-1'
                )
              }
            >
              <item.icon size={18} className="transition-transform duration-300 group-hover:scale-110" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-muted hover:bg-red-50 hover:text-danger apple-press transition-apple duration-200"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <header className="fixed top-0 left-0 lg:left-[240px] right-0 h-16 bg-surface border-b border-line z-30 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 flex-1">
          <button
            className="p-2 -ml-1 text-ink-muted lg:hidden"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-ink lg:hidden">BoardingHouse</span>
          <div className="relative flex-1 max-w-md hidden lg:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
              placeholder="Tìm kiếm phòng, hợp đồng, khách thuê…"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={cn(
                "p-2 rounded-md hover:bg-gray-100 text-ink-muted relative transition-colors apple-press",
                isNotifOpen && "bg-gray-100 text-primary"
              )}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface border border-line rounded-2xl shadow-xl z-50 py-3 overflow-hidden animate-[fadeInScale_0.2s_ease-out] text-ink">
                  <div className="px-4 pb-2.5 border-b border-line flex justify-between items-center">
                    <span className="font-bold text-sm">Thông báo mới ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-line">
                    {notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          handleMarkAsRead(n.id);
                          setIsNotifOpen(false);
                          navigate('/admin/notifications');
                        }}
                        className={cn(
                          "px-4 py-3 flex gap-3 hover:bg-gray-50/80 cursor-pointer transition-colors items-start",
                          !n.read && "bg-primary-soft/5"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          n.type === 'system' && "bg-red-50 text-danger",
                          n.type === 'contract' && "bg-amber-50 text-warning",
                          n.type === 'invoice' && "bg-sky-50 text-info",
                          n.type === 'debt' && "bg-rose-50 text-rose-600"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-normal", !n.read ? "font-bold text-ink" : "text-ink-muted")}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-ink-muted mt-0.5 truncate">{n.body}</p>
                        </div>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 self-center" />
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-xs text-ink-muted">Không có thông báo nào</div>
                    )}
                  </div>
                  
                  <div className="px-4 pt-2.5 border-t border-line text-center">
                    <button 
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/admin/notifications');
                      }}
                      className="text-xs text-primary font-bold hover:underline w-full block py-1"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button className="p-2 rounded-md hover:bg-gray-100 text-ink-muted hidden lg:inline-flex">
            <HelpCircle size={18} />
          </button>
          <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-line cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar name={user?.fullName || 'Admin'} size="sm" />
            <div className="hidden md:block text-sm text-right">
              <div className="font-medium text-ink leading-tight">{user?.fullName || 'Admin'}</div>
              <div className="text-xs text-ink-muted">Chủ trọ</div>
            </div>
          </div>
        </div>
      </header>

      <main className="lg:ml-[240px] mt-16 p-4 lg:p-6">
        <div className="max-w-container-max mx-auto">
          <Outlet />
        </div>
      </main>
      <AIChatbot />
    </div>
  );
}
