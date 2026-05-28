import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, Receipt, User, Bell, Menu, X, LogOut, HelpCircle, Info } from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { cn } from '../utils/cn.js';
import { Avatar, AIChatbot } from '../components/common';

const BOTTOM_NAV = [
  { to: '/tenant',           label: 'Trang chủ',   icon: Home, end: true },
  { to: '/tenant/contracts', label: 'Hợp đồng',    icon: FileText },
  { to: '/tenant/invoices',  label: 'Hoá đơn',     icon: Receipt },
  { to: '/tenant/profile',   label: 'Hồ sơ',       icon: User },
];

const SIDEBAR_NAV = [
  { to: '/tenant',             label: 'Trang chủ',      icon: Home, end: true },
  { to: '/tenant/contracts',   label: 'Hợp đồng của tôi', icon: FileText },
  { to: '/tenant/invoices',    label: 'Lịch sử hoá đơn',  icon: Receipt },
  { to: '/tenant/profile',     label: 'Hồ sơ cá nhân',  icon: User },
  { to: '/tenant/notifications', label: 'Thông báo',      icon: Bell },
];

export default function TenantLayout() {
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
    <div className="min-h-screen bg-bg flex flex-col lg:block relative overflow-x-hidden lg:overflow-x-visible max-w-screen-sm lg:max-w-none mx-auto lg:mx-0 shadow-elevated lg:shadow-none">
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity max-w-screen-sm mx-auto lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div 
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 lg:w-[240px] bg-surface border-r border-line z-50 lg:z-20 transition-transform duration-500 [transition-timing-function:var(--ease-apple-spring)] transform lg:transform-none lg:transition-none lg:translate-x-0",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm text-primary font-bold">BoardingHouse</h2>
              <p className="text-xs text-ink-muted mt-0.5">Cổng thông tin khách thuê</p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted lg:hidden apple-press" onClick={() => setIsDrawerOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-4 border-b border-line bg-gray-50 flex items-center gap-3">
            <Avatar name={user?.fullName || 'Tenant'} size="md" />
            <div>
              <div className="font-semibold text-ink text-sm leading-snug">{user?.fullName || 'Khách thuê'}</div>
              <div className="text-xs text-ink-muted">Phòng r-301 · An Phú Q1</div>
            </div>
          </div>

          <nav ref={navRef} className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto relative">
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
            {SIDEBAR_NAV.map((item) => (
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
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
            <div className="border-t border-line my-3" />
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-muted hover:bg-gray-100/70 hover:translate-x-1 apple-press transition-apple duration-200 text-left"
            >
              <HelpCircle size={18} />
              <span>Trung tâm hỗ trợ</span>
            </button>
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-muted hover:bg-gray-100/70 hover:translate-x-1 apple-press transition-apple duration-200 text-left"
            >
              <Info size={18} />
              <span>Về chúng tôi</span>
            </button>
          </nav>

          <div className="p-3 border-t border-line">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-danger hover:bg-danger/5 apple-press transition-apple duration-200 text-left"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <header className="sticky lg:fixed top-0 lg:left-[240px] right-0 h-14 lg:h-16 bg-surface border-b border-line z-30 flex items-center justify-between px-4 lg:px-6">
        <button className="p-2 -ml-2 text-ink-muted lg:hidden" onClick={() => setIsDrawerOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="text-sm font-semibold text-ink lg:text-base lg:font-bold">
          <span className="lg:hidden">BoardingHouse</span>
          <span className="hidden lg:inline text-ink-muted">Cổng thông tin khách thuê</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-ink-muted relative hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate('/tenant/notifications')}>
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full" />
          </button>
          <div className="hidden lg:flex items-center gap-2 pl-3 ml-2 border-l border-line">
            <Avatar name={user?.fullName || 'Tenant'} size="sm" />
            <div className="text-left text-sm">
              <div className="font-medium text-ink leading-tight">{user?.fullName || 'Khách thuê'}</div>
              <div className="text-xs text-ink-muted">Phòng r-301 · An Phú Q1</div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 lg:pb-6 px-4 lg:px-6 py-4 lg:py-6 lg:ml-[240px] lg:mt-16 lg:max-w-container-max lg:w-full lg:mx-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-line max-w-screen-sm mx-auto z-30 lg:hidden">
        <div className="grid grid-cols-4 h-full">
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 text-xs',
                  isActive ? 'text-primary' : 'text-ink-muted'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <AIChatbot />
    </div>
  );
}
