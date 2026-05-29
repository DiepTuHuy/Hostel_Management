import { useState, useEffect } from 'react';
import { Plus, Settings2, X, Check, Save, Layers, Trash2 } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Toast, Loading } from '../../components/common';
import { useFetch } from '../../controllers/useFetch.js';
import { roomTypeService, propertyService } from '../../services/index.js';
import { formatCurrency } from '../../utils/format.js';

function AddEditRoomTypeModal({ roomType, onClose, onSave }) {
  const isEdit = !!roomType;
  const [formData, setFormData] = useState({
    name: roomType?.name || '',
    area: roomType?.area || '',
    basePrice: roomType?.basePrice || '',
    amenitiesInput: roomType?.amenities ? roomType.amenities.join(', ') : 'Điều hoà, Tủ lạnh, Giường ngủ'
  });

  const [validationError, setValidationError] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.area || !formData.basePrice) {
      setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }
    
    const amenities = formData.amenitiesInput
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    onSave({
      name: formData.name,
      area: parseFloat(formData.area) || 0,
      basePrice: parseInt(formData.basePrice) || 0,
      amenities
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-ink">{isEdit ? 'Chỉnh sửa loại phòng' : 'Thêm loại phòng mới'}</h2>
            <p className="text-sm text-ink-muted mt-0.5">{isEdit ? 'Cập nhật thông số & tiện nghi' : 'Thiết lập loại phòng mới cho cơ sở'}</p>
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
            <label className="block text-sm font-semibold text-ink mb-1.5">Tên loại phòng <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              placeholder="VD: Phòng Đơn VIP, Studio, Căn hộ Penthouse..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Diện tích (m²) <span className="text-danger">*</span></label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleChange('area', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: 25"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Giá thuê cơ bản (đ) <span className="text-danger">*</span></label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleChange('basePrice', e.target.value)}
                className="w-full h-10 px-3.5 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                placeholder="VD: 3500000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Danh sách tiện nghi (cách nhau bằng dấu phẩy)</label>
            <textarea
              value={formData.amenitiesInput}
              onChange={(e) => handleChange('amenitiesInput', e.target.value)}
              className="w-full h-20 p-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
              placeholder="VD: Điều hoà, Tủ lạnh, Giường đôi, Nóng lạnh, Tủ quần áo"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-line">
            <Button type="submit" className="flex-1" icon={<Save size={16} />}>Lưu loại phòng</Button>
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

export default function RoomTypesPage() {
  const { data: properties = [] } = useFetch(() => propertyService.list(), []);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  // Set default property ID once properties list is loaded
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  const { data: listRoomTypes = [], loading, reload } = useFetch(
    () => selectedPropertyId ? roomTypeService.list(selectedPropertyId) : Promise.resolve([]),
    [selectedPropertyId]
  );
  
  // Modal visibility states
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  const handleEditClick = (rt) => {
    setSelectedRoomType(rt);
  };

  const handleDeleteClick = async (rtId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa loại phòng này? Thao tác này không thể hoàn tác.")) return;
    try {
      await roomTypeService.delete(rtId);
      setToast({ message: "Xóa loại phòng thành công!", type: "success" });
      reload();
    } catch (err) {
      setToast({
        message: `Lỗi khi xóa loại phòng: ${err?.response?.data?.message || err.message}`,
        type: 'danger'
      });
    }
  };

  const handleSaveRoomType = async (savedData) => {
    if (!selectedPropertyId) {
      setToast({ message: "Vui lòng chọn một nhà trọ trước khi thao tác.", type: "danger" });
      return;
    }
    try {
      if (selectedRoomType) {
        // Edit mode
        await roomTypeService.update(selectedRoomType.id, {
          name: savedData.name,
          area: savedData.area,
          basePrice: savedData.basePrice,
          amenities: savedData.amenities
        });
        setSelectedRoomType(null);
        setToast({
          message: `Đã cập nhật loại phòng "${savedData.name}" thành công!`,
          type: 'success'
        });
      } else {
        // Add mode
        await roomTypeService.create({
          propertyId: selectedPropertyId,
          name: savedData.name,
          area: savedData.area,
          basePrice: savedData.basePrice,
          amenities: savedData.amenities
        });
        setShowAddModal(false);
        setToast({
          message: `Đã thêm loại phòng mới "${savedData.name}" thành công!`,
          type: 'success'
        });
      }
      reload();
    } catch (err) {
      setToast({
        message: `Lỗi lưu loại phòng: ${err?.response?.data?.message || err.message}`,
        type: 'danger'
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Quản lý loại phòng & tiện nghi"
        subtitle="Thiết lập các cấu hình diện tích, giá cơ bản và danh mục tiện ích đi kèm từng loại căn hộ"
        actions={
          <Button 
            icon={<Plus size={16} />} 
            onClick={() => setShowAddModal(true)}
            disabled={!selectedPropertyId}
          >
            Thêm loại phòng
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Chọn khu vực / nhà trọ để quản lý</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors w-full sm:w-72"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? <Loading /> : (
        <Card padded={false} className="overflow-hidden animate-[fadeIn_0.3s_ease-out] border border-line rounded-3xl shadow-sm bg-white">
          <table className="table-base">
            <thead>
              <tr>
                <th>Tên loại phòng</th>
                <th>Diện tích</th>
                <th>Giá thuê cơ bản</th>
                <th>Tiện nghi đi kèm</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listRoomTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-ink-muted text-sm">Chưa có cấu hình loại phòng nào cho cơ sở này</td>
                </tr>
              ) : listRoomTypes.map((rt) => (
                <tr key={rt.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="font-bold text-ink flex items-center gap-2 py-4">
                    <div className="p-1.5 bg-primary-soft text-primary rounded-lg">
                      <Layers size={16} />
                    </div>
                    <span>{rt.name}</span>
                  </td>
                  <td><span className="font-semibold text-ink">{rt.area} m²</span></td>
                  <td>
                    <span className="font-bold text-primary">{formatCurrency(rt.basePrice)}/tháng</span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                      {rt.amenities && rt.amenities.length > 0 ? rt.amenities.map((a, i) => (
                        <Badge key={i} color="info">{a}</Badge>
                      )) : <span className="text-xs text-ink-muted">Chưa có tiện nghi</span>}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEditClick(rt)}
                        className="text-primary hover:text-primary-dark hover:underline flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg hover:bg-primary/5 transition-colors apple-press"
                      >
                        <Settings2 size={14} /> Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(rt.id)}
                        className="text-danger hover:text-red-700 hover:underline flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors apple-press"
                      >
                        <Trash2 size={14} /> Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {(showAddModal || selectedRoomType) && (
        <AddEditRoomTypeModal
          roomType={selectedRoomType}
          onClose={() => {
            setShowAddModal(false);
            setSelectedRoomType(null);
          }}
          onSave={handleSaveRoomType}
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
