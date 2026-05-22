import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/useAuth.jsx';
import { Button, Input } from '../../components/common';
import { Building2, ShieldCheck, Mail, ArrowLeft, RotateCcw } from 'lucide-react';

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
    // Only accept numeric inputs
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Auto-focus next input if digit entered
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace handling
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
    // Focus last input box
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
      setCountdown(300); // 5 minutes countdown
      setOtpDigits(['', '', '', '', '', '']); // Reset digits
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
      setCountdown(300); // Reset timer
      setOtpDigits(['', '', '', '', '', '']); // Reset digits
      setLocalSuccess(data?.message || 'Mã OTP mới đã được gửi thành công!');
      // Focus first input
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
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md animate-apple-pop">
          {/* Logo Brand Header */}
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

          {!isOtpStep ? (
            /* STEP 1: Registration Form Details */
            <form onSubmit={submitDetails} className="bg-surface border border-line p-8 rounded-3xl shadow-card w-full">
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
                <div className="mt-4 p-3 bg-red-50 border border-red-150 rounded-xl text-center">
                  <p className="text-xs text-danger font-semibold">{localError || error}</p>
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11 apple-press">
                Đăng ký
              </Button>

              <div className="mt-6 text-center text-xs text-ink-muted">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerify} className="bg-surface border border-line p-8 rounded-3xl shadow-card w-full">
              {/* Process indicator steps */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span className="text-xs font-semibold text-ink-muted">Thông tin</span>
                </div>
                <div className="w-10 h-0.5 bg-line" />
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span className="text-xs font-bold text-ink">Kích hoạt</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={26} className="animate-pulse" />
                </div>
                <h1 className="text-2xl font-bold text-ink">Xác thực tài khoản</h1>
                <p className="text-xs text-ink-muted mt-2 text-center max-w-sm mx-auto leading-relaxed">
                  Mã xác thực 6 chữ số đã được gửi tới email <span className="font-semibold text-ink break-all">{email}</span>. Vui lòng kiểm tra hộp thư của bạn.
                </p>
              </div>

              {/* 6 OTP Inputs block */}
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
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold font-mono rounded-xl border border-line bg-surface text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all transition-apple"
                  />
                ))}
              </div>

              <div className="text-center my-4 text-xs text-ink-muted">
                Thời gian hiệu lực của mã còn:{' '}
                <span className={`font-semibold ${countdown < 60 ? 'text-danger animate-pulse font-bold' : 'text-primary font-bold'}`}>
                  {formatTime(countdown)}
                </span>
              </div>

              {(localError || error) && (
                <div className="mt-4 p-3 bg-red-50 border border-red-150 rounded-xl text-center animate-apple-pop">
                  <p className="text-xs text-danger font-semibold">{localError || error}</p>
                </div>
              )}

              {localSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-150 rounded-xl text-center animate-apple-pop">
                  <p className="text-xs text-success font-semibold">{localSuccess}</p>
                </div>
              )}

              <Button type="submit" size="lg" loading={loading} className="w-full mt-6 rounded-2xl h-11 apple-press">
                Xác thực & Kích hoạt
              </Button>

              <div className="text-center mt-6 text-xs text-ink-muted flex flex-col items-center gap-3">
                {countdown === 0 ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline bg-transparent border-0 cursor-pointer focus:outline-none apple-press"
                    disabled={loading}
                  >
                    <RotateCcw size={14} /> Gửi lại mã OTP
                  </button>
                ) : (
                  <div className="text-ink-muted font-medium inline-flex items-center gap-1.5">
                    <RotateCcw size={14} className="opacity-50" />
                    Gửi lại mã sau <span className="font-semibold text-ink">{formatTime(countdown)}</span>
                  </div>
                )}

                <div className="w-full border-t border-line my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setIsOtpStep(false);
                    setLocalError('');
                    setLocalSuccess('');
                  }}
                  className="inline-flex items-center justify-center gap-1 text-ink-muted hover:text-ink transition-colors bg-transparent border-0 cursor-pointer focus:outline-none"
                >
                  <ArrowLeft size={14} /> Quay lại trang đăng ký
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-ink-muted">
        © 2026 BoardingHouse Pro · Vận hành chuỗi nhà trọ đơn giản, hiệu quả.
      </div>
    </div>
  );
}

