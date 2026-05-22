import { Plus, FileText, ChevronRight } from 'lucide-react';
import { Button, PageHeader, Card, CardHeader, Table, Badge } from '../../components/common';
import { useContracts } from '../../controllers/useContracts.js';
import { CONTRACT_STATUS_META } from '../../models/Contract.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export default function ManagerContractsPage() {
  const { data: contracts = [] } = useContracts({ propertyId: 'p-001' });

  return (
    <>
      <PageHeader
        title="Khách thuê & hợp đồng"
        subtitle="Quản lý hợp đồng các phòng do bạn phụ trách"
        actions={<Button icon={<Plus size={16} />}>Lập hợp đồng mới</Button>}
      />

      <Card className="mb-gutter bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <h3 className="text-title-lg text-ink mb-3">Quy trình lập hợp đồng mới (3 bước)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: 1, t: 'Chọn phòng', d: 'Từ danh sách phòng trống' },
            { n: 2, t: 'Khách thuê', d: 'Tạo mới hoặc chọn từ DB' },
            { n: 3, t: 'Điều khoản & ký', d: 'Gửi link ký số qua email' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{s.n}</div>
              <div>
                <div className="font-semibold text-ink">{s.t}</div>
                <div className="text-xs text-ink-muted">{s.d}</div>
              </div>
              {s.n < 3 && <ChevronRight className="ml-auto text-ink-muted" />}
            </div>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <CardHeader title="Hợp đồng tại cơ sở" subtitle="An Phú Q1" />
        <Table
          columns={[
            { key: 'code', header: 'Mã HĐ', render: (c) => <span className="font-semibold text-primary">{c.code}</span> },
            { key: 'room', header: 'Phòng', render: (c) => c.roomId },
            { key: 'tenant', header: 'Khách thuê', render: (c) => c.tenantId || '—' },
            { key: 'start',  header: 'Bắt đầu', render: (c) => formatDate(c.startDate) },
            { key: 'end',    header: 'Kết thúc', render: (c) => formatDate(c.endDate) },
            { key: 'rent',   header: 'Giá thuê', className: 'text-right', render: (c) => formatCurrency(c.monthlyRent) },
            { key: 'status', header: 'Trạng thái', render: (c) => <Badge color={CONTRACT_STATUS_META[c.status]?.color}>{c.statusMeta?.label}</Badge> },
            { key: 'action', header: '', render: () => <button className="text-primary text-sm hover:underline flex items-center gap-1"><FileText size={14}/> Xem</button> },
          ]}
          data={contracts}
        />
      </Card>
    </>
  );
}
