import { useState } from 'react';
import { FileDown, Calendar } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Button, PageHeader, Card, CardHeader, Tabs } from '../../components/common';
import revenue from '../../mocks/revenue.json';
import { formatCurrency } from '../../utils/format.js';

export default function ReportsPage() {
  const [tab, setTab] = useState('revenue');

  return (
    <>
      <PageHeader
        title="Báo cáo & thống kê"
        subtitle="Doanh thu, lấp đầy, công nợ, chi phí của toàn chuỗi"
        actions={
          <>
            <Button variant="secondary" icon={<Calendar size={16} />}>Khoảng thời gian</Button>
            <Button variant="secondary" icon={<FileDown size={16} />}>Xuất Excel</Button>
            <Button icon={<FileDown size={16} />}>Xuất PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        
        <Card className="lg:col-span-1 h-fit">
          <h3 className="text-title-lg text-ink mb-4">Bộ lọc</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Khoảng thời gian</label>
              <select className="input">
                <option>12 tháng gần nhất</option>
                <option>Năm 2026</option>
                <option>Năm 2025</option>
              </select>
            </div>
            <div>
              <label className="label">Cơ sở</label>
              <select className="input">
                <option>Tất cả</option>
                <option>An Phú Q1</option>
                <option>Hoa Sữa Q3</option>
              </select>
            </div>
            <div>
              <label className="label">Loại báo cáo</label>
              <select className="input">
                <option>Tổng hợp</option>
                <option>Chi tiết theo phòng</option>
              </select>
            </div>
            <Button className="w-full">Áp dụng</Button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-gutter">
          <Card padded={false}>
            <div className="px-6 pt-4">
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
              <h3 className="text-title-lg text-ink mb-4">
                {tab === 'revenue' && 'Doanh thu 12 tháng gần nhất'}
                {tab === 'occupancy' && 'Tỉ lệ lấp đầy theo cơ sở'}
                {tab === 'debt' && 'Công nợ theo thời gian'}
                {tab === 'cost' && 'Chi phí vận hành'}
              </h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F2F6" />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} stroke="#6B7280" fontSize={12} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Bar dataKey="p-001" name="An Phú Q1"    fill="#3A5BC7" />
                    <Bar dataKey="p-002" name="Hoa Sữa Q3"   fill="#16A34A" />
                    <Bar dataKey="p-003" name="Bình An TĐ"   fill="#F59E0B" />
                    <Bar dataKey="p-004" name="Hạnh Phúc GV" fill="#DC2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
