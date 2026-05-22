import { useState } from 'react';
import { Plus, Eye, FileDown } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge, Input } from '../../components/common';
import { useContracts } from '../../controllers/useContracts.js';
import { CONTRACT_STATUS_META } from '../../models/Contract.js';
import { formatDate, formatCurrency } from '../../utils/format.js';

export default function ContractsPage() {
  const [tab, setTab] = useState('all');
  const { data: contracts = [] } = useContracts();
  const filtered = tab === 'all' ? contracts : contracts.filter((c) => c.status === tab);
  const counts = {
    all: contracts.length,
    active: contracts.filter((c) => c.status === 'active').length,
    expiring: contracts.filter((c) => c.status === 'expiring').length,
    pending_sign: contracts.filter((c) => c.status === 'pending_sign').length,
    ended: contracts.filter((c) => c.status === 'ended').length,
  };

  return (
    <>
      <PageHeader
        title="Hợp đồng"
        subtitle="Toàn bộ hợp đồng của các nhà trọ trong chuỗi"
        actions={<Button icon={<Plus size={16} />}>Tạo hợp đồng mới</Button>}
      />

      <Card className="mb-4" padded={false}>
        <div className="px-6 pt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all',          label: 'Tất cả',        count: counts.all },
              { value: 'active',       label: 'Hiệu lực',      count: counts.active },
              { value: 'expiring',     label: 'Sắp hết hạn',   count: counts.expiring },
              { value: 'pending_sign', label: 'Chờ ký',        count: counts.pending_sign },
              { value: 'ended',        label: 'Đã kết thúc',   count: counts.ended },
            ]}
          />
        </div>
        <div className="flex gap-3 p-4 border-b border-line bg-gray-50">
          <Input placeholder="Tìm theo mã HĐ, khách thuê…" className="flex-1 max-w-sm" />
          <Button variant="secondary" icon={<FileDown size={16} />}>Xuất Excel</Button>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'code',    header: 'Mã HĐ', render: (c) => <span className="font-semibold text-primary">{c.code}</span> },
          { key: 'room',    header: 'Phòng',   render: (c) => c.roomId },
          { key: 'tenant',  header: 'Khách thuê', render: (c) => c.tenantId || '—' },
          { key: 'start',   header: 'Bắt đầu', render: (c) => formatDate(c.startDate) },
          { key: 'end',     header: 'Kết thúc', render: (c) => formatDate(c.endDate) },
          { key: 'rent',    header: 'Giá thuê', className: 'text-right', render: (c) => formatCurrency(c.monthlyRent) },
          { key: 'status',  header: 'Trạng thái',
            render: (c) => <Badge color={CONTRACT_STATUS_META[c.status]?.color}>{c.statusMeta?.label}</Badge> },
          { key: 'action',  header: '',
            render: () => <button className="text-primary text-sm hover:underline flex items-center gap-1"><Eye size={14} /> Xem PDF</button> },
        ]}
        data={filtered}
      />
    </>
  );
}
