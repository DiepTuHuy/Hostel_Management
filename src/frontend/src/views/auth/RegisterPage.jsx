import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input } from '../../components/common';
import { Building2 } from 'lucide-react';

export default function RegisterPage() {
  const { register, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (password !== confirmPassword) {
      setLocalError('Mật khẩu nhập lại không khớp');
      return;
    }
    try {
      await register(fullName, email, phone, password, 'tenant');
      setSuccess(true);
      await login(email, password);
      navigate('/tenant', { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Đăng ký thất bại');
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

          <form onSubmit={submit} className="bg-surface border border-line p-8 rounded-3xl shadow-card w-full">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-ink">Đăng ký tài khoản</h1>
              <p className="text-xs text-ink-muted mt-1">Đăng ký tài khoản khách thuê phòng trọ</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Họ và tên"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
              <Input
                label="Số điện thoại"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090xxxxxxx"
              />
              <Input
                label="Mật khẩu"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <Input
                label="Nhập lại mật khẩu"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {(localError || error) && (
              <p className="mt-3 text-xs text-danger text-center font-medium">{localError || error}</p>
            )}

            {success && (
              <p className="mt-3 text-xs text-success text-center font-medium">Đăng ký thành công! Đang đăng nhập...</p>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11">
              Đăng ký
            </Button>

            <div className="mt-6 text-center text-xs text-ink-muted">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-ink-muted">
        © 2026 BoardingHouse Pro · Vận hành chuỗi nhà trọ đơn giản, hiệu quả.
      </div>
    </div>
  );
}
