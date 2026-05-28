import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { AIChatbot } from '../components/common';

const NAV = [
  { to: '/',         label: 'Trang chủ',  end: true },
  { to: '/rooms',    label: 'Tìm phòng' },
  { to: '/about',    label: 'Giới thiệu' },
  { to: '/contact',  label: 'Liên hệ' },
];

export default function VisitorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (to, e) => {
    // If we want to scroll to a section on the home page
    if (to === '/' || to === '/about' || to === '/contact') {
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '/about' || window.location.pathname === '/contact';
      if (isHomePage) {
        e.preventDefault();
        navigate(to);
        
        let id = '';
        if (to === '/about') id = 'about';
        if (to === '/contact') id = 'contact';
        
        if (id) {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-container-max mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" onClick={(e) => handleNavClick('/', e)} className="flex items-center gap-2 apple-press">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <div>
              <div className="font-bold text-ink leading-none">BoardingHouse</div>
              <div className="text-xs text-ink-muted">Nhà trọ chất lượng — minh bạch</div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-2">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={(e) => handleNavClick(item.to, e)}
                className={({ isActive }) =>
                  cn(
                    'relative px-4 py-2 rounded-xl text-sm font-semibold transition-apple duration-300 apple-press',
                    isActive
                      ? 'bg-primary-soft text-primary shadow-[0_4px_12px_-2px_rgba(58,91,199,0.1)] scale-[1.02]'
                      : 'text-ink-muted hover:bg-gray-100/70 hover:text-ink'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="btn btn-md btn-secondary hidden sm:inline-flex apple-press">Đăng nhập</Link>
            <Link to="/register" className="btn btn-md btn-primary apple-press">Đăng ký</Link>
            <button 
              className="p-2 text-ink hover:bg-gray-100 rounded-xl md:hidden apple-press transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <div 
        className={cn(
          "md:hidden bg-white border-b border-line overflow-hidden transition-all duration-300 [transition-timing-function:var(--ease-apple-spring)]",
          isMobileMenuOpen ? "max-h-[300px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        )}
      >
        <div className="px-4 flex flex-col gap-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleNavClick(item.to, e);
              }}
              className={({ isActive }) =>
                cn(
                  'px-4 py-3 rounded-xl text-sm font-semibold transition-apple duration-200 apple-press block',
                  isActive
                    ? 'bg-primary-soft text-primary shadow-[0_2px_8px_-1px_rgba(58,91,199,0.06)]'
                    : 'text-ink-muted hover:bg-gray-50 hover:text-ink'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="border-t border-line my-2 pt-2 flex flex-col gap-2 sm:hidden">
            <Link 
              to="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn btn-md btn-secondary w-full apple-press"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

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
              <li><Link to="/rooms" className="hover:text-white transition-colors">Tìm phòng</Link></li>
              <li>
                <Link 
                  to="/about" 
                  onClick={(e) => handleNavClick('/about', e)}
                  className="hover:text-white transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  onClick={(e) => handleNavClick('/contact', e)}
                  className="hover:text-white transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
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
      <AIChatbot />
    </div>
  );
}
