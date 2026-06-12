import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input, Toast } from '../../components/common';
import { Compass, ArrowLeft, Key, Mail, ShieldCheck, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300); // 5 minutes

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

  // Auto-focus first OTP digit when entering OTP step
  useEffect(() => {
    if (isOtpStep) {
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    }
  }, [isOtpStep]);

  // Countdown timer effect
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

  // Submit request OTP
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
      setCountdown(300); // 5 mins
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Yêu cầu OTP thất bại');
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setLocalError('');
    try {
      const data = await forgotPassword(email);
      setToast({
        type: 'success',
        message: data?.message || 'Mã OTP mới đã được gửi thành công!'
      });
      setCountdown(300);
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Không thể gửi lại mã xác thực, vui lòng thử lại sau');
    }
  };

  // Verify OTP & reset password
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
    <div className="min-h-screen bg-canvas-light flex flex-col lg:flex-row font-sans select-none antialiased">
      {/* Back to Login Button */}
      <Link 
        to="/login" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 bg-white/80 border border-zinc-200/50 px-3 py-2 rounded-full backdrop-blur-sm active:scale-95 transition-transform"
      >
        <ArrowLeft size={14} /> Quay lại đăng nhập
      </Link>

      {/* Left Panel: Dark Brand Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-between p-16 relative overflow-hidden select-none">
        <div className="z-10">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform duration-200 w-fit">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-white font-extrabold">
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
              </svg>
            </div>
            <div>
              <div className="font-extrabold text-white leading-tight tracking-tight text-sm">BoardingHouse Pro</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-0.5">Premium Living</div>
            </div>
          </Link>
        </div>

        <div className="z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-zinc-800 text-zinc-300 mb-6 border border-zinc-700/50">
            <Compass size={10} /> Khôi phục mật khẩu
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter leading-tight text-white max-w-[20ch]">
            An tâm trải nghiệm, bảo mật tuyệt đối tài khoản.
          </h2>
          <p className="mt-4 text-zinc-400 text-xs leading-relaxed max-w-[45ch]">
            Hệ thống xác thực mã khóa OTP 2 lớp qua email giúp bạn dễ dàng thiết lập lại mật khẩu mới chỉ trong vài bước đơn giản.
          </p>
        </div>

        <div className="z-10 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          © 2026 BoardingHouse Pro. Mọi quyền được bảo lưu.
        </div>

        {/* Ambient glow overlays */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      {/* Right Panel: Forgot Password Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          
          {!isOtpStep ? (
            /* STEP 1: Enter Email */
            <div className="bg-white border border-zinc-200/50 p-8 rounded-3xl shadow-sm w-full">
              <form onSubmit={handleSubmitEmail}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Quên mật khẩu</h1>
                  <p className="text-xs text-zinc-400 font-medium mt-1.5">Nhập email của bạn để nhận mã khôi phục</p>
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
                    className="rounded-xl border-zinc-200/60"
                  />
                </div>

                {(localError || error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <p className="text-xs text-danger font-bold">{localError || error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-full h-11 btn-primary">
                  Nhận mã OTP xác minh
                </Button>

                <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                  Quay lại{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline">
                    Đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: OTP & New Password */
            <div className="bg-white border border-zinc-200/50 p-8 rounded-3xl shadow-sm w-full">
              <form onSubmit={handleResetPassword}>
                {/* Process indicator steps */}
                <div className="flex items-center justify-center gap-4 mb-6 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                    <span className="text-xs font-bold text-zinc-400">Yêu cầu</span>
                  </div>
                  <div className="w-10 h-0.5 bg-zinc-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">2</span>
                    <span className="text-xs font-bold text-zinc-850">Đặt lại</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="mx-auto w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/5 shadow-sm">
                    <ShieldCheck size={24} className="animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Xác thực & Đặt lại</h1>
                  <p className="text-xs text-zinc-400 font-medium mt-2 leading-relaxed max-w-[32ch] mx-auto">
                    Mã xác minh OTP đã được gửi đến email <span className="font-bold text-zinc-800 break-all">{email}</span>. Vui lòng kiểm tra hộp thư.
                  </p>
                </div>

                {/* 6 OTP Inputs */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400 text-center mb-3">
                      Mã xác thực OTP
                    </label>
                    <div className="flex justify-center gap-2 md:gap-3" onPaste={handlePaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={inputRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={(e) => e.target.select()}
                          className="w-11 h-11 md:w-12 md:h-12 text-center text-base font-bold font-mono rounded-xl border border-zinc-200/60 bg-white text-zinc-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                        />
                      ))}
                    </div>
                    <div className="text-center mt-3 text-xs text-zinc-400 font-medium">
                      Hiệu lực còn lại:{' '}
                      <span className={cn("font-extrabold", countdown < 60 ? "text-danger animate-pulse" : "text-primary")}>
                        {formatTime(countdown)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full border-t border-zinc-200/50" />

                  <div className="space-y-4">
                    <Input
                      label="Mật khẩu mới"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={Key}
                      className="rounded-xl border-zinc-200/60"
                    />
                    <Input
                      label="Nhập lại mật khẩu mới"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      icon={ShieldCheck}
                      className="rounded-xl border-zinc-200/60"
                    />
                  </div>
                </div>

                {(localError || error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <p className="text-xs text-danger font-bold">{localError || error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-full h-11 btn-primary">
                  Xác nhận đặt lại mật khẩu
                </Button>

                <div className="text-center mt-6 text-xs text-zinc-400 font-medium flex flex-col items-center gap-3">
                  {countdown === 0 ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer focus:outline-none"
                      disabled={loading}
                    >
                      <RotateCcw size={13} /> Gửi lại mã OTP
                    </button>
                  ) : (
                    <div className="text-zinc-400 font-bold inline-flex items-center gap-1.5">
                      <RotateCcw size={13} className="opacity-50" />
                      Gửi lại mã sau <span className="font-extrabold text-zinc-800">{formatTime(countdown)}</span>
                    </div>
                  )}

                  <div className="w-full border-t border-zinc-200/50 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpStep(false);
                      setLocalError('');
                    }}
                    className="inline-flex items-center justify-center gap-1 text-zinc-400 font-bold hover:text-zinc-800 transition-colors bg-transparent border-0 cursor-pointer focus:outline-none"
                  >
                    <ArrowLeft size={13} /> Quay lại trang nhập Email
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
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
