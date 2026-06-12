import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Compass, Info, PhoneCall, LogIn, UserPlus } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { AIChatbot } from '../components/common';

const NAV = [
  { to: '/',         label: 'Trang chủ',  end: true, icon: Home },
  { to: '/rooms',    label: 'Tìm phòng', icon: Compass },
  { to: '/about',    label: 'Giới thiệu', icon: Info },
  { to: '/contact',  label: 'Liên hệ', icon: PhoneCall },
];

export default function VisitorLayout() {
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (to, e) => {
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
    <div className="min-h-screen bg-canvas-light flex flex-col font-sans select-none antialiased">
      {/* Slim Glassmorphic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" onClick={(e) => handleNavClick('/', e)} className="flex items-center gap-3 active:scale-95 transition-transform duration-200">
            {/* Elegant Monogram Logo */}
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm shadow-primary/20">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-zinc-900 leading-tight tracking-tight text-[15px]">BoardingHouse Pro</div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">Premium Living</div>
            </div>
          </Link>
          
          {/* Smooth Sliding Active Link Navigation */}
          <nav ref={navRef} className="hidden md:flex items-center gap-1 relative bg-zinc-100/60 p-1 rounded-full border border-zinc-200/30">
            <div
              className="absolute bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0 shadow-sm border border-zinc-200/50"
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
                onClick={(e) => handleNavClick(item.to, e)}
                className={({ isActive }) =>
                  cn(
                    'relative px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 active:scale-95 z-10 block select-none',
                    isActive
                      ? 'active text-primary'
                      : 'text-zinc-500 hover:text-zinc-900'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-sm btn-secondary hidden sm:inline-flex">
              <LogIn size={14} /> Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-sm btn-primary">
              <UserPlus size={14} /> Đăng ký
            </Link>
            <button 
              className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-full md:hidden active:scale-95 transition-colors border border-zinc-200/50 bg-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel - Smooth trượt slide */}
        <div 
          className={cn(
            "md:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200/50 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isMobileMenuOpen ? "max-h-[340px] opacity-100 py-4 shadow-lg" : "max-h-0 opacity-0 py-0"
          )}
        >
          <div className="px-6 flex flex-col gap-1.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
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
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-98 block',
                      isActive
                        ? 'bg-primary-soft text-primary border border-primary/5'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                    )
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              );
            })}
            <div className="border-t border-zinc-200/50 my-2 pt-3 flex flex-col gap-2 sm:hidden">
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn btn-md btn-secondary w-full"
              >
                <LogIn size={15} /> Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* High-End Minimalist Zinc Footer */}
      <footer className="bg-zinc-950 text-zinc-400 mt-24 border-t border-zinc-900 select-none">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 text-white font-extrabold mb-4 text-base">
              <div className="h-8 w-8 bg-zinc-800 rounded-lg flex items-center justify-center text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                </svg>
              </div>
              BoardingHouse Pro
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[30ch]">
              Hệ thống vận hành chuỗi căn hộ dịch vụ thông minh, ký hợp đồng điện tử và quản lý công nợ tự động.
            </p>
          </div>
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-widest mb-4">Danh mục</div>
            <ul className="space-y-3 text-xs">
              <li><Link to="/rooms" className="hover:text-white transition-colors">Tìm phòng trọ</Link></li>
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
            <div className="text-white font-bold text-xs uppercase tracking-widest mb-4">Pháp lý</div>
            <ul className="space-y-3 text-xs">
              <li className="hover:text-white cursor-pointer transition-colors">Điều khoản sử dụng</li>
              <li className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</li>
              <li className="hover:text-white cursor-pointer transition-colors">Quy trình ký hợp đồng số</li>
            </ul>
          </div>
          <div>
            <div className="text-white font-bold text-xs uppercase tracking-widest mb-4">Văn phòng</div>
            <ul className="space-y-3 text-xs text-zinc-500">
              <li className="flex items-center gap-2">📞 <span>1900 8686</span></li>
              <li className="flex items-center gap-2">✉ <span>hello@boardinghouse.vn</span></li>
              <li className="flex items-center gap-2">📍 <span>Hồ Chí Minh, Việt Nam</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-900 py-6 text-center text-[10px] text-zinc-600 font-semibold uppercase tracking-widest">
          © 2026 BoardingHouse Pro. Mọi quyền được bảo lưu.
        </div>
      </footer>
      <AIChatbot />
    </div>
  );
}
