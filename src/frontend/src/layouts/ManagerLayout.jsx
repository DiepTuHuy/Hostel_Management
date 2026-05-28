import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, Users, Zap, Banknote, Bell, LogOut, Search, ChevronDown, Menu, X,
  FileText, Receipt, AlertCircle
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { cn } from '../utils/cn.js';
import { AIChatbot } from '../components/common';
import { propertyService } from '../services/propertyService.js';

const NAV = [
  { to: '/manager',            label: 'Dashboard',         icon: LayoutDashboard, end: true },
  { to: '/manager/rooms',      label: 'Phòng & tài sản',   icon: DoorOpen },
  { to: '/manager/contracts',  label: 'Khách & hợp đồng',  icon: Users },
  { to: '/manager/billing',    label: 'Chốt số điện nước',  icon: Zap },
  { to: '/manager/cash-receipts', label: 'Thu tiền mặt',   icon: Banknote },
  { to: '/manager/notifications', label: 'Thông báo',      icon: Bell },
];

export default function ManagerLayout() {
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
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  useEffect(() => {
    propertyService.list().then(res => {
      setProperties(res);
      const saved = localStorage.getItem('bhpro_selected_property_id');
      if (saved && res.some(p => p.id === saved)) {
        setSelectedPropertyId(saved);
      } else if (res.length > 0) {
        setSelectedPropertyId(res[0].id);
        localStorage.setItem('bhpro_selected_property_id', res[0].id);
        window.dispatchEvent(new Event('bhpro_property_changed'));
      }
    }).catch(err => console.error("Error loading properties in layout:", err));
  }, []);

  const handlePropertySelect = (id) => {
    setSelectedPropertyId(id);
    localStorage.setItem('bhpro_selected_property_id', id);
    window.dispatchEvent(new Event('bhpro_property_changed'));
  };


  const loadNotifications = () => {
    const saved = localStorage.getItem('bhpro_notifications_manager');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications([]);
      }
    } else {
      const MOCK_MANAGER_NOTIFICATIONS = [
        { id: '1', type: 'contract', title: 'Hợp đồng HD2025-002 cần ký gia hạn', body: 'Khách: Hoàng Thuỳ Linh — phòng 201', createdAt: '2026-05-22T07:30:00Z', read: false, important: true },
        { id: '2', type: 'invoice', title: '39/40 hoá đơn tháng 05 đã phát hành', body: 'Còn 1 hoá đơn chưa hoàn tất chỉ số nước', createdAt: '2026-05-21T22:00:00Z', read: false, important: false },
        { id: '3', type: 'visitor', title: 'Khách vãng lai đặt cọc phòng 103', body: 'Hồ Văn Khang đã đặt cọc 500.000đ — chờ ký hợp đồng', createdAt: '2026-05-21T15:00:00Z', read: false, important: true },
        { id: '4', type: 'debt', title: 'Hoá đơn HD-202603-001 quá hạn 48 ngày', body: 'Khách: Hoàng Thuỳ Linh — cần gửi nhắc nợ', createdAt: '2026-05-20T09:00:00Z', read: true, important: true },
        { id: '5', type: 'invoice', title: 'Thanh toán thành công hoá đơn HD-202604-001', body: 'Phạm Minh Đức — 5.136.000đ qua VNPay', createdAt: '2026-05-02T10:14:00Z', read: true, important: false },
      ];
      setNotifications(MOCK_MANAGER_NOTIFICATIONS);
      localStorage.setItem('bhpro_notifications_manager', JSON.stringify(MOCK_MANAGER_NOTIFICATIONS));
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
    localStorage.setItem('bhpro_notifications_manager', JSON.stringify(newItems));
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
      case 'contract': return <FileText size={16} />;
      case 'invoice': return <Receipt size={16} />;
      case 'visitor': return <Users size={16} />;
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
            <h1 className="text-headline-sm text-primary font-bold">Khu vực Quản lý</h1>
            <p className="text-xs text-ink-muted mt-0.5">Vận hành cơ sở</p>
          </div>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted lg:hidden apple-press"
            onClick={() => setIsDrawerOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="px-4 py-3 border-b border-line">
          <label className="text-xs text-ink-muted uppercase tracking-wide">Cơ sở quản lý</label>
          <div className="relative mt-1.5">
            <select
              value={selectedPropertyId}
              onChange={(e) => handlePropertySelect(e.target.value)}
              className="w-full appearance-none flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium border border-line focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer pr-10 text-ink"
            >
              {properties.length === 0 ? (
                <option value="">Đang tải cơ sở...</option>
              ) : (
                properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 relative">
          <div
            className="absolute bg-primary-soft rounded-xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0 shadow-[0_4px_12px_-2px_rgba(58,91,199,0.12)] [will-change:transform,opacity]"
            style={{
              transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
              width: `${indicatorStyle.width}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
              left: 0,
              top: 0,
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
                    ? 'active text-primary'
                    : 'text-ink-muted hover:bg-gray-100/70 hover:text-ink hover:translate-x-1'
                )
              }
            >
              <item.icon size={18} />
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
          <span className="text-sm font-semibold text-ink lg:hidden">Khu vực Quản lý</span>
          <div className="relative flex-1 max-w-md hidden lg:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
              placeholder="Tìm khách thuê, phòng, hoá đơn…"
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
                          navigate('/manager/notifications');
                        }}
                        className={cn(
                          "px-4 py-3 flex gap-3 hover:bg-gray-50/80 cursor-pointer transition-colors items-start",
                          !n.read && "bg-primary-soft/5"
                        )}
                      >
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          n.type === 'contract' && "bg-amber-50 text-warning",
                          n.type === 'invoice' && "bg-sky-50 text-info",
                          n.type === 'visitor' && "bg-green-50 text-success",
                          n.type === 'debt' && "bg-red-50 text-danger"
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
                        navigate('/manager/notifications');
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
          <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-line cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar name={user?.fullName || 'Manager'} size="sm" />
            <div className="hidden md:block text-sm text-right">
              <div className="font-medium text-ink leading-tight">{user?.fullName || 'Manager'}</div>
              <div className="text-xs text-ink-muted">Quản lý</div>
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
