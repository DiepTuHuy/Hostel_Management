import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '../utils/cn.js';

const NAV = [
  { to: '/',         label: 'Trang chủ',  end: true },
  { to: '/rooms',    label: 'Tìm phòng' },
  { to: '/about',    label: 'Giới thiệu' },
  { to: '/contact',  label: 'Liên hệ' },
];

export default function VisitorLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-container-max mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <div>
              <div className="font-bold text-ink leading-none">BoardingHouse</div>
              <div className="text-xs text-ink-muted">Nhà trọ chất lượng — minh bạch</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn('text-sm font-medium', isActive ? 'text-primary' : 'text-ink hover:text-primary')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-md btn-secondary hidden sm:inline-flex">Đăng nhập</Link>
            <Link to="/login" className="btn btn-md btn-primary">Khách thuê</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-300 mt-16">
        <div className="max-w-container-max mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-white font-bold text-lg mb-3">BoardingHouse</div>
            <p className="text-sm text-gray-400">Hệ thống quản lý chuỗi nhà trọ minh bạch, thanh toán online, hợp đồng số.</p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Liên kết</div>
            <ul className="space-y-2 text-sm">
              <li><Link to="/rooms" className="hover:text-white">Tìm phòng</Link></li>
              <li><Link to="/about" className="hover:text-white">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Hỗ trợ</div>
            <ul className="space-y-2 text-sm">
              <li>FAQ</li>
              <li>Điều khoản sử dụng</li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Liên hệ</div>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 1900 8686</li>
              <li>✉ hello@boardinghouse.vn</li>
              <li>📍 Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
          © 2026 BoardingHouse Pro. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
