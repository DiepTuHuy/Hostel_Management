import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, Receipt,
  Wallet, Settings2, BarChart3, Settings, LogOut, Bell, Search, HelpCircle, Menu, X,
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { cn } from '../utils/cn.js';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsDrawerOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold relative apple-press transition-apple duration-200',
                  isActive
                    ? 'bg-primary-soft text-primary shadow-[0_4px_12px_-2px_rgba(58,91,199,0.12)] scale-[1.02]'
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
          <button className="p-2 rounded-md hover:bg-gray-100 text-ink-muted relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full" />
          </button>
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
    </div>
  );
}
