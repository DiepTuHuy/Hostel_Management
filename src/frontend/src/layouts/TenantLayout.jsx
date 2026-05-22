import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, FileText, Receipt, User, Bell, Menu, X, LogOut, HelpCircle, Info } from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { cn } from '../utils/cn.js';
import { Avatar } from '../components/common';

const BOTTOM_NAV = [
  { to: '/tenant',           label: 'Trang chủ',   icon: Home, end: true },
  { to: '/tenant/contracts', label: 'Hợp đồng',    icon: FileText },
  { to: '/tenant/invoices',  label: 'Hoá đơn',     icon: Receipt },
  { to: '/tenant/profile',   label: 'Hồ sơ',       icon: User },
];

export default function TenantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-bg flex flex-col max-w-screen-sm mx-auto shadow-elevated relative overflow-x-hidden">
      
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity max-w-screen-sm mx-auto"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div 
        className={cn(
          "fixed top-0 bottom-0 left-0 w-64 bg-surface border-r border-line z-50 transition-transform duration-300 ease-out transform",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between">
            <div>
              <h2 className="text-headline-sm text-primary font-bold">BoardingHouse</h2>
              <p className="text-xs text-ink-muted mt-0.5">Cổng thông tin khách thuê</p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-ink-muted" onClick={() => setIsDrawerOpen(false)}>
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

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <button
              onClick={() => handleNavClick('/tenant')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <Home size={18} className="text-ink-muted" />
              <span>Trang chủ</span>
            </button>
            <button
              onClick={() => handleNavClick('/tenant/contracts')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <FileText size={18} className="text-ink-muted" />
              <span>Hợp đồng của tôi</span>
            </button>
            <button
              onClick={() => handleNavClick('/tenant/invoices')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <Receipt size={18} className="text-ink-muted" />
              <span>Lịch sử hoá đơn</span>
            </button>
            <button
              onClick={() => handleNavClick('/tenant/profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <User size={18} className="text-ink-muted" />
              <span>Hồ sơ cá nhân</span>
            </button>
            <div className="border-t border-line my-3" />
            <button
              onClick={() => handleNavClick('/tenant/notifications')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <Bell size={18} className="text-ink-muted" />
              <span>Thông báo</span>
            </button>
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <HelpCircle size={18} className="text-ink-muted" />
              <span>Trung tâm hỗ trợ</span>
            </button>
            <button
              onClick={() => handleNavClick('/')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-gray-50 transition-colors text-left"
            >
              <Info size={18} className="text-ink-muted" />
              <span>Về chúng tôi</span>
            </button>
          </nav>

          <div className="p-3 border-t border-line">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-danger hover:bg-danger/5 transition-colors text-left"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <header className="sticky top-0 h-14 bg-surface border-b border-line z-30 flex items-center justify-between px-4">
        <button className="p-2 -ml-2 text-ink-muted" onClick={() => setIsDrawerOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="text-sm font-semibold text-ink">BoardingHouse</div>
        <button className="p-2 -mr-2 text-ink-muted relative" onClick={() => navigate('/tenant/notifications')}>
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full" />
        </button>
      </header>

      <main className="flex-1 pb-20 px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-line max-w-screen-sm mx-auto z-30">
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
    </div>
  );
}
