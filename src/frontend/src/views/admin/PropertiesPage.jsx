import { useState, useEffect } from 'react';
import { Plus, MapPin, Users, X, Home, Phone, Mail, Calendar, Edit, DoorOpen, TrendingUp, Save, Upload } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Loading, Toast } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';
import { propertyService } from '../../services/index.js';

function PropertyDetailModal({ property, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: property.name,
    address: property.address,
    district: property.district,
    city: property.city || 'TP. Hồ Chí Minh',
    totalRooms: property.totalRooms,
    occupiedRooms: property.occupiedRooms || 0,
    phone: property.phone || '0901234567',
    email: property.email || 'contact@boardinghouse.vn',
    qrCodeUrl: property.qrCodeUrl || ''
  });

  if (!property) return null;

  const occupancyRate = property.occupancyRate || Math.round((formData.occupiedRooms / formData.totalRooms) * 100);
  const emptyRooms = formData.totalRooms - formData.occupiedRooms;

  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.district) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    onSave({
      ...property,
      ...formData,
      totalRooms: parseInt(formData.totalRooms) || 10,
      occupiedRooms: parseInt(formData.occupiedRooms) || 0,
      occupancyRate: Math.round(((parseInt(formData.occupiedRooms) || 0) / (parseInt(formData.totalRooms) || 10)) * 100)
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="h-44 relative overflow-hidden bg-gray-100">
          {property.image && (
            <img src={property.image} alt={formData.name} className="w-full h-full object-cover" />
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
            <h2 className="text-xl font-bold text-white leading-tight">{formData.name}</h2>
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              <MapPin size={14} />
              {formData.address}, {formData.district}
            </p>
          </div>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(90vh-11rem)]">
          {!isEditing ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl p-3.5 text-center">
                  <DoorOpen size={20} className="mx-auto text-blue-500 mb-1" />
                  <div className="text-lg font-bold text-blue-700">{formData.totalRooms}</div>
                  <div className="text-xs text-blue-500 font-medium">Tổng phòng</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3.5 text-center">
                  <Home size={20} className="mx-auto text-emerald-500 mb-1" />
                  <div className="text-lg font-bold text-emerald-700">{formData.occupiedRooms}</div>
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
                      <span className="text-sm font-semibold text-ink">{formData.district}, {formData.city || 'TP. HCM'}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-ink-muted flex items-center gap-1.5"><Calendar size={14} /> Ngày tạo</span>
                      <span className="text-sm font-semibold text-ink">{new Date(property.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-ink-muted flex items-center gap-1.5"><Users size={14} /> Quản lý</span>
                      <span className="text-sm font-semibold text-ink">{property.managerIds && property.managerIds.length > 0 ? `${property.managerIds.length} người` : 'Chưa phân công'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-ink mb-2.5">Liên hệ chi nhánh</h4>
                  <div className="bg-gray-50 rounded-xl divide-y divide-line">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-ink-muted flex items-center gap-1.5"><Phone size={14} /> Điện thoại</span>
                      <span className="text-sm font-semibold text-ink">{formData.phone}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-ink-muted flex items-center gap-1.5"><Mail size={14} /> Email</span>
                      <span className="text-sm font-semibold text-ink">{formData.email}</span>
                    </div>
                  </div>
                </div>

                {formData.qrCodeUrl && (
                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-2.5">QR thanh toán chi nhánh</h4>
                    <div className="bg-gray-50 rounded-xl p-4 flex justify-center border border-line">
                      <img src={formData.qrCodeUrl} alt="Mã QR chi nhánh" className="max-h-48 object-contain rounded-lg" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-line">
                <Button className="flex-1" icon={<Edit size={16} />} onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink-muted hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {validationError && (
                <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
                  {validationError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Tên nhà trọ <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Địa chỉ <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  required
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
                    required
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Đã thuê</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalRooms}
                    value={formData.occupiedRooms}
                    onChange={(e) => handleChange('occupiedRooms', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5 flex items-center gap-1"><Mail size={14} /> Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Ảnh mã QR thanh toán chi nhánh</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.qrCodeUrl}
                    onChange={(e) => handleChange('qrCodeUrl', e.target.value)}
                    className="flex-1 h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                    placeholder="VD: Dán link ảnh QR hoặc click tải lên bên phải"
                  />
                  <label className="h-10 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                    <Upload size={14} />
                    Tải ảnh lên
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            handleChange('qrCodeUrl', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.qrCodeUrl && (
                  <div className="mt-2.5 relative inline-block group border border-line rounded-xl p-1.5 bg-white">
                    <img src={formData.qrCodeUrl} alt="Preview QR" className="max-h-36 object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleChange('qrCodeUrl', '')}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                      title="Xoá ảnh QR"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-line">
                <Button type="submit" className="flex-1" icon={<Save size={16} />}>Lưu thay đổi</Button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AddPropertyModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    district: '',
    city: 'TP. Hồ Chí Minh',
    totalRooms: '',
    managerName: '',
    phone: '',
    email: '',
    qrCodeUrl: ''
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.district || !formData.totalRooms) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
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
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Tên nhà trọ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: Nhà trọ Sunrise"
              required
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
              required
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
                required
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
                required
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

           <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Ảnh mã QR thanh toán chi nhánh</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.qrCodeUrl}
                onChange={(e) => handleChange('qrCodeUrl', e.target.value)}
                className="flex-1 h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: Dán link ảnh QR hoặc click tải lên bên phải"
              />
              <label className="h-10 px-4 bg-primary hover:bg-primary/95 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Upload size={14} />
                Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleChange('qrCodeUrl', reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            {formData.qrCodeUrl && (
              <div className="mt-2.5 relative inline-block group border border-line rounded-xl p-1.5 bg-white">
                <img src={formData.qrCodeUrl} alt="Preview QR" className="max-h-36 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleChange('qrCodeUrl', '')}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                  title="Xoá ảnh QR"
                >
                  <X size={10} />
                </button>
              </div>
            )}
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

export default function PropertiesPage() {
  const { data: properties = [], loading, reload } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const handleViewDetail = (property) => {
    setSelectedProperty(property);
  };

  const handleSaveNewProperty = async (formData) => {
    try {
      await propertyService.create({
        name: formData.name,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        totalRooms: parseInt(formData.totalRooms) || 10,
        phone: formData.phone,
        email: formData.email,
        qrCodeUrl: formData.qrCodeUrl
      });
      setShowAddModal(false);
      reload();
      setToast({
        message: `Đã thêm chi nhánh "${formData.name}" thành công!`,
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: `Không thể tạo nhà trọ: ${err?.response?.data?.message || err.message}`,
        type: 'danger'
      });
    }
  };

  const handleUpdateProperty = async (updatedProperty) => {
    try {
      await propertyService.update(updatedProperty.id, {
        name: updatedProperty.name,
        address: updatedProperty.address,
        district: updatedProperty.district,
        city: updatedProperty.city,
        totalRooms: updatedProperty.totalRooms,
        occupiedRooms: updatedProperty.occupiedRooms,
        phone: updatedProperty.phone,
        email: updatedProperty.email,
        status: updatedProperty.status,
        qrCodeUrl: updatedProperty.qrCodeUrl
      });
      setSelectedProperty(null);
      reload();
      setToast({
        message: `Đã cập nhật thông tin chi nhánh "${updatedProperty.name}" thành công!`,
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: `Không thể cập nhật: ${err?.response?.data?.message || err.message}`,
        type: 'danger'
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Nhà trọ &amp; chi nhánh"
        subtitle="Quản lý các nhà trọ trong chuỗi của bạn"
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Thêm nhà trọ</Button>}
      />

      {loading && properties.length === 0 ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter animate-[fadeIn_0.3s_ease-out]">
          {properties.map((p) => (
            <Card
              key={p.id}
              tilt={true}
              padded={false}
              className="group overflow-hidden apple-press cursor-pointer border border-line rounded-3xl"
              onClick={() => handleViewDetail(p)}
            >
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-apple-bouncy duration-700 group-hover:scale-105" />}
                <Badge color="success" className="absolute top-3 left-3">Hoạt động</Badge>
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink line-clamp-1 group-hover:text-primary transition-colors duration-200">{p.name}</h3>
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
                    <Users size={14} /> {p.managerIds ? p.managerIds.length : 0} quản lý
                  </span>
                  <span className="text-primary font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                    Xem chi tiết →
                  </span>
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
          onSave={handleUpdateProperty}
        />
      )}

      {showAddModal && (
        <AddPropertyModal 
          onClose={() => setShowAddModal(false)} 
          onSave={handleSaveNewProperty}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
