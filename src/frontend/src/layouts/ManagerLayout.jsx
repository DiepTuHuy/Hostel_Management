import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, DoorOpen, Users, Zap, Banknote, Bell, LogOut, Search, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../controllers/useAuth.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { cn } from '../utils/cn.js';

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 w-[240px] bg-surface border-r border-line flex flex-col">
        <div className="px-5 py-4 border-b border-line">
          <h1 className="text-headline-sm text-primary font-bold">Khu vực Quản lý</h1>
          <p className="text-xs text-ink-muted mt-0.5">Vận hành cơ sở</p>
        </div>
        
        <div className="px-4 py-3 border-b border-line">
          <label className="text-xs text-ink-muted uppercase tracking-wide">Chi nhánh hiện tại</label>
          <button className="mt-1.5 w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm">
            <span className="font-medium truncate">Nhà trọ An Phú</span>
            <ChevronDown size={16} className="text-ink-muted" />
          </button>
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

      <header className="fixed top-0 left-[240px] right-0 h-16 bg-surface border-b border-line z-30 flex items-center px-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-line rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white"
            placeholder="Tìm khách thuê, phòng, hoá đơn…"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-gray-100 text-ink-muted">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2 pl-3 ml-2 border-l border-line">
            <Avatar name={user?.fullName || 'Manager'} size="sm" />
            <div className="hidden md:block text-sm">
              <div className="font-medium text-ink leading-tight">{user?.fullName || 'Manager'}</div>
              <div className="text-xs text-ink-muted">Quản lý</div>
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
