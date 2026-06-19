import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, ShieldCheck, CreditCard, Sparkles, Copy, Check, QrCode, X, LogIn, UserPlus, ShieldAlert, KeyRound, Mail, Phone, User } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';
import { useAuth } from '../../controllers/useAuth.jsx';
import { authService } from '../../services/authService.js';

export default function DepositPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const { login, register, verifyOtp, resendOtp } = useAuth();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'

  // Auth Form inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authFullName, setAuthFullName] = useState('');

  // OTP States
  const [isAuthOtpStep, setIsAuthOtpStep] = useState(false);
  const [authOtpDigits, setAuthOtpDigits] = useState(['', '', '', '', '', '']);
  const [authCountdown, setAuthCountdown] = useState(300);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [cccd, setCccd] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [payMethod, setPayMethod] = useState('vnpay');
  const [paying, setPaying] = useState(false);
  const [payConfirmStep, setPayConfirmStep] = useState(1);
  const [copiedText, setCopiedText] = useState('');
  const [showLargeQR, setShowLargeQR] = useState(false);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Auto prefill Step 1 if logged in
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || currentUser.hoTen || '');
      setPhone(currentUser.phone || currentUser.sdt || '');
      setEmail(currentUser.email || '');
      if (currentUser.thongTinKhachThue?.cccd) {
        setCccd(currentUser.thongTinKhachThue.cccd);
      }
    }
  }, [currentUser]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer;
    if (isAuthOtpStep && authCountdown > 0) {
      timer = setInterval(() => {
        setAuthCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAuthOtpStep, authCountdown]);

  const formatOtpTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newDigits = [...authOtpDigits];
    newDigits[index] = value;
    setAuthOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!authOtpDigits[index] && index > 0) {
        const newDigits = [...authOtpDigits];
        newDigits[index - 1] = '';
        setAuthOtpDigits(newDigits);
        otpRefs[index - 1].current.focus();
      } else {
        const newDigits = [...authOtpDigits];
        newDigits[index] = '';
        setAuthOtpDigits(newDigits);
      }
    }
  };

  const handleAuthLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const u = await login(authEmail, authPassword);
      setCurrentUser(u);
      setAuthSuccess('Đăng nhập thành công!');
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (authPassword !== authConfirmPassword) {
      setAuthError('Mật khẩu nhập lại không khớp');
      return;
    }
    setAuthLoading(true);
    try {
      const data = await register(authFullName, authEmail, authPhone, authPassword, 'tenant');
      setAuthSuccess(data?.message || 'Tạo tài khoản thành công! Mã OTP đã gửi.');
      setIsAuthOtpStep(true);
      setAuthCountdown(300);
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    const otpCode = authOtpDigits.join('');
    if (otpCode.length !== 6) {
      setAuthError('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    setAuthLoading(true);
    try {
      const u = await verifyOtp(authEmail, otpCode);
      setCurrentUser(u);
      setAuthSuccess('Kích hoạt tài khoản thành công!');
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'OTP không chính xác');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthResendOtp = async () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      await resendOtp(authEmail);
      setAuthCountdown(300);
      setAuthOtpDigits(['', '', '', '', '', '']);
      setAuthSuccess('Mã OTP mới đã được gửi!');
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Không thể gửi lại OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    roomService.get(id).then(r => {
      if (r) {
        setRoom(r);
        propertyService.get(r.propertyId).then(p => {
          setProperty(p);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step === 3 && payConfirmStep === 2) {
      setPayConfirmStep(1);
    } else if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await roomService.deposit(room.id, {
        fullName,
        phone,
        cccd,
        depositAmount: 500000,
        email
      });
      setStep(4);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Lỗi hệ thống khi đặt cọc');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="bg-[#F5F7FB] min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-line shadow-elevated overflow-hidden">
        
        {step < 4 && (
          <div className="px-6 py-4 border-b border-line bg-gray-50 flex items-center justify-between">
            <button onClick={handleBack} disabled={step === 1} className="p-2 -ml-2 rounded-lg text-ink-muted hover:text-ink disabled:opacity-30">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 1 ? 'text-primary' : 'text-ink-muted'}`}>
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px]">1</span>
                <span>Thông tin</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 2 ? 'text-primary' : 'text-ink-muted'}`}>
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px]">2</span>
                <span>Xác nhận</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold ${step >= 3 ? 'text-primary' : 'text-ink-muted'}`}>
                <span className="w-5 h-5 rounded-full bg-primary-soft text-primary flex items-center justify-center text-[10px]">3</span>
                <span>Thanh toán</span>
              </div>
            </div>
            <div className="w-6" />
          </div>
        )}

        <div className="p-6 md:p-8">
          {!currentUser ? (
            <div className="space-y-6">
              <div className="text-center max-w-md mx-auto space-y-2">
                <div className="w-12 h-12 bg-primary-soft text-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert size={24} />
                </div>
                <h2 className="text-xl font-bold text-ink">Yêu cầu đăng ký / đăng nhập</h2>
                <p className="text-xs text-ink-muted">
                  Để đặt cọc giữ phòng, quý khách vui lòng đăng nhập hoặc đăng ký tài khoản mới trên hệ thống.
                </p>
              </div>

              {/* Tabs header */}
              {!isAuthOtpStep && (
                <div className="flex border-b border-line">
                  <button
                    onClick={() => { setAuthTab('login'); setAuthError(''); setAuthSuccess(''); }}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-colors ${authTab === 'login' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'}`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setAuthError(''); setAuthSuccess(''); }}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 text-center transition-colors ${authTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'}`}
                  >
                    Đăng ký tài khoản
                  </button>
                </div>
              )}

              {/* Messages */}
              {authError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-center animate-[fadeIn_0.2s_ease-out]">
                  <p className="text-xs text-danger font-bold">{authError}</p>
                </div>
              )}
              {authSuccess && (
                <div className="p-3.5 bg-green-50 border border-green-100 rounded-xl text-center animate-[fadeIn_0.2s_ease-out]">
                  <p className="text-xs text-green-700 font-bold">{authSuccess}</p>
                </div>
              )}

              {/* Login Form */}
              {!isAuthOtpStep && authTab === 'login' && (
                <form onSubmit={handleAuthLoginSubmit} className="space-y-4">
                  <div>
                    <label className="label">Địa chỉ Email</label>
                    <input
                      required
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Mật khẩu</label>
                    <input
                      required
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary h-12 w-full rounded-xl font-bold flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={16} className="mr-1.5" /> Đăng nhập ngay
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Register Form */}
              {!isAuthOtpStep && authTab === 'register' && (
                <form onSubmit={handleAuthRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="label">Họ và tên</label>
                    <input
                      required
                      type="text"
                      value={authFullName}
                      onChange={e => setAuthFullName(e.target.value)}
                      className="input"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="label">Địa chỉ Email</label>
                    <input
                      required
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      className="input"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input
                      required
                      type="tel"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
                      className="input"
                      placeholder="0901234567"
                    />
                  </div>
                  <div>
                    <label className="label">Mật khẩu</label>
                    <input
                      required
                      type="password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="label">Nhập lại mật khẩu</label>
                    <input
                      required
                      type="password"
                      value={authConfirmPassword}
                      onChange={e => setAuthConfirmPassword(e.target.value)}
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary h-12 w-full rounded-xl font-bold flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-1.5" /> Đăng ký tài khoản mới
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* OTP Form */}
              {isAuthOtpStep && (
                <form onSubmit={handleAuthVerifyOtpSubmit} className="space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-ink-muted leading-relaxed">
                      Mã kích hoạt OTP đã được gửi đến email <span className="font-bold text-zinc-800 break-all">{authEmail}</span>. Vui lòng nhập mã để kích hoạt tài khoản.
                    </p>
                  </div>

                  <div className="flex justify-center gap-2.5">
                    {authOtpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-11 text-center text-lg font-bold rounded-xl border border-line focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    ))}
                  </div>

                  <div className="text-center text-xs text-ink-muted">
                    Hiệu lực còn lại:{' '}
                    <span className={`font-bold ${authCountdown < 60 ? "text-danger animate-pulse" : "text-primary"}`}>
                      {formatOtpTime(authCountdown)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary h-12 w-full rounded-xl font-bold flex items-center justify-center shadow-md disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Xác thực & Kích hoạt tài khoản'
                    )}
                  </button>

                  <div className="text-center text-xs text-ink-muted flex flex-col items-center gap-2">
                    {authCountdown === 0 ? (
                      <button
                        type="button"
                        onClick={handleAuthResendOtp}
                        className="text-primary font-bold hover:underline"
                        disabled={authLoading}
                      >
                        Gửi lại mã OTP
                      </button>
                    ) : (
                      <div>Gửi lại mã sau <span className="font-bold">{formatOtpTime(authCountdown)}</span></div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsAuthOtpStep(false);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-ink-muted hover:text-ink font-semibold flex items-center gap-1 mt-2 bg-transparent border-0 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Quay lại
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : step === 1 && (
            <form onSubmit={handleNext} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-ink">Thông tin người đặt cọc</h2>
                <p className="text-xs text-ink-muted mt-0.5">Vui lòng điền thông tin chính xác theo CCCD để lập hợp đồng về sau.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Họ và tên</label>
                  <input required value={fullName} onChange={e => setFullName(e.target.value)} type="text" className="input" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="label">Số CCCD / Hộ chiếu</label>
                  <input required value={cccd} onChange={e => setCccd(e.target.value)} type="text" className="input" placeholder="079123456789" />
                </div>
                <div>
                  <label className="label">Số điện thoại</label>
                  <input required value={phone} onChange={e => setPhone(e.target.value)} type="tel" className="input" placeholder="0901234567" />
                </div>
                <div>
                  <label className="label">Địa chỉ email</label>
                  <input required value={email} onChange={e => setEmail(e.target.value)} type="email" className="input" placeholder="an.nguyen@gmail.com" />
                </div>
              </div>

              <div className="p-4 bg-[#E8EEF9] border border-primary/10 rounded-2xl flex gap-3 text-xs text-primary leading-relaxed">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>Hệ thống sẽ giữ phòng trống cho bạn trong vòng 24 giờ kể từ lúc hoàn tất cọc thành công để tiến hành gặp mặt ký kết hợp đồng chính thức.</span>
              </div>

              <button type="submit" className="btn btn-primary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center shadow-md">
                Tiếp tục
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-ink">Xác nhận đặt cọc phòng</h2>
                <p className="text-xs text-ink-muted mt-0.5">Vui lòng kiểm tra kỹ chi tiết giữ chỗ bên dưới.</p>
              </div>

              <div className="border border-line rounded-2xl p-5 bg-gray-50 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-ink">{property?.name}</h3>
                    <p className="text-xs text-ink-muted mt-1">{property?.address}, {property?.district}</p>
                  </div>
                  <span className="text-xs font-bold text-primary bg-primary-soft px-2.5 py-1 rounded">Phòng {room?.code}</span>
                </div>
                <div className="border-t border-line pt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-ink-muted block">Diện tích phòng</span>
                    <span className="font-semibold text-ink">{room?.area} m² (Tầng {room?.floor})</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Tiền phòng hằng tháng</span>
                    <span className="font-semibold text-ink">{formatCurrency(room?.price)}/tháng</span>
                  </div>
                </div>
                <div className="border-t border-line pt-3 flex justify-between items-center text-sm">
                  <span className="font-semibold text-ink">Số tiền cọc giữ phòng</span>
                  <span className="font-extrabold text-primary text-lg">500.000 ₫</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-ink">Thông tin người đặt cọc</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div className="text-ink-muted">Họ tên: <span className="font-semibold text-ink">{fullName}</span></div>
                  <div className="text-ink-muted">CCCD: <span className="font-semibold text-ink">{cccd}</span></div>
                  <div className="text-ink-muted">SĐT: <span className="font-semibold text-ink">{phone}</span></div>
                  <div className="text-ink-muted">Email: <span className="font-semibold text-ink">{email}</span></div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer p-4 bg-gray-50 border border-line rounded-2xl text-xs text-ink-muted">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="rounded border-line text-primary focus:ring-primary/20 mt-0.5" />
                <span>Tôi hoàn toàn đồng ý với điều khoản cọc giữ phòng của chuỗi hệ thống và hiểu rằng số tiền này sẽ không được hoàn lại nếu tôi tự ý huỷ bỏ giữ chỗ.</span>
              </label>

              <button
                onClick={handleNext}
                disabled={!agree}
                className="btn btn-primary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center shadow-md disabled:opacity-50"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {payConfirmStep === 1 ? (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-ink">Thanh toán cọc trực tuyến</h2>
                    <p className="text-xs text-ink-muted mt-0.5">Chọn phương thức thanh toán an toàn để hoàn thành.</p>
                  </div>

                  <div className="space-y-3">
                    <button onClick={() => setPayMethod('vnpay')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${payMethod === 'vnpay' ? 'bg-primary-soft text-primary border-primary' : 'bg-white text-ink border-line hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} />
                        <div>
                          <div className="text-sm font-bold">Ví điện tử VNPay</div>
                          <div className="text-[10px] text-ink-muted">Thanh toán tức thời qua ứng dụng ngân hàng</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === 'vnpay' ? 'border-primary' : 'border-line'}`}>
                        {payMethod === 'vnpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>

                    <button onClick={() => setPayMethod('momo')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${payMethod === 'momo' ? 'bg-primary-soft text-primary border-primary' : 'bg-white text-ink border-line hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} />
                        <div>
                          <div className="text-sm font-bold">Ví điện tử MoMo</div>
                          <div className="text-[10px] text-ink-muted">Thanh toán ví điện tử nhanh chóng</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === 'momo' ? 'border-primary' : 'border-line'}`}>
                        {payMethod === 'momo' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>

                    <button onClick={() => setPayMethod('qr')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${payMethod === 'qr' ? 'bg-primary-soft text-primary border-primary' : 'bg-white text-ink border-line hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <CreditCard size={20} />
                        <div>
                          <div className="text-sm font-bold">QR Banking (VietQR)</div>
                          <div className="text-[10px] text-ink-muted">Quét mã chuyển khoản liên ngân hàng</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${payMethod === 'qr' ? 'border-primary' : 'border-line'}`}>
                        {payMethod === 'qr' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 border border-line rounded-2xl flex justify-between items-center text-sm">
                    <span className="font-medium text-ink">Số tiền thực thanh toán</span>
                    <span className="font-extrabold text-primary text-xl">500.000 ₫</span>
                  </div>

                  <button
                    onClick={() => setPayConfirmStep(2)}
                    className="btn btn-primary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center shadow-md animate-[fadeIn_0.2s_ease-out]"
                  >
                    Xác nhận & Thanh toán ngay
                  </button>
                </>
              ) : (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-ink">Quét mã QR thanh toán thật</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {payMethod === 'momo' && "Dùng ứng dụng MoMo để quét mã QR bên dưới"}
                      {payMethod === 'vnpay' && "Dùng ứng dụng ngân hàng quét mã VNPay-QR bên dưới"}
                      {payMethod === 'qr' && "Dùng ứng dụng Mobile Banking quét mã VietQR bên dưới"}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4 bg-gray-50 rounded-2xl border border-line">
                    <div
                      onClick={() => setShowLargeQR(true)}
                      className="bg-white p-4 rounded-2xl border border-line shadow-sm relative flex flex-col items-center justify-center shrink-0 w-52 h-52 cursor-pointer hover:scale-[1.02] active:scale-98 transition-all group"
                      title="Click để phóng to mã QR"
                    >
                      <img
                        src={
                          property?.qrCodeUrl ||
                          `https://img.vietqr.io/image/MB-0364962299-compact2.png?amount=500000&addInfo=${encodeURIComponent(`DAT COC PHONG ${room?.code} - SĐT ${phone}`)}&accountName=${encodeURIComponent('HE THONG NHA TRO AN NINH')}`
                        }
                        alt="QR Code thanh toán cọc thật"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-primary/90 group-hover:bg-primary text-white text-[9px] text-center py-1.5 rounded-b-2xl font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <QrCode size={11} />
                        QUÉT MÃ ĐỂ CHUYỂN KHOẢN (CLICK PHÓNG TO)
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Thông tin chuyển khoản</h4>
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <span className="text-ink-muted">Ngân hàng</span>
                          <span className="font-bold text-ink">MB Bank (Quân Đội)</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <span className="text-ink-muted">Số tài khoản</span>
                          <div className="flex items-center gap-1.5 font-bold text-ink">
                            <span>0364962299</span>
                            <button
                              type="button"
                              onClick={() => handleCopy('0364962299', 'stk')}
                              className="text-primary hover:text-primary-hover p-0.5 rounded hover:bg-primary-soft transition-colors"
                              title="Sao chép số tài khoản"
                            >
                              {copiedText === 'stk' ? <Check size={12} className="text-green-500 animate-scale-up" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <span className="text-ink-muted">Chủ tài khoản</span>
                          <span className="font-bold text-ink">HE THONG NHA TRO AN NINH</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <span className="text-ink-muted">Số tiền cọc</span>
                          <div className="flex items-center gap-1.5 font-bold text-primary">
                            <span>500.000 ₫</span>
                            <button
                              type="button"
                              onClick={() => handleCopy('500000', 'money')}
                              className="text-primary hover:text-primary-hover p-0.5 rounded hover:bg-primary-soft transition-colors"
                              title="Sao chép số tiền"
                            >
                              {copiedText === 'money' ? <Check size={12} className="text-green-500 animate-scale-up" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-gray-200">
                          <span className="text-ink-muted">Nội dung ghi chú</span>
                          <div className="flex items-center gap-1.5 font-bold text-ink">
                            <span>{`DAT COC PHONG ${room?.code} ${phone}`}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(`DAT COC PHONG ${room?.code} ${phone}`, 'nd')}
                              className="text-primary hover:text-primary-hover p-0.5 rounded hover:bg-primary-soft transition-colors"
                              title="Sao chép nội dung ghi chú"
                            >
                              {copiedText === 'nd' ? <Check size={12} className="text-green-500 animate-scale-up" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 text-[11px] text-amber-700 leading-normal">
                    <Info size={14} className="shrink-0 mt-0.5 text-amber-500" />
                    <span>
                      <strong>Lưu ý quan trọng:</strong> Vui lòng quét mã QR chuyển khoản đúng <strong>500.000 ₫</strong> và điền chính xác nội dung ghi chú để giao dịch được phê duyệt tự động ngay lập tức.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPayConfirmStep(1)}
                      className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-gray-100 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={paying}
                      className="flex-1 btn btn-primary h-11 rounded-xl font-bold text-center flex items-center justify-center shadow-md"
                    >
                      {paying ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Tôi đã chuyển khoản thành công'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 4 && (
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-elevated">
                <ShieldCheck size={44} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-ink">Đặt cọc giữ chỗ thành công!</h2>
                <p className="text-sm text-ink-muted max-w-sm mx-auto">
                  Biên lai cọc mã <span className="font-bold text-ink">#REC-{Math.floor(Math.random() * 90000) + 10000}</span> của phòng {room?.code} đã được phê duyệt.
                </p>
              </div>

              <div className="border border-line rounded-2xl p-5 bg-gray-50 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-ink-muted">Người giao dịch:</span> <span className="font-semibold text-ink">{fullName}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Số CCCD:</span> <span className="font-semibold text-ink">{cccd}</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Số tiền đã cọc:</span> <span className="font-bold text-primary">500.000 ₫</span></div>
                <div className="flex justify-between"><span className="text-ink-muted">Phương thức:</span> <span className="font-semibold uppercase text-ink">{payMethod}</span></div>
              </div>

              <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl flex gap-3 text-xs leading-relaxed text-left max-w-md mx-auto border border-amber-200">
                <Sparkles size={16} className="shrink-0 mt-0.5" />
                <span>Quản lý cơ sở sẽ liên hệ trực tiếp đến bạn qua điện thoại hoặc email trong vòng tối đa 24 giờ để xếp lịch hẹn làm hợp đồng thuê phòng.</span>
              </div>

              <div className="flex gap-4 justify-center">
                <Link to="/" className="btn btn-secondary btn-md rounded-xl font-bold">Quay lại trang chủ</Link>
                <Link to="/rooms" className="btn btn-primary btn-md rounded-xl font-bold">Tìm thêm phòng</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLargeQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col items-center animate-[fadeInScale_0.3s_ease-out]">
            <button
              onClick={() => setShowLargeQR(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-ink mb-1 text-center">Mã QR Thanh Toán</h3>
            <p className="text-xs text-ink-muted mb-4 text-center">Quét mã bằng ứng dụng ngân hàng hoặc ví điện tử để chuyển khoản</p>

            <div className="bg-white p-2 rounded-2xl border border-line shadow-sm w-full max-w-[420px] h-[420px] flex items-center justify-center bg-gray-50/50">
              <img
                src={
                  property?.qrCodeUrl ||
                  `https://img.vietqr.io/image/MB-0364962299-compact2.png?amount=500000&addInfo=${encodeURIComponent(`DAT COC PHONG ${room?.code} - SĐT ${phone}`)}&accountName=${encodeURIComponent('HE THONG NHA TRO AN NINH')}`
                }
                alt="Large QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            
            <div className="mt-5 w-full bg-gray-50 border border-line rounded-xl p-4 text-xs space-y-2 max-w-[420px]">
              <div className="flex justify-between items-center"><span className="text-ink-muted font-medium text-sm">Số tiền:</span> <span className="font-extrabold text-primary text-base">500.000 ₫</span></div>
              <div className="flex justify-between items-center"><span className="text-ink-muted font-medium text-sm">Nội dung:</span> <span className="font-bold text-ink text-sm">{`DAT COC PHONG ${room?.code} ${phone}`}</span></div>
            </div>

            <button
              onClick={() => setShowLargeQR(false)}
              className="mt-5 w-full max-w-[420px] btn btn-primary h-12 rounded-xl font-bold text-base shadow-md"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
