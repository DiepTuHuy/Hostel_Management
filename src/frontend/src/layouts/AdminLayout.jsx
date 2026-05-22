import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, Receipt,
  Wallet, Settings2, BarChart3, Settings, LogOut, Bell, Search, HelpCircle,
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg">
      
      <aside className="fixed inset-y-0 left-0 w-[240px] bg-surface border-r border-line flex flex-col">
        <div className="px-5 py-4 border-b border-line">
          <h1 className="text-headline-sm text-primary font-bold">BoardingHouse</h1>
          <p className="text-xs text-ink-muted mt-0.5">Quản trị hệ thống</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-primary-soft text-primary before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary before:rounded-r'
                    : 'text-ink-muted hover:bg-gray-50 hover:text-ink'
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-muted hover:bg-gray-50 hover:text-danger"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <header className="fixed top-0 left-[240px] right-0 h-16 bg-surface border-b border-line z-30 flex items-center justify-between px-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
            placeholder="Tìm kiếm phòng, hợp đồng, khách thuê…"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-gray-100 text-ink-muted relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-ink-muted">
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

      <main className="ml-[240px] mt-16 p-6">
        <div className="max-w-container-max mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
