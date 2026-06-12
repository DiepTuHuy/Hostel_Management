import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Receipt, User, Bell, Menu, X, LogOut, HelpCircle, Info, PhoneCall, Shield } from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { cn } from '../utils/cn.js';
import { Avatar, AIChatbot } from '../components/common';
import { notificationService } from '../services/notificationService.js';

const BOTTOM_NAV = [
  { to: '/tenant',           label: 'Trang chủ',   icon: Home, end: true },
  { to: '/tenant/contracts', label: 'Hợp đồng',    icon: FileText },
  { to: '/tenant/invoices',  label: 'Hoá đơn',     icon: Receipt },
  { to: '/tenant/profile',   label: 'Hồ sơ',       icon: User },
];

const SIDEBAR_NAV = [
  { to: '/tenant',             label: 'Trang chủ tổng quan', icon: Home, end: true },
  { to: '/tenant/contracts',   label: 'Hợp đồng thuê phòng', icon: FileText },
  { to: '/tenant/invoices',    label: 'Hóa đơn dịch vụ',     icon: Receipt },
  { to: '/tenant/profile',     label: 'Thông tin cá nhân',   icon: User },
  { to: '/tenant/notifications', label: 'Hộp thư thông báo',   icon: Bell },
];

export default function TenantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const bottomNavRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0
  });
  const [bottomIndicatorStyle, setBottomIndicatorStyle] = useState({
    left: 0,
    width: 0,
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

    const updateBottomIndicator = () => {
      if (!bottomNavRef.current) return;
      const activeEl = bottomNavRef.current.querySelector('.active');
      if (activeEl) {
        setBottomIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      } else {
        setBottomIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    updateBottomIndicator();
    const timer = setTimeout(() => { updateIndicator(); updateBottomIndicator(); }, 50);
    window.addEventListener('resize', () => { updateIndicator(); updateBottomIndicator(); });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [location.pathname]);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    if (!user) return;
    notificationService.list(user.id).then(res => {
      setNotifications(res);
    }).catch(err => {
      console.error('Lỗi khi tải danh sách thông báo trong Layout:', err);
    });
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('notifications-update', handleUpdate);
    return () => {
      window.removeEventListener('notifications-update', handleUpdate);
    };
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      window.dispatchEvent(new Event('notifications-update'));
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc thông báo:', err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await notificationService.markAllAsRead(user.id);
      window.dispatchEvent(new Event('notifications-update'));
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'invoice': return <Receipt size={16} />;
      case 'contract': return <FileText size={16} />;
      case 'system': return <Shield size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    setIsDrawerOpen(false);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-canvas-light text-zinc-900 font-sans antialiased relative overflow-x-hidden lg:overflow-x-visible max-w-screen-sm lg:max-w-none mx-auto lg:mx-0 shadow-sm lg:shadow-none">
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity max-w-screen-sm mx-auto lg:hidden"
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
        <div className="flex flex-col h-full select-none">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 active:scale-95 transition-transform duration-200">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/20">
                <Home size={16} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-zinc-950 leading-tight">BoardingHouse</h1>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">Khách thuê</p>
              </div>
            </Link>
            <button className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 lg:hidden active:scale-95 transition-transform" onClick={() => setIsDrawerOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
            <Avatar name={user?.fullName || 'Tenant'} size="md" className="rounded-lg" />
            <div>
              <div className="font-extrabold text-zinc-900 text-xs leading-snug">{user?.fullName || 'Khách thuê'}</div>
              <div className="text-[10px] text-zinc-400 font-bold mt-0.5">Phòng 301 · An Phú Q1</div>
            </div>
          </div>

          <nav ref={navRef} className="flex-1 px-3 py-5 space-y-1 overflow-y-auto relative">
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
            {SIDEBAR_NAV.map((item) => (
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
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="border-t border-zinc-100 my-4" />
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-900 active:scale-95 transition-all duration-200 text-left"
            >
              <HelpCircle size={16} />
              <span>Trung tâm hỗ trợ</span>
            </button>
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-900 active:scale-95 transition-all duration-200 text-left"
            >
              <Info size={16} />
              <span>Về chúng tôi</span>
            </button>
          </nav>

          {/* Emergency Contact Widget */}
          <div className="px-5 py-3.5 m-3 rounded-2xl bg-rose-50/40 border border-rose-100/60 text-left select-none">
            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
              <PhoneCall size={10} /> Liên hệ khẩn cấp
            </span>
            <p className="text-[11px] text-zinc-600 font-extrabold mt-1.5 leading-snug">Ban quản lý tòa nhà</p>
            <p className="text-xs text-rose-600 font-extrabold mt-0.5 leading-none">0901.234.567</p>
          </div>

          <div className="p-3 border-t border-zinc-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-red-50 hover:text-danger active:scale-95 transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Header */}
      <header className="sticky lg:fixed top-4 left-4 right-4 lg:left-[272px] h-14 lg:h-16 bg-white/80 backdrop-blur-md border border-zinc-200/50 z-30 flex items-center justify-between px-6 rounded-3xl shadow-sm select-none">
        <button className="p-2 -ml-2 text-zinc-500 lg:hidden hover:bg-zinc-50 rounded-xl transition-colors active:scale-95" onClick={() => setIsDrawerOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">
          <span className="lg:hidden">BoardingHouse</span>
          <span className="hidden lg:inline text-zinc-400">Cổng thông tin khách thuê</span>
        </div>
        <div className="flex items-center gap-3">
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
                          navigate('/tenant/notifications');
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
                          n.type === 'invoice' && "bg-sky-50 text-info"
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
                        navigate('/tenant/notifications');
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
          <div className="hidden lg:flex items-center gap-2.5 pl-3 ml-2 border-l border-zinc-200/60 select-none">
            <Avatar name={user?.fullName || 'Tenant'} size="sm" className="rounded-lg" />
            <div className="text-left text-xs">
              <div className="font-bold text-zinc-900 leading-tight">{user?.fullName || 'Khách thuê'}</div>
              <div className="text-[10px] text-zinc-400 font-bold mt-0.5">Phòng 301 · An Phú Q1</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-12 px-4 lg:px-8 pt-6 lg:pt-24 lg:ml-[272px]">
        <div className="max-w-container-max mx-auto animate-[fadeIn_0.5s_ease-out]">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 bg-white/90 backdrop-blur-md border border-zinc-200/50 rounded-2xl shadow-lg z-30 lg:hidden overflow-hidden">
        <div ref={bottomNavRef} className="grid grid-cols-4 h-full relative select-none">
          <div
            className="absolute bottom-0 h-[3px] bg-primary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0 [will-change:transform,opacity]"
            style={{
              transform: `translate3d(${bottomIndicatorStyle.left}px, 0, 0)`,
              width: `${bottomIndicatorStyle.width}px`,
              opacity: bottomIndicatorStyle.opacity,
              left: 0,
            }}
          />
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold relative z-10 transition-colors duration-200',
                  isActive ? 'active text-primary' : 'text-zinc-400'
                )
              }
            >
              <item.icon size={18} />
              <span className="scale-95">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <AIChatbot />
    </div>
  );
}
