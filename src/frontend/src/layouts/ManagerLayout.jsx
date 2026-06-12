import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, Users, Zap, Banknote, Bell, LogOut, Search, ChevronDown, Menu, X,
  FileText, Receipt, AlertCircle, Layers, Home, HelpCircle
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { cn } from '../utils/cn.js';
import { AIChatbot } from '../components/common';
import { propertyService } from '../services/propertyService.js';

const NAV = [
  { to: '/manager',            label: 'Dashboard',         icon: LayoutDashboard, end: true },
  { to: '/manager/rooms',      label: 'Phòng & tài sản',   icon: DoorOpen },
  { to: '/manager/room-types', label: 'Loại phòng & tiện nghi', icon: Layers },
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
    <div className="min-h-screen bg-canvas-light text-zinc-900 font-sans antialiased">
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Floating Premium Sidebar */}
      <aside
        className={cn(
          "fixed top-4 bottom-4 w-60 bg-white border border-zinc-200/50 flex flex-col z-50 rounded-3xl shadow-sm transition-transform duration-500 lg:transform-none lg:translate-x-0 lg:left-4",
          isDrawerOpen ? "left-4 translate-x-0" : "left-0 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between select-none">
          <Link to="/" className="flex items-center gap-2.5 active:scale-95 transition-transform duration-200">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/20">
              <Home size={16} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-zinc-950 leading-tight">BoardingHouse</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">Quản lý</p>
            </div>
          </Link>
          <button
            className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 lg:hidden active:scale-95 transition-transform"
            onClick={() => setIsDrawerOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Premium Branch Selector */}
        <div className="px-5 py-4 border-b border-zinc-100 select-none">
          <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Chi nhánh quản lý</label>
          <div className="relative mt-2">
            <select
              value={selectedPropertyId}
              onChange={(e) => handlePropertySelect(e.target.value)}
              className="w-full appearance-none flex items-center justify-between pl-3.5 pr-9 py-2.5 bg-zinc-50 hover:bg-zinc-100/70 rounded-xl text-xs font-bold border border-zinc-200/60 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer text-zinc-800"
            >
              {properties.length === 0 ? (
                <option value="">Đang tải chi nhánh...</option>
              ) : (
                properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-5 space-y-1 relative select-none">
          <div
            className="absolute bg-primary-soft rounded-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0 shadow-sm border border-primary/5"
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
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold relative transition-colors duration-250 z-10 active:scale-[0.98]',
                  isActive
                    ? 'active text-primary'
                    : 'text-zinc-500 hover:text-zinc-900'
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-zinc-100 p-3 select-none">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-red-50 hover:text-danger active:scale-95 transition-all duration-200"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Floating Header */}
      <header className="fixed top-4 left-4 right-4 lg:left-[272px] h-16 bg-white/80 backdrop-blur-md border border-zinc-200/50 z-30 flex items-center justify-between px-6 rounded-3xl shadow-sm select-none">
        <div className="flex items-center gap-3 flex-1">
          <button
            className="p-2 -ml-2 text-zinc-500 lg:hidden hover:bg-zinc-50 rounded-xl transition-colors active:scale-95"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
          
          <div className="relative flex-1 max-w-sm hidden lg:block select-none">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              className="w-full h-9 pl-9 pr-3 bg-zinc-50 border border-zinc-200/50 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="Tìm kiếm nhanh..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={cn(
                "p-2 rounded-xl hover:bg-zinc-50 text-zinc-500 relative transition-colors active:scale-95",
                isNotifOpen && "bg-zinc-50 text-primary"
              )}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-danger rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-zinc-200/60 rounded-2xl shadow-xl z-50 py-3 overflow-hidden animate-[fadeInScale_0.2s_ease-out] text-zinc-900">
                  <div className="px-4 pb-2.5 border-b border-zinc-100 flex justify-between items-center">
                    <span className="font-extrabold text-xs">Thông báo mới ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] text-primary font-bold hover:underline"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
                    {notifications.slice(0, 5).map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          handleMarkAsRead(n.id);
                          setIsNotifOpen(false);
                          navigate('/manager/notifications');
                        }}
                        className={cn(
                          "px-4 py-3 flex gap-3 hover:bg-zinc-50/50 cursor-pointer transition-colors items-start",
                          !n.read && "bg-primary-soft/10"
                        )}
                      >
                        <div className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          n.type === 'contract' && "bg-amber-50 text-warning",
                          n.type === 'invoice' && "bg-sky-50 text-info",
                          n.type === 'visitor' && "bg-green-50 text-success",
                          n.type === 'debt' && "bg-red-50 text-danger"
                        )}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs leading-normal", !n.read ? "font-bold text-zinc-950" : "text-zinc-500")}>
                            {n.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{n.body}</p>
                        </div>
                        {!n.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 self-center" />
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="py-8 text-center text-xs text-zinc-400 font-medium">Không có thông báo nào</div>
                    )}
                  </div>
                  
                  <div className="px-4 pt-2.5 border-t border-zinc-100 text-center">
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

          <button className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-500 hidden lg:inline-flex active:scale-95">
            <HelpCircle size={16} />
          </button>
          
          <div className="flex items-center gap-2.5 pl-3 ml-2 border-l border-zinc-200/60 select-none">
            <Avatar name={user?.fullName || 'Manager'} size="sm" className="rounded-lg" />
            <div className="hidden md:block text-xs text-right">
              <div className="font-bold text-zinc-900 leading-tight">{user?.fullName || 'Manager'}</div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Quản lý</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="lg:pl-[272px] pt-24 px-4 lg:px-8 pb-12">
        <div className="max-w-container-max mx-auto animate-[fadeIn_0.5s_ease-out]">
          <Outlet />
        </div>
      </main>
      <AIChatbot />
    </div>
  );
}
