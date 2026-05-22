import { useState } from 'react';
import { Plus, Send, FileDown, Filter } from 'lucide-react';
import { Button, PageHeader, Card, Tabs, Table, Badge } from '../../components/common';
import { useInvoices } from '../../controllers/useInvoices.js';
import { INVOICE_STATUS_META } from '../../models/Invoice.js';
import { formatCurrency, formatDate, formatPeriod } from '../../utils/format.js';

export default function InvoicesPage() {
  const [tab, setTab] = useState('all');
  const { data: invoices = [] } = useInvoices();
  const filtered = tab === 'all' ? invoices : invoices.filter((i) => i.status === tab);

  return (
    <>
      <PageHeader
        title="Hoá đơn"
        subtitle="Phát hành & theo dõi hoá đơn cuối tháng"
        actions={
          <>
            <Button variant="secondary" icon={<FileDown size={16} />}>Xuất Excel</Button>
            <Button icon={<Send size={16} />}>Phát hành lô</Button>
          </>
        }
      />

      <Card className="mb-4" padded={false}>
        <div className="px-6 pt-4">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'all',          label: 'Tất cả',  count: invoices.length },
              { value: 'pending',      label: 'Đang chờ', count: invoices.filter(i => i.status === 'pending').length },
              { value: 'pending_cash', label: 'Chờ xác nhận', count: invoices.filter(i => i.status === 'pending_cash').length },
              { value: 'paid',         label: 'Đã thanh toán', count: invoices.filter(i => i.status === 'paid').length },
              { value: 'overdue',      label: 'Quá hạn', count: invoices.filter(i => i.status === 'overdue').length },
            ]}
          />
        </div>
        <div className="p-4 border-b border-line bg-gray-50 flex flex-wrap gap-3 items-center">
          <select className="input max-w-xs">
            <option>Kỳ: Tháng 05/2026</option>
            <option>Tháng 04/2026</option>
            <option>Tháng 03/2026</option>
          </select>
          <select className="input max-w-xs">
            <option>Cơ sở: Tất cả</option>
          </select>
          <Button variant="ghost" icon={<Filter size={16} />}>Lọc thêm</Button>
        </div>
      </Card>

      <Table
        columns={[
          { key: 'code',   header: 'Mã hoá đơn', render: (i) => <span className="font-semibold text-primary">{i.code}</span> },
          { key: 'tenant', header: 'Khách thuê', render: (i) => i.tenantId || '—' },
          { key: 'room',   header: 'Phòng',      render: (i) => i.roomId },
          { key: 'period', header: 'Kỳ',         render: (i) => formatPeriod(i.period) },
          { key: 'total',  header: 'Tổng tiền', className: 'text-right font-semibold', render: (i) => formatCurrency(i.total) },
          { key: 'due',    header: 'Hạn TT',     render: (i) => formatDate(i.dueDate) },
          { key: 'status', header: 'Trạng thái',
            render: (i) => <Badge color={INVOICE_STATUS_META[i.status]?.color}>{i.statusMeta?.label}</Badge> },
        ]}
        data={filtered}
      />
    </>
  );
}
