import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Search, Shield, Zap, CircleDollarSign, ArrowRight, Compass } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const heroRef = useRef(null);
  const roomsRef = useRef(null);
  const benefitsRef = useRef(null);

  const [featured, setFeatured] = useState([]);
  const [district, setDistrict] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [districts, setDistricts] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    roomService.list().then(res => {
      const withPhotos = res.filter(r => r.photos.length > 0);
      const shuffled = [...withPhotos].sort(() => 0.5 - Math.random());
      setFeatured(shuffled.slice(0, 3));
    });
    propertyService.list().then(res => {
      setProperties(res);
      const uniqueDistricts = [...new Set(res.map(p => p.district).filter(Boolean))].sort();
      setDistricts(uniqueDistricts);
    }).catch(err => console.error("Error loading properties:", err));
  }, []);

  // GSAP Entrance Animations for Static Elements (Hero & Benefits)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Entrance
      gsap.fromTo('.hero-reveal', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power4.out' }
      );
      gsap.fromTo('.hero-image', 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
      );

      // Benefits Scroll Reveal
      gsap.fromTo('.benefit-reveal',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP Scroll Reveal for Dynamic Featured Rooms (only run when featured rooms are loaded)
  useEffect(() => {
    if (featured.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.room-card-reveal',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: roomsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [featured]);

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

    const timer = setTimeout(handleScroll, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const getPropertyName = (propertyId) => {
    const p = properties.find(prop => prop.id === propertyId);
    return p ? p.name : 'Cơ sở thành viên';
  };

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
    <div ref={heroRef} className="bg-canvas-light min-h-screen">
      {/* Hero Section: Asymmetric Split Layout */}
      <section className="relative overflow-hidden pt-16 lg:pt-24 pb-24 px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Side: Headline & Form */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="hero-reveal inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-primary-soft text-primary mb-6 border border-primary/10 w-fit select-none">
            <Zap size={11} className="fill-current" /> Hệ thống vận hành thế hệ mới
          </span>
          <h1 className="hero-reveal text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tighter leading-[1.1] max-w-[15ch]">
            Tìm phòng trọ lý tưởng. <span className="text-primary">Minh bạch & An tâm.</span>
          </h1>
          <p className="hero-reveal mt-6 text-sm md:text-base text-zinc-500 leading-relaxed max-w-[45ch]">
            Hợp đồng thuê ký trực tuyến bảo mật qua OTP, nhập chỉ số điện nước công khai và thanh toán trực tuyến nhanh gọn chỉ trong vài chạm.
          </p>

          {/* Premium Minimalist Search Form */}
          <form onSubmit={handleSearch} className="hero-reveal mt-10 p-3 bg-white rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col md:flex-row gap-2 max-w-xl select-none">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-200/50">
              <Search className="text-zinc-400" size={16} />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-xs text-zinc-800 font-bold cursor-pointer"
              >
                <option value="">Khu vực (Tất cả)</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-zinc-50 rounded-xl border border-zinc-200/50">
              <CircleDollarSign className="text-zinc-400" size={16} />
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-xs text-zinc-800 font-bold cursor-pointer"
              >
                <option value="">Khoảng giá (Tất cả)</option>
                <option value="0-3000000">Dưới 3 triệu</option>
                <option value="3000000-4000000">3 - 4 triệu</option>
                <option value="4000000-5000000">4 - 5 triệu</option>
                <option value="5000000-99000000">Trên 5 triệu</option>
              </select>
            </div>
            <button type="submit" className="btn btn-md btn-primary h-10 rounded-xl flex items-center justify-center gap-2 px-5 text-xs">
              <Search size={14} /> Tìm phòng
            </button>
          </form>
        </div>

        {/* Right Side: High-End Visual Asset */}
        <div className="lg:col-span-5 hero-image-container select-none">
          <div className="hero-image relative rounded-3xl overflow-hidden shadow-md border border-zinc-200/30 aspect-[4/3] bg-zinc-100">
            <img
              src="/premium_minimal_room.png"
              alt="Premium Minimalist Living Room Space"
              className="w-full h-full object-cover"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section ref={roomsRef} className="py-20 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-14 text-left border-b border-zinc-200/50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Gợi ý hôm nay</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">Phòng trống nổi bật</h2>
          </div>
          <Link to="/rooms" className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline active:scale-95 transition-transform">
            Xem tất cả phòng trống <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 select-none">
          {featured.map(r => (
            <div
              key={r.id}
              className="room-card-reveal group flex flex-col bg-white border border-zinc-200/50 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer active:scale-[0.98]"
              onClick={() => navigate(`/rooms/${r.id}`)}
            >
              <div className="h-56 bg-zinc-100 overflow-hidden relative">
                <img
                  src={r.photos[0]}
                  alt={`Phòng ${r.code}`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <span className={`absolute top-4 left-4 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full flex items-center gap-1.5 ${r.statusBgClass}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {r.statusMeta?.label || 'Còn trống'}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded-md border border-primary/5">
                      Phòng {r.code}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">{r.area} m²</span>
                  </div>
                  <h3 className="font-extrabold text-base text-zinc-900 mt-4 line-clamp-1 group-hover:text-primary transition-colors">
                    {getPropertyName(r.propertyId)}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                    {r.description || 'Đầy đủ tiện nghi cao cấp, giờ giấc tự do, an ninh đảm bảo 24/7.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {r.amenities.slice(0, 3).map(a => (
                      <span key={a} className="text-[10px] font-bold bg-zinc-50 border border-zinc-200/40 text-zinc-500 px-2 py-0.5 rounded-md">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-zinc-200/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold leading-none mb-1">Giá thuê</span>
                    <span className="text-lg font-extrabold text-primary">{formatCurrency(r.price)}</span>
                    <span className="text-[10px] text-zinc-400 font-bold"> /tháng</span>
                  </div>
                  <span className="btn btn-sm btn-secondary font-bold text-xs">
                    Chi tiết
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section: Card-less Minimalist Design */}
      <section id="about" ref={benefitsRef} className="py-24 bg-white border-t border-b border-zinc-200/50 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Giá trị cốt lõi</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">Lợi ích vượt trội</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 select-none">
            {/* Benefit Item 1 */}
            <div className="benefit-reveal text-center group">
              <div className="w-12 h-12 bg-primary-soft text-primary rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/5 group-hover:scale-105 transition-transform duration-300">
                <Shield size={22} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-950">Hợp đồng điện tử</h3>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed max-w-[28ch] mx-auto">
                Ký kết trực tuyến bảo mật tuyệt đối qua mã xác thực OTP gửi trực tiếp về Gmail của bạn.
              </p>
            </div>

            {/* Benefit Item 2 */}
            <div className="benefit-reveal text-center group">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50 group-hover:scale-105 transition-transform duration-300">
                <Zap size={22} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-950">Chỉ số minh bạch</h3>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed max-w-[28ch] mx-auto">
                Theo dõi & đối soát số lượng điện nước thực tế sử dụng trực quan với hình ảnh đo chỉ số rõ ràng.
              </p>
            </div>

            {/* Benefit Item 3 */}
            <div className="benefit-reveal text-center group">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100/50 group-hover:scale-105 transition-transform duration-300">
                <CircleDollarSign size={22} />
              </div>
              <h3 className="font-extrabold text-base text-zinc-950">Thanh toán đa kênh</h3>
              <p className="text-xs text-zinc-500 mt-3 leading-relaxed max-w-[28ch] mx-auto">
                Hỗ trợ đóng tiền qua VNPay QR, cổng thanh toán ngân hàng hoặc chuyển khoản tự động tức thời.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section: Elegant Zinc-950 Card */}
      <section id="contact" className="py-20 px-6 lg:px-8 select-none">
        <div className="bg-zinc-950 text-white rounded-3xl max-w-5xl mx-auto p-12 lg:p-16 text-center relative overflow-hidden shadow-sm border border-zinc-900">
          <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-zinc-800 text-zinc-300 mb-6 border border-zinc-700/50">
              <Compass size={10} /> Trải nghiệm ngay
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Tìm phòng trọ lý tưởng ngay hôm nay</h2>
            <p className="mt-4 text-zinc-400 text-xs md:text-sm leading-relaxed max-w-[42ch]">
              Hàng trăm phòng dịch vụ đầy đủ tiện nghi tại khu vực trung tâm đang mở cửa. Đăng ký tài khoản để khám phá ngay!
            </p>
            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <Link to="/rooms" className="btn btn-md btn-primary px-6 rounded-xl font-bold text-xs">
                Khám phá phòng trống
              </Link>
              <Link to="/login" className="btn btn-md btn-secondary bg-transparent text-white border-zinc-800 hover:bg-zinc-900 rounded-xl font-bold text-xs">
                Đăng nhập cổng khách thuê
              </Link>
            </div>
          </div>
          {/* Subtle Aurora Ambient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </section>
    </div>
  );
}
