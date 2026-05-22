import { useState, useEffect } from 'react';
import { Wallet, DoorOpen, AlertTriangle, Wrench, Plus, Calendar, X, Mail, Phone, MapPin } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, StatCard, Card, CardHeader, Badge, Table, Toast } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';
import { useInvoices } from '../../controllers/useInvoices.js';
import revenue from '../../mocks/revenue.json';
import { formatCurrency, formatRelative } from '../../utils/format.js';

const NOTIFICATIONS = [
  { id: 1, type: 'Cảnh báo', text: 'Hợp đồng HD2025-002 sắp hết hạn (còn 39 ngày)', time: '2026-05-22T07:30:00Z', color: 'warning' },
  { id: 2, type: 'Quá hạn', text: 'Hoá đơn HD-202603-001 đã quá hạn 48 ngày — Hoàng Thuỳ Linh', time: '2026-05-21T09:00:00Z', color: 'danger' },
  { id: 3, type: 'Mới',     text: 'Có khách vãng lai đặt cọc phòng 103 — chờ Quản lý xử lý', time: '2026-05-21T15:00:00Z', color: 'info' },
  { id: 4, type: 'Hệ thống', text: 'Đã hoàn tất phát hành 39/40 hoá đơn tháng 05/2026', time: '2026-05-31T22:00:00Z', color: 'success' },
];

function AddPropertyModal({ onClose, onSave }) {
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

export default function DashboardPage() {
  const { data: properties = [], loading } = useProperties();
  const { data: invoices = [] } = useInvoices();

  const [currentMonth, setCurrentMonth] = useState('Tháng 05/2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [localProperties, setLocalProperties] = useState([]);
  const [localRevenue, setLocalRevenue] = useState(revenue);
  const [multiplier, setMultiplier] = useState(1.0);

  useEffect(() => {
    if (properties.length > 0 && localProperties.length === 0) {
      setLocalProperties(properties);
    }
  }, [properties, localProperties]);

  const handleSelectMonth = (monthStr, mult) => {
    setCurrentMonth(monthStr);
    setMultiplier(mult);
    setShowMonthDropdown(false);
    
    // Scale revenue chart data dynamically to show visually changing statistics
    const updatedRevenue = revenue.map(item => {
      const newItem = { ...item };
      Object.keys(newItem).forEach(key => {
        if (key !== 'month') {
          newItem[key] = Math.round(item[key] * mult);
        }
      });
      return newItem;
    });
    setLocalRevenue(updatedRevenue);
    
    setToast({
      message: `Đã chuyển đổi kỳ báo cáo sang ${monthStr} thành công!`,
      type: 'success'
    });
  };

  const handleSaveProperty = (formData) => {
    const newId = `p-00${localProperties.length + 1}`;
    const newProp = {
      id: newId,
      code: `P-00${localProperties.length + 1}`,
      name: formData.name,
      address: formData.address,
      district: formData.district,
      totalRooms: parseInt(formData.totalRooms) || 10,
      occupiedRooms: 0,
      occupancyRate: 0,
      managerIds: formData.managerName ? ['u2'] : [],
      createdAt: new Date().toISOString(),
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'
    };

    setLocalProperties(prev => [newProp, ...prev]);
    setShowAddModal(false);
    
    setToast({
      message: `Đã thêm chi nhánh "${formData.name}" thành công!`,
      type: 'success'
    });
  };

  // Recalculate metrics with multiplier and localProperties
  const totalRevenue = localRevenue.at(-1);
  const baseRevenue = totalRevenue
    ? Object.entries(totalRevenue).filter(([k]) => k !== 'month').reduce((s, [, v]) => s + v, 0)
    : 0;
  const revenueValue = Math.round(baseRevenue);

  const totalRooms = localProperties.reduce((s, p) => s + p.totalRooms, 0);
  const occupiedRooms = localProperties.reduce((s, p) => s + p.occupiedRooms, 0);
  const occRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const debts = invoices.filter((i) => i.status === 'overdue' || i.status === 'pending_cash').reduce((s, i) => s + i.total, 0) * multiplier;

  return (
    <>
      <PageHeader
        title="Tổng quan"
        subtitle="Cập nhật tình hình kinh doanh hôm nay."
        actions={
          <div className="relative flex gap-2">
            <div className="relative">
              <Button 
                variant="secondary" 
                icon={<Calendar size={16} />}
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              >
                {currentMonth}
              </Button>
              {showMonthDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-line rounded-2xl shadow-xl z-50 overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                  <ul className="py-1">
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 05/2026', 1.0)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${currentMonth === 'Tháng 05/2026' ? 'font-bold text-primary' : 'text-ink'}`}
                      >
                        Tháng 05/2026
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 04/2026', 0.92)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${currentMonth === 'Tháng 04/2026' ? 'font-bold text-primary' : 'text-ink'}`}
                      >
                        Tháng 04/2026
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 03/2026', 0.85)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${currentMonth === 'Tháng 03/2026' ? 'font-bold text-primary' : 'text-ink'}`}
                      >
                        Tháng 03/2026
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Thêm nhà trọ</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        <StatCard label="Doanh thu tháng" value={formatCurrency(revenueValue, { compact: true })} delta={multiplier >= 1 ? 12.5 : multiplier === 0.92 ? 8.2 : -3.1} icon={Wallet} accent="primary" />
        <StatCard label="Tỉ lệ lấp đầy" value={`${occRate}%`} icon={DoorOpen} accent="info"
          extra={
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${occRate}%` }} />
            </div>
          }
        />
        <StatCard label="Công nợ chưa thu" value={formatCurrency(debts, { compact: true })} icon={AlertTriangle} accent="danger"
          extra={<div className="text-xs text-danger">Từ {invoices.filter((i) => i.status === 'overdue').length} khách hàng</div>}
        />
        <StatCard label="Chi phí vận hành" value={formatCurrency(85000000 * multiplier, { compact: true })} icon={Wrench} accent="warning"
          extra={<div className="text-xs text-ink-muted">Đã thanh toán 80%</div>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        <Card className="lg:col-span-2">
          <CardHeader title="Biểu đồ Doanh thu 12 tháng" subtitle="Theo từng cơ sở" />
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={localRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="p-001" name="An Phú Q1"   stroke="#3A5BC7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p-002" name="Hoa Sữa Q3"  stroke="#16A34A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p-003" name="Bình An TĐ"  stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p-004" name="Hạnh Phúc GV" stroke="#DC2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Hoạt động gần đây" subtitle="Hệ thống & cảnh báo" />
          <ul className="space-y-3">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors">
                <span className={`mt-1 h-2 w-2 rounded-full bg-${n.color === 'warning' ? 'amber' : n.color === 'danger' ? 'red' : n.color === 'success' ? 'green' : 'sky'}-500 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge color={n.color}>{n.type}</Badge>
                  </div>
                  <p className="text-sm text-ink mt-1">{n.text}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{formatRelative(n.time)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Top cơ sở theo doanh thu" subtitle={currentMonth} />
        <Table
          columns={[
            { key: 'name',    header: 'Cơ sở',         render: (r) => <span className="font-medium text-ink">{r.name}</span> },
            { key: 'address', header: 'Địa chỉ',       render: (r) => <span className="text-ink-muted">{r.district}</span> },
            { key: 'occ',     header: 'Lấp đầy',       render: (r) => `${r.occupancyRate || 0}%` },
            { key: 'revenue', header: 'Doanh thu',     className: 'text-right font-semibold',
              render: (r) => formatCurrency((revenue.at(-1)?.[r.id] || 0) * multiplier, { compact: true }) },
            { key: 'status',  header: 'Trạng thái',
              render: () => <Badge color="success">Hoạt động</Badge> },
          ]}
          data={loading ? [] : localProperties}
          emptyText="Chưa có nhà trọ"
        />
      </Card>

      {showAddModal && (
        <AddPropertyModal 
          onClose={() => setShowAddModal(false)} 
          onSave={handleSaveProperty}
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
