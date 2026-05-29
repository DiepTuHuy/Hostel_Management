import { useState, useEffect } from 'react';
import { FileDown, Calendar, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, Card, CardHeader, Tabs, Toast } from '../../components/common';
import { useProperties } from '../../controllers/useProperties.js';
import { reportService } from '../../services/index.js';
import { formatCurrency } from '../../utils/format.js';

export default function ReportsPage() {
  const { data: properties = [], loading: propertiesLoading } = useProperties();
  const [tab, setTab] = useState('revenue');
  const [period, setPeriod] = useState('12 tháng gần nhất');
  const [branch, setBranch] = useState('all');
  const [reportType, setReportType] = useState('summary');
  
  // Dynamic interaction states
  const [chartLoading, setChartLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [debts, setDebts] = useState([]);
  const [toast, setToast] = useState(null);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    reportService.getDebts().then(res => {
      setDebts(res || []);
    }).catch(err => console.error("Error fetching debts for reports:", err));
  }, []);

  const handleApplyFilters = async () => {
    setChartLoading(true);
    try {
      const dataKey = branch === 'all' ? 'all' : branch;
      if (tab === 'revenue' || tab === 'debt') {
        const year = period === '2025' ? 2025 : 2026;
        const res = await reportService.getRevenue(branch === 'all' ? undefined : branch, year);
        setReportData(res.map(r => ({
          month: r.month,
          [dataKey]: tab === 'revenue' ? r.revenue : r.debt
        })));
      } else if (tab === 'occupancy') {
        const res = await reportService.getOccupancy();
        if (branch === 'all') {
          setReportData(res.map(o => {
            const total = o.occupied + o.empty;
            const rate = total > 0 ? Math.round((o.occupied / total) * 100) : 0;
            return {
              month: o.name,
              all: rate
            };
          }));
        } else {
          setReportData(res.filter(o => o.name === properties.find(p => p.id === branch)?.name).map(o => {
            const total = o.occupied + o.empty;
            const rate = total > 0 ? Math.round((o.occupied / total) * 100) : 0;
            return {
              month: o.name,
              [dataKey]: rate
            };
          }));
        }
      } else if (tab === 'cost') {
        const year = period === '2025' ? 2025 : 2026;
        const res = await reportService.getRevenue(branch === 'all' ? undefined : branch, year);
        setReportData(res.map(r => ({
          month: r.month,
          [dataKey]: Math.round(r.revenue * 0.4)
        })));
      }
    } catch (err) {
      console.error(err);
      setToast({ message: err.message || 'Lỗi tải dữ liệu báo cáo', type: 'error' });
    } finally {
      setChartLoading(false);
    }
  };

  const chartData = reportData;

  useEffect(() => {
    handleApplyFilters();
  }, [tab, branch, period]);

  const handleExportExcel = () => {
    setExportingExcel(true);
    try {
      let headers = ['Tháng/Cơ sở', 'Giá trị'];
      if (tab === 'occupancy') headers = ['Cơ sở', 'Tỉ lệ lấp đầy (%)'];
      else if (tab === 'revenue') headers = ['Tháng', 'Doanh thu (VND)'];
      else if (tab === 'debt') headers = ['Tháng', 'Công nợ (VND)'];
      else if (tab === 'cost') headers = ['Tháng', 'Chi phí (VND)'];

      const csvRows = [headers.join(',')];
      reportData.forEach(row => {
        csvRows.push([row.month, row.all].join(','));
      });
      
      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `bao_cao_${tab}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({
        message: 'Đã xuất dữ liệu báo cáo ra file CSV thành công!',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Lỗi xuất CSV', type: 'error' });
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      setExportingPdf(false);
      window.print();
    }, 300);
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
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
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
                    {branch === 'all' ? (
                      <Bar
                        key="all"
                        dataKey="all"
                        name="Toàn hệ thống"
                        fill="#3A5BC7"
                        radius={[4, 4, 0, 0]}
                      />
                    ) : (
                      properties
                        .filter(prop => prop.id === branch)
                        .map((prop, idx) => {
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
                            <Bar
                              key={prop.id}
                              dataKey={prop.id}
                              name={prop.name}
                              fill={color}
                              radius={[4, 4, 0, 0]}
                            />
                          );
                        })
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {tab === 'debt' && (
        <Card className="border border-line rounded-3xl bg-white shadow-sm overflow-hidden p-6 mt-gutter">
          <h3 className="text-title-lg font-bold text-ink mb-4">Chi tiết đối soát công nợ quá hạn</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-line text-xs font-semibold text-ink-muted bg-gray-50/50">
                  <th className="py-3 px-4">Mã Hóa đơn</th>
                  <th className="py-3 px-4">Phòng</th>
                  <th className="py-3 px-4">Khách thuê</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Hạn thanh toán</th>
                  <th className="py-3 px-4">Số ngày quá hạn</th>
                  <th className="py-3 px-4 text-right">Số tiền nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {debts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-ink-muted text-xs">
                      Hiện không có công nợ quá hạn cần đối soát.
                    </td>
                  </tr>
                ) : (
                  debts.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-primary">{d.invoiceCode}</td>
                      <td className="py-3.5 px-4 text-ink font-semibold">{d.roomNumber}</td>
                      <td className="py-3.5 px-4 text-ink">{d.tenantName}</td>
                      <td className="py-3.5 px-4 text-ink-muted">{d.tenantPhone}</td>
                      <td className="py-3.5 px-4 text-ink-muted">{new Date(d.dueDate).toLocaleDateString('vi-VN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold border border-red-100">
                          {d.daysOverdue} ngày
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-red-600">{formatCurrency(d.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {debts.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50/80 font-bold border-t-2 border-line">
                    <td colSpan="6" className="py-3 px-4 text-ink">Tổng cộng công nợ quá hạn</td>
                    <td className="py-3 px-4 text-right text-red-600 text-base">
                      {formatCurrency(debts.reduce((sum, d) => sum + d.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
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
