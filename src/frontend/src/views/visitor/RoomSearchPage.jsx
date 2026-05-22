import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, Check, RefreshCw, Grid, List as ListIcon } from 'lucide-react';
import { roomService } from '../../services/roomService.js';
import { propertyService } from '../../services/propertyService.js';
import { formatCurrency } from '../../utils/format.js';
import { ROOM_STATUS_META } from '../../models/Room.js';

export default function RoomSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('priceMax') || '');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const AMENITIES = ['WC riêng', 'Wifi', 'Máy lạnh', 'Gác', 'Bếp'];
  const TYPES = [
    { value: 'studio', label: 'Studio khép kín' },
    { value: 'private', label: 'Phòng đơn riêng' },
    { value: 'shared', label: 'Phòng ký túc xá' }
  ];

  useEffect(() => {
    Promise.all([
      propertyService.list(),
      roomService.list()
    ]).then(([propsData, roomsData]) => {
      setProperties(propsData);
      setRooms(roomsData);
      setLoading(false);
    });
  }, []);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleReset = () => {
    setDistrict('');
    setPriceMin('');
    setPriceMax('');
    setSelectedAmenities([]);
    setSelectedTypes([]);
    setSearchParams({});
  };

  const filteredRooms = rooms.filter(r => {
    if (district) {
      const prop = properties.find(p => p.id === r.propertyId);
      if (!prop || !prop.district.toLowerCase().includes(district.toLowerCase())) return false;
    }
    if (priceMin && r.price < parseInt(priceMin, 10)) return false;
    if (priceMax && r.price > parseInt(priceMax, 10)) return false;
    if (selectedAmenities.length > 0 && !selectedAmenities.every(a => r.amenities.includes(a))) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(r.type)) return false;
    return true;
  });

  const getPropertyName = (propertyId) => {
    const p = properties.find(x => x.id === propertyId);
    return p ? p.name : 'Nhà trọ';
  };

  const getPropertyAddress = (propertyId) => {
    const p = properties.find(x => x.id === propertyId);
    return p ? `${p.address}, ${p.district}` : '';
  };

  return (
    <div className="bg-[#F5F7FB] min-h-screen py-10 px-4">
      <div className="max-w-container-max mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">Tìm phòng trống</h1>
            <p className="text-sm text-ink-muted mt-1">Tìm thấy {filteredRooms.length} phòng phù hợp với yêu cầu của bạn.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-all ${viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink-muted'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-all ${viewMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-white border-line text-ink-muted'}`}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-2xl border border-line p-6 shadow-card h-fit space-y-6">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="font-bold text-ink flex items-center gap-2">
                <SlidersHorizontal size={16} /> Bộ lọc nâng cao
              </span>
              <button onClick={handleReset} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                <RefreshCw size={12} /> Thiết lập lại
              </button>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-3">Khu vực</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-sm text-ink"
              >
                <option value="">Tất cả khu vực</option>
                <option value="Quận 1">Quận 1</option>
                <option value="Quận 3">Quận 3</option>
                <option value="Thủ Đức">Thủ Đức</option>
                <option value="Gò Vấp">Gò Vấp</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-3">Khoảng giá (VNĐ)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-line bg-gray-50 focus:outline-none focus:border-primary focus:bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-3">Loại phòng</label>
              <div className="space-y-2">
                {TYPES.map(t => {
                  const active = selectedTypes.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      onClick={() => handleTypeToggle(t.value)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold text-left transition-all ${active ? 'bg-primary-soft text-primary border-primary' : 'bg-gray-50 text-ink-muted border-line hover:bg-gray-100'}`}
                    >
                      <span>{t.label}</span>
                      {active && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-muted block mb-3">Tiện ích phòng</label>
              <div className="space-y-2">
                {AMENITIES.map(a => {
                  const checked = selectedAmenities.includes(a);
                  return (
                    <label key={a} className="flex items-center gap-2.5 cursor-pointer text-sm text-ink-muted hover:text-ink">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleAmenityToggle(a)}
                        className="rounded border-line text-primary focus:ring-primary/20 w-4 h-4"
                      />
                      <span>{a}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20 bg-white border border-line rounded-2xl">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-line p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 border border-line rounded-2xl flex items-center justify-center mx-auto mb-4 text-ink-muted">
                  <Filter size={24} />
                </div>
                <h3 className="font-bold text-lg text-ink">Không có kết quả</h3>
                <p className="text-sm text-ink-muted mt-2">Hãy thử đổi bộ lọc hoặc nới rộng tiêu chí tìm kiếm.</p>
                <button onClick={handleReset} className="btn btn-primary btn-md rounded-xl mt-6">
                  Xóa bộ lọc
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRooms.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-line shadow-card hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col group">
                    <div className="h-44 bg-gray-100 overflow-hidden relative">
                      {r.photos.length > 0 ? (
                        <img src={r.photos[0]} alt={`Phòng ${r.code}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-soft text-primary font-bold text-xl">
                          Phòng {r.code}
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold rounded-full bg-${ROOM_STATUS_META[r.status]?.color}-500 text-white shadow-sm`}>
                        {ROOM_STATUS_META[r.status]?.label}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span className="font-bold text-primary uppercase bg-primary-soft px-1.5 py-0.5 rounded">P. {r.code}</span>
                          <span>{r.area} m² · Tầng {r.floor}</span>
                        </div>
                        <h3 className="font-bold text-base text-ink mt-3 line-clamp-1 group-hover:text-primary transition-colors">
                          {getPropertyName(r.propertyId)}
                        </h3>
                        <p className="text-xs text-ink-muted mt-1 truncate">
                          {getPropertyAddress(r.propertyId)}
                        </p>
                      </div>
                      <div className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-ink-muted block leading-none">Giá thuê</span>
                          <span className="text-lg font-extrabold text-primary">{formatCurrency(r.price)}</span>
                        </div>
                        <Link to={`/rooms/${r.id}`} className="btn btn-secondary btn-sm rounded-lg font-semibold group-hover:bg-primary group-hover:text-white transition-all">
                          Xem phòng
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRooms.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-line shadow-card hover:shadow-elevated transition-all p-4 flex flex-col sm:flex-row gap-4 items-center group">
                    <div className="w-full sm:w-44 h-32 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                      {r.photos.length > 0 ? (
                        <img src={r.photos[0]} alt={`Phòng ${r.code}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-soft text-primary font-bold text-lg">
                          Phòng {r.code}
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-${ROOM_STATUS_META[r.status]?.color}-500 text-white shadow-sm`}>
                        {ROOM_STATUS_META[r.status]?.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row justify-between w-full gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <span className="font-bold text-primary uppercase bg-primary-soft px-1.5 py-0.5 rounded">P. {r.code}</span>
                          <span>{r.area} m² · Tầng {r.floor}</span>
                        </div>
                        <h3 className="font-bold text-lg text-ink mt-2 group-hover:text-primary transition-colors">
                          {getPropertyName(r.propertyId)}
                        </h3>
                        <p className="text-sm text-ink-muted mt-1">
                          {getPropertyAddress(r.propertyId)}
                        </p>
                        <div className="flex gap-1.5 mt-3">
                          {r.amenities.slice(0, 3).map(a => (
                            <span key={a} className="text-xs bg-gray-50 border border-line text-ink-muted px-2 py-0.5 rounded">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end justify-end shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-line w-full sm:w-auto">
                        <div>
                          <span className="text-[10px] text-ink-muted block leading-none">Giá thuê</span>
                          <span className="text-2xl font-extrabold text-primary">{formatCurrency(r.price)}</span>
                          <span className="text-xs text-ink-muted">/tháng</span>
                        </div>
                        <Link to={`/rooms/${r.id}`} className="btn btn-secondary btn-md rounded-lg font-semibold group-hover:bg-primary group-hover:text-white transition-all mt-3">
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
