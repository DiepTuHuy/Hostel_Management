import { useState } from 'react';
import { FileDown, Calendar, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, Card, CardHeader, Tabs, Toast } from '../../components/common';
import revenue from '../../mocks/revenue.json';
import { formatCurrency } from '../../utils/format.js';

export default function ReportsPage() {
  const [tab, setTab] = useState('revenue');
  const [period, setPeriod] = useState('12 tháng gần nhất');
  const [branch, setBranch] = useState('all');
  const [reportType, setReportType] = useState('summary');
  
  // Dynamic interaction states
  const [chartLoading, setChartLoading] = useState(false);
  const [localRevenue, setLocalRevenue] = useState(revenue);
  const [toast, setToast] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const getDisplayData = () => {
    if (tab === 'occupancy') {
      return localRevenue.map(item => ({
        month: item.month,
        'p-001': Math.min(100, Math.round(82 + (item['p-001'] ? item['p-001'] % 15 : 5))),
        'p-002': Math.min(100, Math.round(87 + (item['p-002'] ? item['p-002'] % 12 : 6))),
        'p-003': Math.min(100, Math.round(75 + (item['p-003'] ? item['p-003'] % 18 : 7))),
        'p-004': Math.min(100, Math.round(80 + (item['p-004'] ? item['p-004'] % 16 : 4))),
      }));
    }
    if (tab === 'debt') {
      return localRevenue.map(item => ({
        month: item.month,
        'p-001': Math.round((item['p-001'] || 0) * 0.08),
        'p-002': Math.round((item['p-002'] || 0) * 0.05),
        'p-003': Math.round((item['p-003'] || 0) * 0.12),
        'p-004': Math.round((item['p-004'] || 0) * 0.06),
      }));
    }
    if (tab === 'cost') {
      return localRevenue.map(item => ({
        month: item.month,
        'p-001': Math.round((item['p-001'] || 0) * 0.40),
        'p-002': Math.round((item['p-002'] || 0) * 0.38),
        'p-003': Math.round((item['p-003'] || 0) * 0.45),
        'p-004': Math.round((item['p-004'] || 0) * 0.42),
      }));
    }
    return localRevenue;
  };

  const chartData = getDisplayData();

  const handleApplyFilters = () => {
    setChartLoading(true);
    
    // Simulate real database calculation with 0.5s delay
    setTimeout(() => {
      setChartLoading(false);
      
      // Mutate chart bars depending on chosen filters
      const scale = branch === 'p-001' ? 1.4 : branch === 'p-002' ? 0.9 : 1.1;
      const updatedRevenue = revenue.map(item => {
        const newItem = { ...item };
        Object.keys(newItem).forEach(key => {
          if (key !== 'month') {
            newItem[key] = Math.round(item[key] * scale);
          }
        });
        return newItem;
      });
      setLocalRevenue(updatedRevenue);
      
      setToast({
        message: 'Đã áp dụng bộ lọc và tính toán lại biểu đồ phân tích chuỗi trọ!',
        type: 'success'
      });
    }, 550);
  };

  const handleExportExcel = () => {
    setExportingExcel(true);
    setTimeout(() => {
      setExportingExcel(false);
      setToast({
        message: 'Đã tổng hợp dữ liệu doanh thu và tải xuống tệp Excel thành công!',
        type: 'success'
      });
    }, 800);
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      setToast({
        message: 'Đã kết xuất báo cáo tài chính dạng PDF thành công!',
        type: 'success'
      });
    }, 950);
  };

  return (
    <>
      <PageHeader
        title="Báo cáo & thống kê"
        subtitle="Doanh thu, lấp đầy, công nợ, chi phí của toàn chuỗi"
        actions={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              icon={<FileDown size={16} />}
              onClick={handleExportExcel}
              loading={exportingExcel}
            >
              Xuất Excel
            </Button>
            <Button 
              icon={<FileDown size={16} />}
              onClick={handleExportPdf}
              loading={exportingPdf}
            >
              Xuất PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-gutter animate-[fadeIn_0.3s_ease-out]">
        
        <Card className="lg:col-span-1 h-fit border border-line rounded-3xl bg-white shadow-sm">
          <h3 className="text-title-lg font-bold text-ink mb-4">Bộ lọc thống kê</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Khoảng thời gian</label>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="12 tháng gần nhất">12 tháng gần nhất</option>
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Cơ sở chi nhánh</label>
              <select 
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="all">Tất cả chi nhánh</option>
                <option value="p-001">An Phú Q1</option>
                <option value="p-002">Hoa Sữa Q3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Loại báo cáo</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-line rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
              >
                <option value="summary">Tổng hợp chuỗi</option>
                <option value="details">Chi tiết theo phòng</option>
              </select>
            </div>
            
            <Button className="w-full" onClick={handleApplyFilters} loading={chartLoading}>Áp dụng bộ lọc</Button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-gutter">
          <Card padded={false} className="border border-line rounded-3xl bg-white shadow-sm overflow-hidden relative">
            
            {/* Smooth Overlay Spinning Loader */}
            {chartLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-30 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={36} className="text-primary animate-spin" />
                  <p className="text-sm font-bold text-primary">Đang truy xuất & tính toán số liệu...</p>
                </div>
              </div>
            )}

            <div className="px-6 pt-4 border-b border-line">
              <Tabs
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: 'revenue',   label: 'Doanh thu' },
                  { value: 'occupancy', label: 'Lấp đầy' },
                  { value: 'debt',      label: 'Công nợ' },
                  { value: 'cost',      label: 'Chi phí' },
                ]}
              />
            </div>
            <div className="p-6">
              <h3 className="text-title-lg font-bold text-ink mb-4">
                {tab === 'revenue' && 'Doanh thu 12 tháng gần nhất'}
                {tab === 'occupancy' && 'Tỉ lệ lấp đầy theo cơ sở'}
                {tab === 'debt' && 'Công nợ theo thời gian'}
                {tab === 'cost' && 'Chi phí vận hành tổng thể'}
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis 
                      tickFormatter={tab === 'occupancy' ? (v) => `${v}%` : (v) => `${(v / 1_000_000).toFixed(0)}M`} 
                      domain={tab === 'occupancy' ? [0, 100] : ['auto', 'auto']}
                      stroke="#6B7280" 
                      fontSize={12} 
                    />
                    <Tooltip formatter={tab === 'occupancy' ? (v) => `${v}%` : (v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="p-001" name="An Phú Q1"    fill="#3A5BC7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="p-002" name="Hoa Sữa Q3"   fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="p-003" name="Bình An TĐ"   fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="p-004" name="Hạnh Phúc GV" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>

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
