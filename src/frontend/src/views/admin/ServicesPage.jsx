import { useState } from 'react';
import { Plus, Settings2, X, Check, Save } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Toast } from '../../components/common';
import services from '../../mocks/services.json';
import { formatCurrency } from '../../utils/format.js';

function AddEditServiceModal({ service, onClose, onSave }) {
  const isEdit = !!service;
  const [formData, setFormData] = useState({
    name: service?.name || '',
    unit: service?.unit || 'kWh',
    type: service?.type || 'fixed',
    price: service?.price || '',
    active: service ? service.active : true
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    
    // Metered type can have tiers; if edit and it has tiers, we keep them, otherwise empty tiers.
    const savedData = {
      ...formData,
      price: formData.type === 'metered' ? null : parseInt(formData.price) || 0,
      tiers: formData.type === 'metered' ? (service?.tiers || [
        { from: 0, to: 50, price: 3000 },
        { from: 51, to: 100, price: 3500 },
        { from: 101, to: null, price: 4000 }
      ]) : null
    };

    onSave(savedData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-ink">{isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
            <p className="text-sm text-ink-muted mt-0.5">{isEdit ? 'Cập nhật đơn giá & cấu hình' : 'Thiết lập loại hình dịch vụ mới'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-ink-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-sm rounded-xl font-medium animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Tên dịch vụ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: Phí vệ sinh, Xe máy..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Đơn vị tính <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: kWh, m3, phòng, tháng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Hình thức tính</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="fixed">Cố định</option>
                <option value="metered">Theo chỉ số (Điện/Nước)</option>
              </select>
            </div>
          </div>

          {formData.type === 'fixed' ? (
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Đơn giá áp dụng (đ) <span className="text-danger">*</span></label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="Nhập số tiền đơn giá"
                required
              />
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
              <span className="font-bold block">Biểu giá tính theo lũy tiến bậc thang:</span>
              <p>Mức 1 (0-50 {formData.unit}): 3.000đ</p>
              <p>Mức 2 (51-100 {formData.unit}): 3.500đ</p>
              <p>Mức 3 (&gt;100 {formData.unit}): 4.000đ</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-ink">Kích hoạt sử dụng:</label>
            <button
              type="button"
              onClick={() => handleChange('active', !formData.active)}
              className={`h-6 w-11 rounded-full relative transition-colors duration-300 ${formData.active ? 'bg-success' : 'bg-gray-200'}`}
            >
              <span className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${formData.active ? 'right-1' : 'left-1'}`} />
            </button>
            <span className="text-xs text-ink-muted">{formData.active ? 'Đang dùng' : 'Tạm tắt'}</span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" icon={<Save size={16} />}>Lưu dịch vụ</Button>
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

export default function ServicesPage() {
  const [localServices, setLocalServices] = useState(services);
  
  // Modal visibility states
  const [selectedService, setSelectedService] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const handleEditClick = (service) => {
    setSelectedService(service);
  };

  const handleSaveService = (savedData) => {
    if (selectedService) {
      // Edit mode
      setLocalServices(prev => 
        prev.map(s => s.id === selectedService.id ? { ...s, ...savedData } : s)
      );
      setSelectedService(null);
      setToast({
        message: `Đã cập nhật dịch vụ "${savedData.name}" thành công!`,
        type: 'success'
      });
    } else {
      // Add mode
      const newId = `s-00${localServices.length + 1}`;
      const newService = {
        id: newId,
        ...savedData
      };
      setLocalServices(prev => [...prev, newService]);
      setShowAddModal(false);
      setToast({
        message: `Đã thêm dịch vụ mới "${savedData.name}" thành công!`,
        type: 'success'
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Cấu hình dịch vụ & đơn giá"
        subtitle="Thiết lập đơn giá điện, nước, internet và các dịch vụ kèm theo"
        actions={<Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Thêm dịch vụ</Button>}
      />

      <Card padded={false} className="overflow-hidden animate-[fadeIn_0.3s_ease-out] border border-line rounded-3xl shadow-sm bg-white">
        <table className="table-base">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Đơn vị</th>
              <th>Loại</th>
              <th>Đơn giá</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {localServices.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="font-semibold text-ink">{s.name}</td>
                <td>{s.unit}</td>
                <td>
                  <Badge color={s.type === 'metered' ? 'info' : 'neutral'}>
                    {s.type === 'metered' ? 'Theo chỉ số' : 'Cố định'}
                  </Badge>
                </td>
                <td>
                  {s.tiers ? (
                    <div className="space-y-1">
                      {s.tiers.map((t, i) => (
                        <div key={i} className="text-xs text-ink-muted">
                          {t.from}-{t.to ?? '∞'} {s.unit}: <strong className="text-ink">{formatCurrency(t.price)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-semibold text-primary">{formatCurrency(s.price)}/{s.unit}</span>
                  )}
                </td>
                <td>
                  <Badge color={s.active ? 'success' : 'neutral'}>{s.active ? 'Đang dùng' : 'Tạm tắt'}</Badge>
                </td>
                <td>
                  <button 
                    onClick={() => handleEditClick(s)}
                    className="text-primary hover:text-primary-dark hover:underline flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors apple-press"
                  >
                    <Settings2 size={14} /> Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-gutter animate-[fadeIn_0.3s_ease-out] border border-line rounded-3xl shadow-sm bg-white">
        <h3 className="text-title-lg font-bold text-ink mb-3">Bậc thang điện áp dụng</h3>
        <p className="text-sm text-ink-muted">
          Đơn giá điện được tính theo bậc thang dựa trên tổng lượng tiêu thụ trong kỳ. Có hiệu lực từ 01/01/2026. Thay đổi đơn giá sẽ tự động được áp dụng cho các lô hóa đơn phát hành tiếp theo.
        </p>
      </Card>

      {(showAddModal || selectedService) && (
        <AddEditServiceModal
          service={selectedService}
          onClose={() => {
            setShowAddModal(false);
            setSelectedService(null);
          }}
          onSave={handleSaveService}
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
