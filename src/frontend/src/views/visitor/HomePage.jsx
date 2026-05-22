import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Shield, Zap, CircleDollarSign, CheckCircle } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [featured, setFeatured] = useState([]);
  const [district, setDistrict] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    roomService.list().then(res => {
      setFeatured(res.filter(r => r.photos.length > 0).slice(0, 3));
    });
    propertyService.list().then(res => {
      const uniqueDistricts = [...new Set(res.map(p => p.district).filter(Boolean))].sort();
      setDistricts(uniqueDistricts);
    }).catch(err => console.error("Error loading properties:", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/about') {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (location.pathname === '/contact') {
        const element = document.getElementById('contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Use a small timeout to let the DOM settle, especially when mounting
    const timer = setTimeout(handleScroll, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (district) query.set('district', district);
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) query.set('priceMin', min);
      if (max) query.set('priceMax', max);
    }
    navigate(`/rooms?${query.toString()}`);
  };

  return (
    <div className="bg-[#F5F7FB] min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E8EEF9] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-soft text-primary mb-6 animate-pulse border border-primary/10">
            <Zap size={12} /> Nền tảng quản lý nhà trọ hiện đại nhất
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-ink tracking-tight leading-tight">
            Tìm phòng trọ lý tưởng <br />
            <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-primary-dark">Nhanh chóng & Minh bạch</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-ink-muted max-w-xl mx-auto">
            Hệ thống quản lý chuỗi phòng trọ tiện nghi, thanh toán hoá đơn online bảo mật và ký hợp đồng điện tử chỉ trong vài phút.
          </p>

          <form onSubmit={handleSearch} className="mt-10 p-4 bg-white rounded-2xl shadow-card border border-line flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-line">
              <Search className="text-ink-muted" size={18} />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-ink font-medium"
              >
                <option value="">Khu vực (Tất cả)</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-line">
              <CircleDollarSign className="text-ink-muted" size={18} />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-ink font-medium"
              >
                <option value="">Khoảng giá (Tất cả)</option>
                <option value="0-3000000">Dưới 3 triệu</option>
                <option value="3000000-4000000">3 - 4 triệu</option>
                <option value="4000000-5000000">4 - 5 triệu</option>
                <option value="5000000-99000000">Trên 5 triệu</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary h-12 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all active:scale-95">
              <Search size={16} /> Tìm phòng
            </button>
          </form>
        </div>

        <div className="absolute top-1/4 left-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-36 h-36 bg-info/5 rounded-full blur-2xl pointer-events-none" />
      </section>

      <section className="py-16 px-4 max-w-container-max mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-ink">Phòng trọ nổi bật</h2>
          <p className="text-sm text-ink-muted mt-2">Danh sách phòng trống tiện nghi, đầy đủ thông tin hình ảnh thực tế.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-line shadow-card hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden flex flex-col group">
              <div className="h-48 bg-gray-100 overflow-hidden relative">
                <img
                  src={r.photos[0]}
                  alt={`Phòng ${r.code}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500 text-white shadow-sm">
                  Còn trống
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-soft px-2 py-1 rounded">
                      Phòng {r.code}
                    </span>
                    <span className="text-sm text-ink-muted font-medium">{r.area} m²</span>
                  </div>
                  <h3 className="font-bold text-lg text-ink mt-3 line-clamp-1 group-hover:text-primary transition-colors">
                    Cơ sở An Phú Quận 1
                  </h3>
                  <p className="text-sm text-ink-muted mt-1.5 line-clamp-2">
                    {r.description || 'Đầy đủ tiện nghi cao cấp, giờ giấc tự do, an ninh đảm bảo 24/7.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {r.amenities.map(a => (
                      <span key={a} className="text-xs bg-gray-50 border border-line text-ink-muted px-2.5 py-1 rounded-md">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-line flex items-center justify-between">
                  <div>
                    <span className="text-xs text-ink-muted block leading-none">Giá thuê</span>
                    <span className="text-xl font-extrabold text-primary">{formatCurrency(r.price)}</span>
                    <span className="text-xs text-ink-muted">/tháng</span>
                  </div>
                  <Link to={`/rooms/${r.id}`} className="btn btn-secondary btn-sm rounded-lg font-semibold group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    Chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="py-20 bg-white border-t border-line px-4">
        <div className="max-w-container-max mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-ink">Lợi ích vượt trội</h2>
            <p className="text-sm text-ink-muted mt-2">Giải pháp tối ưu trải nghiệm thuê phòng thời đại số.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F5F7FB] to-white border border-line text-center group hover:border-primary/20 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-primary-soft text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="font-bold text-lg text-ink">Hợp đồng điện tử</h3>
              <p className="text-sm text-ink-muted mt-3">
                Ký kết trực tuyến an toàn thông qua mã xác thực OTP gửi trực tiếp về thiết bị của bạn.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F5F7FB] to-white border border-line text-center group hover:border-primary/20 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h3 className="font-bold text-lg text-ink">Chỉ số minh bạch</h3>
              <p className="text-sm text-ink-muted mt-3">
                Nhập chỉ số điện nước công khai và nhận thông báo biến động tiêu thụ tức thời.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F5F7FB] to-white border border-line text-center group hover:border-primary/20 hover:shadow-card transition-all">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <CircleDollarSign size={28} />
              </div>
              <h3 className="font-bold text-lg text-ink">Thanh toán đa kênh</h3>
              <p className="text-sm text-ink-muted mt-3">
                Hỗ trợ VNPay, MoMo, chuyển khoản QR Banking hoặc tiền mặt trực tiếp vô cùng linh động.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 px-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-3xl max-w-5xl mx-auto my-12 text-center relative overflow-hidden shadow-elevated">
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold">Đăng ký tìm phòng ngay hôm nay</h2>
          <p className="mt-4 text-white/80 max-w-md mx-auto text-sm">
            Hàng trăm phòng trọ cao cấp đang mở rộng đón chào bạn. Chỉ cần vài bước đơn giản để chốt phòng ưng ý.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link to="/rooms" className="btn btn-lg bg-white text-primary hover:bg-gray-100 rounded-xl font-bold shadow-md">
              Khám phá phòng ngay
            </Link>
            <Link to="/login" className="btn btn-lg bg-transparent text-white border border-white/30 hover:bg-white/10 rounded-xl font-bold">
              Đăng nhập cổng khách thuê
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
