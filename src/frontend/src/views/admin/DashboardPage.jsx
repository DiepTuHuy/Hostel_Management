import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DoorOpen, AlertTriangle, Wrench, Plus, Calendar, X, Mail, Phone, MapPin } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, StatCard, Card, CardHeader, Badge, Table, Toast } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';
import { useInvoices } from '../../controllers/useInvoices.js';
import { reportService, propertyService } from '../../services/index.js';
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
  const navigate = useNavigate();
  const { data: properties = [], loading } = useProperties();
  const { data: invoices = [] } = useInvoices();

  const [currentMonth, setCurrentMonth] = useState('Tháng 05/2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [localProperties, setLocalProperties] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  
  const [dashboardStats, setDashboardStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    emptyRooms: 0,
    depositRooms: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    totalDebt: 0
  });

  useEffect(() => {
    reportService.getDashboard()
      .then(data => setDashboardStats(data))
      .catch(err => console.error("Lỗi lấy dữ liệu dashboard:", err));
  }, []);

  useEffect(() => {
    if (properties.length > 0 && localProperties.length === 0) {
      setLocalProperties(properties);
    }
  }, [properties, localProperties]);

  useEffect(() => {
    const fetchRevenueBreakdown = async () => {
      try {
        const results = await Promise.all(localProperties.slice(0, 5).map(async (prop) => {
          const res = await reportService.getRevenue(prop.id, 2026);
          return { propId: prop.id, data: res };
        }));

        const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
        const chartRows = months.map((month, idx) => {
          const row = { month };
          results.forEach(res => {
            row[res.propId] = res.data[idx]?.revenue || 0;
          });
          return row;
        });
        setRevenueData(chartRows);
      } catch (err) {
        console.error("Lỗi lấy doanh thu chi nhánh:", err);
      }
    };

    if (localProperties.length > 0) {
      fetchRevenueBreakdown();
    }
  }, [localProperties]);

  const handleSelectMonth = (monthStr) => {
    setCurrentMonth(monthStr);
    setShowMonthDropdown(false);
    
    setToast({
      message: `Đã chuyển đổi kỳ báo cáo sang ${monthStr} thành công!`,
      type: 'success'
    });
  };

  const handleSaveProperty = async (formData) => {
    try {
      const newProp = await propertyService.create({
        name: formData.name,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        totalRooms: parseInt(formData.totalRooms) || 10,
        managerName: formData.managerName,
        phone: formData.phone,
        email: formData.email
      });

      setLocalProperties(prev => [newProp, ...prev]);
      setShowAddModal(false);
      
      setToast({
        message: `Đã thêm chi nhánh "${formData.name}" thành công!`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Lỗi thêm chi nhánh', type: 'error' });
    }
  };

  const revenueValue = dashboardStats.totalRevenue;
  const totalRooms = dashboardStats.totalRooms;
  const occupiedRooms = dashboardStats.occupiedRooms;
  const occRate = dashboardStats.occupancyRate;
  const debts = dashboardStats.totalDebt;
  const multiplier = 1.0;
  const mappedRevenue = revenueData;

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
        <StatCard label="Doanh thu tháng" value={formatCurrency(revenueValue, { compact: true })} delta={multiplier >= 1 ? 12.5 : multiplier === 0.92 ? 8.2 : -3.1} icon={Wallet} accent="primary" onClick={() => navigate('/admin/reports')} />
        <StatCard label="Tỉ lệ lấp đầy" value={`${occRate}%`} icon={DoorOpen} accent="info" onClick={() => navigate('/admin/branches')}
          extra={
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${occRate}%` }} />
            </div>
          }
        />
        <StatCard label="Công nợ chưa thu" value={formatCurrency(debts, { compact: true })} icon={AlertTriangle} accent="danger" onClick={() => navigate('/admin/debts')}
          extra={<div className="text-xs text-danger">Từ {invoices.filter((i) => i.status === 'overdue').length} khách hàng</div>}
        />
        <StatCard label="Chi phí vận hành" value={formatCurrency(85000000 * multiplier, { compact: true })} icon={Wrench} accent="warning" onClick={() => navigate('/admin/services')}
          extra={<div className="text-xs text-ink-muted">Đã thanh toán 80%</div>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        <Card className="lg:col-span-2">
          <CardHeader title="Biểu đồ Doanh thu 12 tháng" subtitle="Top 5 cơ sở doanh thu cao nhất" />
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={mappedRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                {localProperties.slice(0, 5).map((prop, idx) => {
                  const colors = [
                    '#3A5BC7', // primary / blue
                    '#16A34A', // green
                    '#F59E0B', // amber / yellow
                    '#DC2626', // red
                    '#06B6D4', // cyan
                    '#8B5CF6', // purple
                    '#EC4899', // pink
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <Line
                      key={prop.id}
                      type="monotone"
                      dataKey={prop.id}
                      name={prop.name}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Hoạt động gần đây" subtitle="Hệ thống & cảnh báo" />
          <ul className="space-y-3">
            {NOTIFICATIONS.map((n) => {
              const dotColors = {
                warning: 'bg-amber-500',
                danger: 'bg-red-500',
                success: 'bg-green-500',
                info: 'bg-sky-500',
              };
              const dotColorClass = dotColors[n.color] || 'bg-gray-500';
              return (
                <li key={n.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2 transition-colors">
                  <span className={`mt-1 h-2 w-2 rounded-full ${dotColorClass} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge color={n.color}>{n.type}</Badge>
                    </div>
                    <p className="text-sm text-ink mt-1">{n.text}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{formatRelative(n.time)}</p>
                  </div>
                </li>
              );
            })}
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
              render: (r) => {
                const val = revenueData.reduce((sum, row) => sum + (row[r.id] || 0), 0);
                return formatCurrency(val, { compact: true });
              }
            },
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
