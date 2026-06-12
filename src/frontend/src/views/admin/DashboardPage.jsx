import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, DoorOpen, AlertTriangle, Wrench, Plus, Calendar, X, Mail, Phone, ArrowUpRight, TrendingUp, TrendingDown, Building2, Layers } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { Button, PageHeader, Badge, Table, Toast } from '../../components/common';
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
      <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]" onClick={onClose} />
      <div className="relative bg-white border border-zinc-200/80 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-[fadeInScale_0.3s_ease-out]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100">
          <div>
            <h2 className="text-base font-extrabold text-zinc-950">Thêm nhà trọ mới</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Nhập thông tin chi nhánh mới vào hệ thống</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
          {validationError && (
            <div className="p-3 bg-red-50 text-danger text-xs rounded-xl font-bold animate-[fadeIn_0.2s_ease-out]">
              {validationError}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Tên nhà trọ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="VD: Nhà trọ Sunrise"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Địa chỉ <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
              placeholder="VD: 123 Đường Láng, P. ABC"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quận / Huyện <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="VD: Đống Đa"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Thành phố</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Số lượng phòng <span className="text-danger">*</span></label>
              <input
                type="number"
                min="1"
                value={formData.totalRooms}
                onChange={(e) => handleChange('totalRooms', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="VD: 24"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Quản lý phụ trách</label>
              <input
                type="text"
                value={formData.managerName}
                onChange={(e) => handleChange('managerName', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="Họ tên quản lý"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Phone size={12} /> Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail size={12} /> Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors active:scale-95"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus size={14} /> Thêm nhà trọ
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
  const emptyRooms = dashboardStats.emptyRooms;
  const depositRooms = dashboardStats.depositRooms;
  const occRate = dashboardStats.occupancyRate;
  const debts = dashboardStats.totalDebt;
  const multiplier = 1.0;

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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200/60 rounded-2xl shadow-xl z-50 overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                  <ul className="py-1">
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 05/2026')}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors ${currentMonth === 'Tháng 05/2026' ? 'font-bold text-primary bg-zinc-50/50' : 'text-zinc-700'}`}
                      >
                        Tháng 05/2026
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 04/2026')}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors ${currentMonth === 'Tháng 04/2026' ? 'font-bold text-primary bg-zinc-50/50' : 'text-zinc-700'}`}
                      >
                        Tháng 04/2026
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleSelectMonth('Tháng 03/2026')}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors ${currentMonth === 'Tháng 03/2026' ? 'font-bold text-primary bg-zinc-50/50' : 'text-zinc-700'}`}
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

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-8">
        
        {/* Doanh thu tháng */}
        <div 
          onClick={() => navigate('/admin/reports')}
          className="lg:col-span-6 md:col-span-6 col-span-1 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Doanh thu tháng này</span>
              <div className="p-2.5 bg-primary/5 text-primary rounded-xl transition-colors group-hover:bg-primary group-hover:text-white">
                <Wallet size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                {formatCurrency(revenueValue, { compact: false })}
              </h2>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-semibold">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-emerald-600 font-bold">+12.5%</span> so với tháng trước
            </span>
            <span className="text-xs font-semibold text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Chi tiết <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Tỉ lệ lấp đầy */}
        <div 
          onClick={() => navigate('/admin/branches')}
          className="lg:col-span-6 md:col-span-6 col-span-1 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tỷ lệ lấp đầy</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <DoorOpen size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                {occRate}%
              </h2>
              <span className="text-xs font-bold text-zinc-500">
                {occupiedRooms}/{totalRooms} Phòng đã thuê
              </span>
            </div>
            {/* Elegant Gradient Progress Bar */}
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-primary h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
                style={{ width: `${occRate}%` }} 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-100 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <div>
              <div className="text-xs text-zinc-800 font-extrabold">{emptyRooms}</div>
              Phòng trống
            </div>
            <div className="border-l border-zinc-100">
              <div className="text-xs text-zinc-800 font-extrabold">{occupiedRooms}</div>
              Đang thuê
            </div>
            <div className="border-l border-zinc-100">
              <div className="text-xs text-zinc-800 font-extrabold">{depositRooms}</div>
              Đặt cọc
            </div>
          </div>
        </div>

        {/* Công nợ chưa thu */}
        <div 
          onClick={() => navigate('/admin/debts')}
          className="lg:col-span-4 md:col-span-2 col-span-1 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Công nợ chưa thu</span>
              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl transition-colors group-hover:bg-red-500 group-hover:text-white">
                <AlertTriangle size={16} />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              {formatCurrency(debts)}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              {invoices.filter((i) => i.status === 'overdue').length} Quá hạn
            </span>
            <span className="text-zinc-400">Nhấp để thu hồi</span>
          </div>
        </div>

        {/* Chi phí vận hành */}
        <div 
          onClick={() => navigate('/admin/services')}
          className="lg:col-span-4 md:col-span-2 col-span-1 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Chi phí vận hành</span>
              <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <Wrench size={16} />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              {formatCurrency(85000000 * multiplier)}
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              Đã trả 80%
            </span>
            <span className="text-zinc-400">Quản lý định mức</span>
          </div>
        </div>

        {/* Quy mô vận hành */}
        <div 
          onClick={() => navigate('/admin/branches')}
          className="lg:col-span-4 md:col-span-2 col-span-1 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Quy mô quản lý</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                <Building2 size={16} />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
              {localProperties.length} Chi nhánh
            </h2>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-500">
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              {totalRooms} Phòng trọ
            </span>
            <span className="text-zinc-400">Quản lý chi nhánh</span>
          </div>
        </div>

      </div>

      {/* Charts & Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Doanh thu 12 tháng Area Chart */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/50 rounded-3xl p-6">
          <div className="mb-6">
            <h3 className="text-sm font-extrabold text-zinc-950">Biểu đồ doanh thu 12 tháng</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Thống kê chi tiết doanh thu thực tế của top 5 cơ sở</p>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="month" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis 
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} 
                  stroke="#a1a1aa" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e4e4e7',
                    borderRadius: '16px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', fontWeight: 'extrabold', marginBottom: '4px', color: '#09090b' }}
                  formatter={(v) => formatCurrency(v)} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                {localProperties.slice(0, 5).map((prop, idx) => {
                  const colors = [
                    '#2563eb', // Cobalt Blue
                    '#4f46e5', // Indigo
                    '#0d9488', // Teal
                    '#7c3aed', // Purple
                    '#0891b2', // Cyan
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <Area
                      key={prop.id}
                      type="monotone"
                      dataKey={prop.id}
                      name={prop.name}
                      stroke={color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={idx === 0 ? "url(#colorRevenue)" : "transparent"}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hoạt động gần đây */}
        <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-sm font-extrabold text-zinc-950">Hoạt động gần đây</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Nhật ký hệ thống & cảnh báo quan trọng</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[320px] pr-1">
            <ul className="divide-y divide-zinc-100">
              {NOTIFICATIONS.map((n) => {
                const badgeColors = {
                  warning: 'bg-amber-50 text-amber-700 border-amber-100',
                  danger: 'bg-red-50 text-red-700 border-red-100',
                  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  info: 'bg-blue-50 text-blue-700 border-blue-100',
                };
                const badgeColorClass = badgeColors[n.color] || 'bg-zinc-50 text-zinc-700 border-zinc-150';
                return (
                  <li key={n.id} className="py-3.5 flex gap-3.5 items-start hover:bg-zinc-50/50 -mx-2 px-2 rounded-xl transition-all">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-full border ${badgeColorClass} shrink-0 mt-0.5`}>
                      {n.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-800 leading-normal">{n.text}</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1">{formatRelative(n.time)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>

      {/* Top Properties Table */}
      <div className="bg-white border border-zinc-200/50 rounded-3xl p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-950">Top chi nhánh theo doanh thu</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Bảng thống kê tỷ lệ lấp đầy và tổng doanh thu tích lũy</p>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200/50">
            Kỳ báo cáo: {currentMonth}
          </span>
        </div>

        <div className="overflow-hidden">
          <Table
            columns={[
              { 
                key: 'name',    
                header: 'Chi nhánh',         
                render: (r) => (
                  <div className="flex flex-col">
                    <span className="font-extrabold text-zinc-900 text-xs">{r.name}</span>
                    <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">{r.address}</span>
                  </div>
                ) 
              },
              { 
                key: 'address', 
                header: 'Khu vực',       
                render: (r) => <span className="text-zinc-500 text-xs font-bold">{r.district}</span> 
              },
              { 
                key: 'occ',     
                header: 'Tỷ lệ lấp đầy',       
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-800">{r.occupancyRate || 0}%</span>
                    <div className="w-16 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${r.occupancyRate || 0}%` }} />
                    </div>
                  </div>
                ) 
              },
              { 
                key: 'revenue', 
                header: 'Doanh thu tích lũy',     
                className: 'text-right font-extrabold text-xs text-zinc-950',
                render: (r) => {
                  const val = revenueData.reduce((sum, row) => sum + (row[r.id] || 0), 0);
                  return formatCurrency(val, { compact: false });
                }
              },
              { 
                key: 'status',  
                header: 'Trạng thái',
                render: () => (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> Hoạt động
                  </span>
                ) 
              },
            ]}
            data={loading ? [] : localProperties}
            emptyText="Chưa có nhà trọ nào được thêm"
          />
        </div>
      </div>

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
