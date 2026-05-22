import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';

export default function DepositPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [cccd, setCccd] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [payMethod, setPayMethod] = useState('vnpay');
  const [paying, setPaying] = useState(false);

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
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setStep(4);
    }, 1500);
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
          {step === 1 && (
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
                onClick={handlePay}
                disabled={paying}
                className="btn btn-primary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center shadow-md"
              >
                {paying ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Xác nhận & Thanh toán ngay'}
              </button>
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
    </div>
  );
}
