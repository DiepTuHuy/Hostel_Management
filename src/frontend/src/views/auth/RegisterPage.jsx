import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input } from '../../components/common';
import { Compass, ShieldCheck, ArrowLeft, RotateCcw, UserPlus, Home } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export default function RegisterPage() {
  const { register, verifyOtp, resendOtp, loading, error } = useAuth();
  const navigate = useNavigate();

  // Step 1: Form details states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Navigation state (Step 1 -> Step 2)
  const [isOtpStep, setIsOtpStep] = useState(false);

  // Step 2: OTP verification states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300s
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Refs for 6 OTP input digits
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

  // Keyboard navigation & digit changes
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

  // Step 1: Submit details
  const submitDetails = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    
    if (password !== confirmPassword) {
      setLocalError('Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      const data = await register(fullName, email, phone, password, 'tenant');
      setLocalSuccess(data?.message || 'Tạo tài khoản thành công! Mã OTP kích hoạt đã được gửi.');
      setIsOtpStep(true);
      setCountdown(300);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setLocalError('Vui lòng nhập đầy đủ 6 chữ số mã OTP');
      return;
    }

    try {
      await verifyOtp(email, otpCode);
      setLocalSuccess('Xác thực kích hoạt thành công! Đang chuyển hướng vào hệ thống...');
      setTimeout(() => {
        navigate('/tenant', { replace: true });
      }, 1500);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Mã xác thực không chính xác hoặc đã hết hạn');
    }
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    setLocalError('');
    setLocalSuccess('');

    try {
      const data = await resendOtp(email);
      setCountdown(300);
      setOtpDigits(['', '', '', '', '', '']);
      setLocalSuccess(data?.message || 'Mã OTP mới đã được gửi thành công!');
      setTimeout(() => {
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Không thể gửi lại mã xác thực, vui lòng thử lại sau');
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
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/90 via-zinc-950/60 to-zinc-950/20 z-0 pointer-events-none" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-zinc-950/40 to-transparent z-0 pointer-events-none" />

        <div className="z-10">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform duration-200 w-fit">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-sm">
              <Home size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <div>
              <div className="font-extrabold text-white leading-tight tracking-tight text-sm">BoardingHouse Pro</div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mt-0.5">Premium Living</div>
            </div>
          </Link>
        </div>

        <div className="z-10 max-w-lg">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-white/10 text-white/90 mb-4 border border-white/10 backdrop-blur-sm">
            <Compass size={10} /> Trở thành cư dân
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Khởi đầu phong cách sống hiện đại và minh bạch.
          </h2>
          <p className="mt-4 text-zinc-250 text-xs md:text-[13px] leading-relaxed font-medium drop-shadow-sm max-w-[45ch]">
            Trực tiếp xem thông tin phòng trống, ký hợp đồng điện tử tiện lợi và giao tiếp trực tiếp với quản lý cơ sở mọi lúc mọi nơi.
          </p>
        </div>

        <div className="z-10 text-[10px] text-white/55 font-bold uppercase tracking-widest drop-shadow-sm">
          © 2026 BoardingHouse Pro. Mọi quyền được bảo lưu.
        </div>

        {/* Ambient glow overlays */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none z-0" />
      </div>

      {/* Right Panel: Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          
          {!isOtpStep ? (
            /* STEP 1: Registration Form Details */
            <div className="bg-white border border-zinc-200/50 p-8 rounded-3xl shadow-sm w-full">
              <form onSubmit={submitDetails}>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Đăng ký tài khoản</h1>
                  <p className="text-xs text-zinc-400 font-medium mt-1.5">Trở thành khách thuê trên hệ thống</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Họ và tên"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="rounded-xl border-zinc-200/60"
                  />
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="rounded-xl border-zinc-200/60"
                  />
                  <Input
                    label="Số điện thoại"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090xxxxxxx"
                    className="rounded-xl border-zinc-200/60"
                  />
                  <Input
                    label="Mật khẩu"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl border-zinc-200/60"
                  />
                  <Input
                    label="Nhập lại mật khẩu"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl border-zinc-200/60"
                  />
                </div>

                {(localError || error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <p className="text-xs text-danger font-bold">{localError || error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-full h-11 btn-primary">
                  <UserPlus size={15} /> Đăng ký
                </Button>

                <div className="mt-6 text-center text-xs text-zinc-400 font-medium">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline">
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: OTP Verification */
            <div className="bg-white border border-zinc-200/50 p-8 rounded-3xl shadow-sm w-full">
              <form onSubmit={handleVerify}>
                {/* Process indicator steps */}
                <div className="flex items-center justify-center gap-4 mb-6 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
                    <span className="text-xs font-bold text-zinc-400">Thông tin</span>
                  </div>
                  <div className="w-10 h-0.5 bg-zinc-200" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">2</span>
                    <span className="text-xs font-bold text-zinc-850">Xác thực</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="mx-auto w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/5 shadow-sm">
                    <ShieldCheck size={24} className="animate-pulse" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Kích hoạt tài khoản</h1>
                  <p className="text-xs text-zinc-400 font-medium mt-2 leading-relaxed max-w-[32ch] mx-auto">
                    Mã kích hoạt OTP đã được gửi đến email <span className="font-bold text-zinc-800 break-all">{email}</span>. Vui lòng kiểm tra hộp thư.
                  </p>
                </div>

                {/* 6 OTP Inputs */}
                <div className="flex justify-center gap-2 md:gap-3 my-6" onPaste={handlePaste}>
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
                      className="w-12 h-12 md:w-13 md:h-13 text-center text-lg font-bold font-mono rounded-xl border border-zinc-200/60 bg-white text-zinc-900 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                    />
                  ))}
                </div>

                <div className="text-center my-4 text-xs text-zinc-400 font-medium">
                  Hiệu lực còn lại:{' '}
                  <span className={cn("font-extrabold", countdown < 60 ? "text-danger animate-pulse" : "text-primary")}>
                    {formatTime(countdown)}
                  </span>
                </div>

                {(localError || error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                    <p className="text-xs text-danger font-bold">{localError || error}</p>
                  </div>
                )}

                {localSuccess && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <p className="text-xs text-emerald-700 font-bold">{localSuccess}</p>
                  </div>
                )}

                <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-full h-11 btn-primary">
                  Xác thực & Kích hoạt
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
                      setLocalSuccess('');
                    }}
                    className="inline-flex items-center justify-center gap-1 text-zinc-400 font-bold hover:text-zinc-800 transition-colors bg-transparent border-0 cursor-pointer focus:outline-none"
                  >
                    <ArrowLeft size={13} /> Quay lại trang điền thông tin
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
