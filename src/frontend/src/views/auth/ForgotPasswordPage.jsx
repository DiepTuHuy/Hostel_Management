import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input, Card, Toast } from '../../components/common';
import { Building2, ArrowLeft, Key, Mail, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300); // 5 phút

  const [localError, setLocalError] = useState('');
  const [toast, setToast] = useState(null);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Tự động focus ô OTP đầu tiên
  useEffect(() => {
    if (isOtpStep) {
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    }
  }, [isOtpStep]);

  // Bộ đếm thời gian hiệu lực OTP
  useEffect(() => {
    let timer;
    if (isOtpStep && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs[index - 1].current.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpDigits(digits);
    if (inputRefs[5].current) {
      inputRefs[5].current.focus();
    }
  };

  // Gửi yêu cầu OTP
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim()) return;

    try {
      const data = await forgotPassword(email);
      setToast({
        type: 'success',
        message: data?.message || 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn!'
      });
      setIsOtpStep(true);
      setCountdown(300); // 5 phút
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Yêu cầu OTP thất bại');
    }
  };

  // Xác thực OTP & Đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setLocalError('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }

    if (!newPassword) {
      setLocalError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      const data = await resetPassword(email, otpCode, newPassword);
      setToast({
        type: 'success',
        message: data?.message || 'Khôi phục mật khẩu thành công!'
      });
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Thiết lập mật khẩu thất bại');
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

          <Card tilt={true} className="w-full">
            {!isOtpStep ? (
              <form onSubmit={handleSubmitEmail}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-ink">Quên mật khẩu</h1>
                  <p className="text-xs text-ink-muted mt-1">Dành riêng cho khách thuê khôi phục mật khẩu</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Nhập Email đã đăng ký"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    icon={Mail}
                  />
                </div>

                {(localError || error) && (
                  <p className="mt-3 text-xs text-danger text-center font-medium">{localError || error}</p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11">
                  Nhận mã OTP xác minh
                </Button>

                <div className="mt-6 text-center">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-primary transition-colors">
                    <ArrowLeft size={14} /> Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-ink">Xác thực OTP & Reset</h1>
                  <p className="text-xs text-ink-muted mt-1">Nhập mã OTP gửi qua Email của bạn</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted text-center mb-3">
                      Nhập mã OTP 6 chữ số
                    </label>
                    <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={inputRefs[index]}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          className="w-10 h-12 text-center text-lg font-bold border border-line bg-gray-50 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
                        />
                      ))}
                    </div>
                    <div className="text-center mt-3 text-xs text-ink-muted">
                      Hiệu lực mã xác thực: <span className="font-semibold text-primary">{formatTime(countdown)}</span>
                    </div>
                  </div>

                  <hr className="border-line" />

                  <div className="space-y-4">
                    <Input
                      label="Mật khẩu mới"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={Key}
                    />
                    <Input
                      label="Nhập lại mật khẩu mới"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={ShieldCheck}
                    />
                  </div>
                </div>

                {(localError || error) && (
                  <p className="mt-3 text-xs text-danger text-center font-medium">{localError || error}</p>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11">
                  Xác nhận đặt lại mật khẩu
                </Button>

                <button
                  type="button"
                  onClick={() => setIsOtpStep(false)}
                  className="w-full text-center text-xs text-ink-muted mt-4 hover:underline"
                >
                  Quay lại bước nhập Email
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>

      <div className="text-center text-xs text-ink-muted">
        © 2026 BoardingHouse Pro · Vận hành chuỗi nhà trọ đơn giản, hiệu quả.
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
