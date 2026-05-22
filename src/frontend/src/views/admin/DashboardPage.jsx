import { Wallet, DoorOpen, AlertTriangle, Wrench, Plus, Calendar } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, StatCard, Card, CardHeader, Badge, Table } from '../../components/common';
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

export default function DashboardPage() {
  const { data: properties = [], loading } = useProperties();
  const { data: invoices = [] } = useInvoices();

  const totalRevenue = revenue.at(-1);
  const revenueValue = totalRevenue
    ? Object.entries(totalRevenue).filter(([k]) => k !== 'month').reduce((s, [, v]) => s + v, 0)
    : 0;
  const totalRooms = properties.reduce((s, p) => s + p.totalRooms, 0);
  const occupiedRooms = properties.reduce((s, p) => s + p.occupiedRooms, 0);
  const occRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const debts = invoices.filter((i) => i.status === 'overdue' || i.status === 'pending_cash').reduce((s, i) => s + i.total, 0);

  return (
    <>
      <PageHeader
        title="Tổng quan"
        subtitle="Cập nhật tình hình kinh doanh hôm nay."
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={16} />}>Tháng 05/2026</Button>
            <Button icon={<Plus size={16} />}>Thêm nhà trọ</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
        <StatCard label="Doanh thu tháng" value={formatCurrency(revenueValue, { compact: true })} delta={12.5} icon={Wallet} accent="primary" />
        <StatCard label="Tỉ lệ lấp đầy" value={`${occRate}%`} icon={DoorOpen} accent="info"
          extra={
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-primary h-full" style={{ width: `${occRate}%` }} />
            </div>
          }
        />
        <StatCard label="Công nợ chưa thu" value={formatCurrency(debts, { compact: true })} icon={AlertTriangle} accent="danger"
          extra={<div className="text-xs text-danger">Từ {invoices.filter((i) => i.status === 'overdue').length} khách hàng</div>}
        />
        <StatCard label="Chi phí vận hành" value="85.0M ₫" icon={Wrench} accent="warning"
          extra={<div className="text-xs text-ink-muted">Đã thanh toán 80%</div>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        <Card className="lg:col-span-2">
          <CardHeader title="Biểu đồ Doanh thu 12 tháng" subtitle="Theo từng cơ sở" />
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={revenue}>
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
              <li key={n.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg -mx-2">
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
        <CardHeader title="Top cơ sở theo doanh thu" subtitle="Tháng 05/2026" />
        <Table
          columns={[
            { key: 'name',    header: 'Cơ sở',         render: (r) => <span className="font-medium text-ink">{r.name}</span> },
            { key: 'address', header: 'Địa chỉ',       render: (r) => <span className="text-ink-muted">{r.district}</span> },
            { key: 'occ',     header: 'Lấp đầy',       render: (r) => `${r.occupancyRate}%` },
            { key: 'revenue', header: 'Doanh thu',     className: 'text-right font-semibold',
              render: (r) => formatCurrency(revenue.at(-1)?.[r.id] || 0, { compact: true }) },
            { key: 'status',  header: 'Trạng thái',
              render: () => <Badge color="success">Hoạt động</Badge> },
          ]}
          data={loading ? [] : properties}
          emptyText="Chưa có nhà trọ"
        />
      </Card>
    </>
  );
}
