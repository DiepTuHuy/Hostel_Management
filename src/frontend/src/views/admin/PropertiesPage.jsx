import { useState } from 'react';
import { Plus, MapPin, Users, MoreVertical, X, Home, Percent, Phone, Mail, Calendar, Edit, Trash2, DoorOpen, TrendingUp } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Loading } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';

function PropertyDetailModal({ property, onClose }) {
  if (!property) return null;

  const occupancyRate = property.occupancyRate || Math.round((property.occupiedRooms / property.totalRooms) * 100);
  const emptyRooms = property.totalRooms - property.occupiedRooms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="h-52 relative overflow-hidden">
          {property.image && (
            <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <Badge color="success" className="mb-2">Hoạt động</Badge>
            <h2 className="text-xl font-bold text-white leading-tight">{property.name}</h2>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              <MapPin size={14} />
              {property.address}, {property.district}
            </p>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-13rem)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-xl p-3.5 text-center">
              <DoorOpen size={20} className="mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-bold text-blue-700">{property.totalRooms}</div>
              <div className="text-xs text-blue-500 font-medium">Tổng phòng</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3.5 text-center">
              <Home size={20} className="mx-auto text-emerald-500 mb-1" />
              <div className="text-lg font-bold text-emerald-700">{property.occupiedRooms}</div>
              <div className="text-xs text-emerald-500 font-medium">Đã thuê</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3.5 text-center">
              <DoorOpen size={20} className="mx-auto text-amber-500 mb-1" />
              <div className="text-lg font-bold text-amber-700">{emptyRooms}</div>
              <div className="text-xs text-amber-500 font-medium">Trống</div>
            </div>
            <div className="bg-violet-50 rounded-xl p-3.5 text-center">
              <TrendingUp size={20} className="mx-auto text-violet-500 mb-1" />
              <div className="text-lg font-bold text-violet-700">{occupancyRate}%</div>
              <div className="text-xs text-violet-500 font-medium">Tỷ lệ lấp</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-ink mb-2.5">Thông tin chi tiết</h4>
              <div className="bg-gray-50 rounded-xl divide-y divide-line">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted">Mã chi nhánh</span>
                  <span className="text-sm font-semibold text-ink">{property.code}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted">Khu vực</span>
                  <span className="text-sm font-semibold text-ink">{property.district}, {property.city || 'TP. HCM'}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted flex items-center gap-1.5"><Calendar size={14} /> Ngày tạo</span>
                  <span className="text-sm font-semibold text-ink">{new Date(property.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink-muted flex items-center gap-1.5"><Users size={14} /> Quản lý</span>
                  <span className="text-sm font-semibold text-ink">{property.managerIds.length > 0 ? `${property.managerIds.length} người` : 'Chưa phân công'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-ink mb-2.5">Tiến độ phòng</h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-ink-muted">Đã thuê</span>
                  <span className="font-semibold text-ink">{property.occupiedRooms}/{property.totalRooms}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-line">
            <Button className="flex-1" icon={<Edit size={16} />}>Chỉnh sửa</Button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPropertyModal({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',
    city: 'TP. Hồ Chí Minh',
    totalRooms: '',
    managerName: '',
    phone: '',
    email: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-ink">Thêm nhà trọ mới</h2>
            <p className="text-sm text-ink-muted mt-0.5">Nhập thông tin chi nhánh mới</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Tên nhà trọ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: Nhà trọ Sunrise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Địa chỉ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: 123 Đường Láng, P. ABC"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Quận / Huyện <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: Đống Đa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Thành phố</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Số lượng phòng <span className="text-danger">*</span></label>
              <input
                type="number"
                min="1"
                value={formData.totalRooms}
                onChange={(e) => handleChange('totalRooms', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: 24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Quản lý phụ trách</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => handleChange('managerName', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="Họ tên quản lý"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1"><Phone size={14} /> Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1"><Mail size={14} /> Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" icon={<Plus size={16} />}>Thêm nhà trọ</Button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PropertyContextMenu({ property, onClose, onViewDetail }) {
  return (
    <div className="absolute top-12 right-3 z-20 bg-surface rounded-xl shadow-lg border border-line py-1.5 min-w-[160px] animate-[fadeInScale_0.15s_ease-out]">
      <button
        onClick={() => { onViewDetail(property); onClose(); }}
        className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Home size={14} /> Xem chi tiết
      </button>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Edit size={14} /> Chỉnh sửa
      </button>
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Users size={14} /> Phân công quản lý
      </button>
      <div className="border-t border-line my-1" />
      <button
        onClick={onClose}
        className="w-full px-4 py-2 text-left text-sm text-danger hover:bg-red-50 transition-colors flex items-center gap-2"
      >
        <Trash2 size={14} /> Ngừng hoạt động
      </button>
    </div>
  );
}

export default function PropertiesPage() {
  const { data: properties = [], loading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [contextMenuId, setContextMenuId] = useState(null);

  const handleViewDetail = (property) => {
    setSelectedProperty(property);
    setContextMenuId(null);
  };

  const toggleContextMenu = (id) => {
    setContextMenuId(prev => prev === id ? null : id);
  };

  return (
    <>
      <PageHeader
        title="Nhà trọ &amp; chi nhánh"
        subtitle="Quản lý các nhà trọ trong chuỗi của bạn"
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Thêm nhà trọ</Button>}
      />

      {loading ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {properties.map((p) => (
            <Card key={p.id} padded={false} className="group overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl">
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />}
                <Badge color="success" className="absolute top-3 left-3">Hoạt động</Badge>
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleContextMenu(p.id); }}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-md text-ink-muted hover:bg-white transition-colors"
                    style={{ position: 'absolute', top: '-2.5rem', right: '0.75rem' }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {contextMenuId === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setContextMenuId(null)} />
                      <PropertyContextMenu
                        property={p}
                        onClose={() => setContextMenuId(null)}
                        onViewDetail={handleViewDetail}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink line-clamp-1">{p.name}</h3>
                  <span className="text-xs text-ink-muted">{p.code}</span>
                </div>
                <p className="text-sm text-ink-muted mt-1 flex items-start gap-1.5">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{p.address}, {p.district}</span>
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-ink-muted uppercase">Phòng</div>
                    <div className="font-semibold text-ink">{p.occupiedRooms} / {p.totalRooms}</div>
                  </div>
                  <div>
                    <div className="text-xs text-ink-muted uppercase">Tỉ lệ lấp</div>
                    <div className="font-semibold text-success">{p.occupancyRate}%</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1">
                    <Users size={14} /> {p.managerIds.length} quản lý
                  </span>
                  <button
                    onClick={() => handleViewDetail(p)}
                    className="text-primary font-medium hover:underline transition-colors"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {showAddModal && (
        <AddPropertyModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
