import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input } from '../../components/common';
import { LogIn, Compass, ArrowLeft, Home } from 'lucide-react';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      const dest = {
        admin: '/admin',
        manager: '/manager',
        tenant: '/tenant',
      }[user.role] || '/';
      navigate(dest, { replace: true });
    } catch {
      /* error is handled by useAuth */
    }
  };

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col lg:flex-row font-sans select-none antialiased">
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 bg-white/80 border border-zinc-200/50 px-3 py-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform"
      >
        <ArrowLeft size={14} /> Quay về Trang chủ
      </Link>

      {/* Left Panel: Dark Brand Showcase */}
      <div 
        className="hidden lg:flex lg:w-1/2 text-white flex-col justify-between p-16 relative overflow-hidden select-none bg-cover bg-center" 
        style={{ backgroundImage: "url('/premium_minimal_room.png')" }}
      >
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-zinc-950/85 z-0 pointer-events-none" />

        <div className="z-10">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform duration-200 w-fit">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-white">
              <Home size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-white leading-tight tracking-tight text-sm">BoardingHouse Pro</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Premium Living</div>
            </div>
          </Link>
        </div>

        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-zinc-800 text-zinc-350 mb-6 border border-zinc-700/50">
            <Compass size={10} /> Quản lý chuỗi nhà trọ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter leading-tight text-white max-w-[20ch]">
            Giải pháp vận hành & kết nối cư dân thông minh thế hệ mới.
          </h2>
          <p className="mt-4 text-zinc-400 text-xs leading-relaxed max-w-[45ch]">
            Bảo mật tối đa, quản lý số điện nước trực quan, xuất báo cáo PDF tự động và hỗ trợ thanh toán online tiện ích.
          </p>
        </div>

        <div className="z-10 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
          © 2026 BoardingHouse Pro. Mọi quyền được bảo lưu.
        </div>

        {/* Ambient glow overlays */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none z-0" />
      </div>

      {/* Right Panel: Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div className="bg-white border border-zinc-200/50 p-8 rounded-3xl shadow-sm w-full">
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Đăng nhập</h1>
                <p className="text-xs text-zinc-400 font-medium mt-1.5">Sử dụng tài khoản hệ thống cấp cho bạn</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@boardinghouse.vn"
                  className="rounded-xl border-zinc-200/60"
                />
                <div>
                  <Input
                    label="Mật khẩu"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl border-zinc-200/60"
                  />
                  <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" className="text-xs text-primary font-bold hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-xs text-danger text-center font-bold">{error}</p>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-full h-11 btn-primary">
                <LogIn size={15} /> Đăng nhập
              </Button>

              <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary font-bold hover:underline">
                  Đăng ký ngay
                </Link>
              </div>

              {/* Demo accounts preview box */}
              <div className="mt-8 pt-6 border-t border-zinc-200/50 text-[11px] text-zinc-500 space-y-2">
                <div className="font-extrabold text-zinc-800 uppercase tracking-widest text-[9px]">Tài khoản demo (Mật khẩu = vai trò):</div>
                <div className="grid grid-cols-1 gap-1 font-semibold bg-zinc-50 p-3 rounded-2xl border border-zinc-200/40 leading-relaxed">
                  <div>• Admin: <span className="text-zinc-800">admin@boardinghouse.vn</span> / <span className="text-zinc-800">admin</span></div>
                  <div>• Quản lý: <span className="text-zinc-800">manager.q1@boardinghouse.vn</span> / <span className="text-zinc-800">manager</span></div>
                  <div>• Khách thuê: <span className="text-zinc-800">duc.pm@gmail.com</span> / <span className="text-zinc-800">tenant</span></div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
