import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Zap, DoorOpen, Home, Maximize, ShieldAlert, BadgeCheck } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';
import { ROOM_STATUS_META } from '../../models/Room.js';

export default function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

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

  if (!room) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-ink">Không tìm thấy phòng</h2>
        <p className="text-sm text-ink-muted mt-2">Phòng trọ này không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống.</p>
        <Link to="/rooms" className="btn btn-primary btn-md rounded-xl mt-6">Quay lại tìm phòng</Link>
      </div>
    );
  }

  const allPhotos = room.photos.length > 0 ? room.photos : [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
  ];

  return (
    <div className="bg-[#F5F7FB] min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/rooms" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mb-6">
          <ChevronLeft size={16} /> Quay lại tìm phòng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-line overflow-hidden shadow-card p-4">
              <div className="h-80 md:h-[400px] bg-gray-100 rounded-xl overflow-hidden relative">
                <img
                  src={allPhotos[activePhoto]}
                  alt={`Phòng ${room.code}`}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${room.statusBgClass}`}>
                  {ROOM_STATUS_META[room.status]?.label}
                </span>
              </div>
              {allPhotos.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
                  {allPhotos.map((photo, i) => (
                    <button
                      key={photo}
                      onClick={() => setActivePhoto(i)}
                      className={`w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${activePhoto === i ? 'border-primary scale-95 shadow-sm' : 'border-transparent opacity-75'}`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-line p-6 shadow-card space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary bg-primary-soft px-2.5 py-1 rounded">
                  Phòng {room.code}
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-ink mt-3">
                  {property ? property.name : 'Căn hộ dịch vụ tiện nghi'}
                </h1>
                <p className="text-sm text-ink-muted mt-2 flex items-center gap-1.5">
                  <MapPin size={16} className="text-primary" />
                  <span>{property ? `${property.address}, ${property.district}` : 'Hồ Chí Minh, Việt Nam'}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y border-line text-center">
                <div className="space-y-1">
                  <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Diện tích</span>
                  <div className="text-lg font-bold text-ink flex items-center justify-center gap-1">
                    <Maximize size={16} className="text-primary" /> {room.area} m²
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Vị trí</span>
                  <div className="text-lg font-bold text-ink flex items-center justify-center gap-1">
                    <DoorOpen size={16} className="text-primary" /> Tầng {room.floor}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wide">Loại phòng</span>
                  <div className="text-lg font-bold text-ink flex items-center justify-center gap-1 capitalize">
                    <Home size={16} className="text-primary" /> {room.type}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-ink mb-3">Mô tả chi tiết</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {room.description || 'Phòng cho thuê sở hữu vị trí thuận lợi, khu vực dân cư an ninh, yên tĩnh. Phòng thiết kế hiện đại, ngập tràn ánh sáng tự nhiên với đầy đủ nội thất cao cấp. Giờ giấc tự do hoàn toàn bằng khoá vân tay bảo mật.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-ink mb-3">Tiện ích đi kèm</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map(a => (
                    <div key={a} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-line rounded-xl text-sm text-ink-muted">
                      <BadgeCheck size={16} className="text-green-500 shrink-0" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg text-ink mb-3">Vị trí bản đồ</h3>
                <div className="h-64 bg-gray-100 rounded-xl border border-line flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[#E8EEF9] opacity-40 pattern-grid" />
                  <div className="relative z-10 text-center space-y-2 p-4">
                    <MapPin size={36} className="text-primary mx-auto animate-bounce" />
                    <p className="text-xs text-ink font-semibold">{property ? `${property.address}, ${property.district}` : 'Thành phố Hồ Chí Minh'}</p>
                    <p className="text-[10px] text-ink-muted">Xem bản đồ chi tiết khu vực</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-line p-6 shadow-card sticky top-24 space-y-6">
              <div>
                <span className="text-xs text-ink-muted block leading-none">Giá thuê phòng</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-primary">{formatCurrency(room.price)}</span>
                  <span className="text-sm text-ink-muted font-medium">/tháng</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-line space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-ink-muted">Tiền đặt cọc giữ chỗ:</span>
                  <span className="font-bold text-ink">500.000 ₫</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-line pt-2">
                  <span className="text-ink-muted">Trạng thái phòng:</span>
                  <span className={`font-bold ${room.statusTextClass}`}>
                    {ROOM_STATUS_META[room.status]?.label}
                  </span>
                </div>
              </div>

              {room.status === 'vacant' ? (
                <Link
                  to={`/rooms/${room.id}/deposit`}
                  className="btn btn-primary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center shadow-md active:scale-98 transition-all"
                >
                  Đặt cọc giữ phòng ngay
                </Link>
              ) : (
                <button
                  disabled
                  className="btn btn-primary h-12 w-full rounded-xl font-bold bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                >
                  Phòng không khả dụng
                </button>
              )}

              <a
                href={`tel:${property?.phone || '19008686'}`}
                className="btn btn-secondary h-12 w-full rounded-xl font-bold text-center flex items-center justify-center hover:bg-gray-50 transition-all"
              >
                Liên hệ quản lý trọ
              </a>

              <div className="flex gap-2 text-[11px] text-ink-muted leading-relaxed">
                <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Chính sách cọc giữ phòng sẽ được hoàn lại hoặc cấn trừ vào đợt thanh toán cọc chính thức khi hợp đồng thuê có hiệu lực.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
