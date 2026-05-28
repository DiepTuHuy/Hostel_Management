import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input } from '../../components/common';
import { Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 bg-primary-soft rounded-xl flex items-center justify-center text-primary">
                <Building2 size={22} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg text-ink">BoardingHouse Pro</div>
                <div className="text-[10px] text-ink-muted leading-none font-medium">Quản lý chuỗi nhà trọ</div>
              </div>
            </Link>
          </div>

          <div className="bg-surface border border-line p-8 rounded-3xl shadow-card w-full">
            <form onSubmit={handleSubmit}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-ink">Đăng nhập</h1>
                <p className="text-xs text-ink-muted mt-1">Sử dụng tài khoản hệ thống cấp cho bạn</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten@boardinghouse.vn"
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs text-danger text-center font-medium">{error}</p>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11">
                Đăng nhập
              </Button>

              <div className="mt-6 text-center text-xs text-ink-muted">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Đăng ký ngay
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-line text-[11px] text-ink-muted space-y-2">
                <div className="font-bold text-ink uppercase tracking-wider text-[10px]">Tài khoản demo (password = role):</div>
                <div className="grid grid-cols-1 gap-1 font-medium bg-gray-50 p-2.5 rounded-xl border border-line">
                  <div>• admin@boardinghouse.vn / admin</div>
                  <div>• manager.q1@boardinghouse.vn / manager</div>
                  <div>• duc.pm@gmail.com / tenant</div>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>

      <div className="text-center text-xs text-ink-muted">
        © 2026 BoardingHouse Pro · Vận hành chuỗi nhà trọ đơn giản, hiệu quả.
      </div>
    </div>
  );
}

