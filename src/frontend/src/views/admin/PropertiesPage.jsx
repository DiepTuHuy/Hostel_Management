import { useState, useEffect } from 'react';
import { Plus, MapPin, Users, X, Home, Phone, Mail, Calendar, Edit, DoorOpen, TrendingUp, Save, Upload, ArrowUpRight } from 'lucide-react';
import { Button, PageHeader, Badge, Loading, Toast } from '../../components/common';
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
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white border border-zinc-200/80 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        
        {/* Cover image header with contrast overlay */}
        <div className="h-48 relative overflow-hidden bg-zinc-900 select-none">
          {property.image ? (
            <img src={property.image} alt={formData.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
              <Home size={40} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/25 transition-colors active:scale-90"
          >
            <X size={16} />
          </button>
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider mb-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> Hoạt động
            </span>
            <h2 className="text-lg font-extrabold text-white leading-tight">{formData.name}</h2>
            <p className="text-white/80 text-xs mt-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-zinc-400" />
              {formData.address}, {formData.district}
            </p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)] space-y-6">
          {!isEditing ? (
            <>
              {/* Stat Bento capsules */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-3.5 text-center">
                  <DoorOpen size={16} className="mx-auto text-blue-600 mb-1" />
                  <div className="text-base font-extrabold text-zinc-900">{formData.totalRooms}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tổng số phòng</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-3.5 text-center">
                  <Home size={16} className="mx-auto text-emerald-600 mb-1" />
                  <div className="text-base font-extrabold text-zinc-900">{formData.occupiedRooms}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Đã cho thuê</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-3.5 text-center">
                  <DoorOpen size={16} className="mx-auto text-amber-600 mb-1" />
                  <div className="text-base font-extrabold text-zinc-900">{emptyRooms}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Còn trống</div>
                </div>
                <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-3.5 text-center">
                  <TrendingUp size={16} className="mx-auto text-violet-600 mb-1" />
                  <div className="text-base font-extrabold text-zinc-900">{occupancyRate}%</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tỷ lệ lấp đầy</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Details Section */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Thông tin vận hành</h4>
                  <div className="bg-white border border-zinc-200/50 rounded-2xl divide-y divide-zinc-100 text-xs">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold">Mã chi nhánh</span>
                      <span className="font-bold text-zinc-800">{property.code}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold">Thành phố</span>
                      <span className="font-bold text-zinc-800">{formData.district}, {formData.city || 'TP. HCM'}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Calendar size={13} /> Ngày thành lập</span>
                      <span className="font-bold text-zinc-800">{new Date(property.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Users size={13} /> Người quản lý</span>
                      <span className="font-bold text-zinc-800">
                        {property.managerIds && property.managerIds.length > 0 ? `${property.managerIds.length} người phụ trách` : 'Chưa phân công'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Thông tin liên hệ</h4>
                  <div className="bg-white border border-zinc-200/50 rounded-2xl divide-y divide-zinc-100 text-xs">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Phone size={13} /> Điện thoại liên hệ</span>
                      <span className="font-bold text-zinc-800">{formData.phone}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-zinc-500 font-semibold flex items-center gap-1.5"><Mail size={13} /> Hộp thư email</span>
                      <span className="font-bold text-zinc-800">{formData.email}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code section */}
                {formData.qrCodeUrl && (
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Mã QR thanh toán</h4>
                    <div className="bg-zinc-50 rounded-2xl p-4 flex justify-center border border-zinc-200/50">
                      <img src={formData.qrCodeUrl} alt="QR thanh toán chi nhánh" className="max-h-40 object-contain rounded-lg shadow-sm" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Edit size={14} /> Chỉnh sửa thông tin
                </button>
                <button
                  onClick={onClose}
                  className="px-5 h-10 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors active:scale-95"
                >
                  Đóng
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {validationError && (
                <div className="p-3 bg-red-50 text-danger text-xs rounded-xl font-bold animate-[fadeIn_0.2s_ease-out]">
                  {validationError}
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tên chi nhánh nhà trọ <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Địa chỉ <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quận / Huyện <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Thành phố</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tổng số phòng <span className="text-danger">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) => handleChange('totalRooms', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Đã cho thuê</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalRooms}
                    value={formData.occupiedRooms}
                    onChange={(e) => handleChange('occupiedRooms', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Phone size={12} /> Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail size={12} /> Email liên hệ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Ảnh mã QR thanh toán</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.qrCodeUrl}
                    onChange={(e) => handleChange('qrCodeUrl', e.target.value)}
                    className="flex-1 h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                    placeholder="VD: Dán link ảnh QR..."
                  />
                  <label className="h-10 px-4 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors active:scale-95">
                    <Upload size={13} />
                    Tải lên
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
                  <div className="mt-3 relative inline-block border border-zinc-200/60 rounded-2xl p-1.5 bg-white">
                    <img src={formData.qrCodeUrl} alt="Preview QR" className="max-h-28 object-contain rounded-lg" />
                    <button
                      type="button"
                      onClick={() => handleChange('qrCodeUrl', '')}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                      title="Xoá"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="submit"
                  className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Save size={14} /> Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 h-10 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 transition-colors active:scale-95"
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
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white border border-zinc-200/80 rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-zinc-950">Thêm nhà trọ mới</h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-semibold">Tạo thêm cơ sở mới vào mạng lưới</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-50 rounded-xl text-zinc-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-xs rounded-xl font-bold animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tên chi nhánh nhà trọ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              placeholder="VD: Nhà trọ Sunrise Q7"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Địa chỉ cụ thể <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              placeholder="VD: 546 Huỳnh Tấn Phát, P. Tân Thuận"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quận / Huyện <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="VD: Quận 7"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Thành phố</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quy mô (Số lượng phòng) <span className="text-danger">*</span></label>
              <input
                type="number"
                min="1"
                value={formData.totalRooms}
                onChange={(e) => handleChange('totalRooms', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="VD: 32"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quản lý phụ trách</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => handleChange('managerName', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="Nhập tên người quản lý"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Phone size={12} /> Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail size={12} /> Email liên hệ</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Ảnh mã QR thanh toán</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.qrCodeUrl}
                onChange={(e) => handleChange('qrCodeUrl', e.target.value)}
                className="flex-1 h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                placeholder="VD: Dán link ảnh QR..."
              />
              <label className="h-10 px-4 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer shrink-0 transition-colors active:scale-95">
                <Upload size={13} />
                Tải lên
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
              <div className="mt-3 relative inline-block border border-zinc-200/60 rounded-2xl p-1.5 bg-white">
                <img src={formData.qrCodeUrl} alt="Preview QR" className="max-h-28 object-contain rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleChange('qrCodeUrl', '')}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                  title="Xoá"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <button
              type="submit"
              className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} /> Thêm nhà trọ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-10 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 transition-colors active:scale-95"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-[fadeIn_0.3s_ease-out]">
          {properties.map((p) => {
            const occRate = p.occupancyRate || Math.round(((p.occupiedRooms || 0) / (p.totalRooms || 10)) * 100);
            return (
              <div
                key={p.id}
                className="group relative overflow-hidden bg-white border border-zinc-200/50 rounded-3xl cursor-pointer hover:shadow-md transition-all duration-300 active:scale-[0.99] flex flex-col justify-between"
                onClick={() => handleViewDetail(p)}
              >
                {/* Cover Photo with Contrast Gradient Overlay */}
                <div className="h-48 bg-zinc-900 relative overflow-hidden select-none">
                  {p.image ? (
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                      <Home size={32} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold text-emerald-600 bg-white border border-emerald-100 uppercase tracking-wider select-none shadow-sm">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> Hoạt động
                  </span>
                  
                  <span className="absolute top-4 right-4 text-[10px] text-white/90 font-extrabold uppercase bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/5 tracking-wider select-none">
                    {p.code}
                  </span>

                  {/* Header overlay text */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="font-extrabold text-base text-white tracking-tight leading-snug line-clamp-1 group-hover:text-primary-soft transition-colors">{p.name}</h3>
                    <p className="text-white/85 text-xs mt-1 flex items-center gap-1 font-semibold">
                      <MapPin size={12} className="text-zinc-400 shrink-0" />
                      <span className="truncate">{p.address}, {p.district}</span>
                    </p>
                  </div>
                </div>

                {/* Details under cover */}
                <div className="p-5 flex-1 flex flex-col justify-between select-none">
                  
                  {/* Occupancy Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>Hiệu suất lấp đầy</span>
                      <span className="text-zinc-900 font-extrabold">{occRate}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-primary h-full transition-all duration-500" 
                        style={{ width: `${occRate}%` }} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-zinc-100 pt-4">
                    <div>
                      <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Số phòng cho thuê</div>
                      <div className="font-extrabold text-zinc-800 mt-0.5">{p.occupiedRooms || 0} / {p.totalRooms} Phòng</div>
                    </div>
                    <div className="border-l border-zinc-100 pl-3">
                      <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Phân công quản lý</div>
                      <div className="font-extrabold text-zinc-800 mt-0.5">{p.managerIds ? p.managerIds.length : 0} Manager</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-zinc-400" /> {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-primary font-extrabold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Xem chi tiết <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
