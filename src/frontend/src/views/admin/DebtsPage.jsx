import { Send, AlertTriangle } from 'lucide-react';
import { Button, PageHeader, Card, Table, Badge, StatCard } from '../../components/common';
import { useInvoices } from '../../controllers/useInvoices.js';
import { formatCurrency } from '../../utils/format.js';

export default function DebtsPage() {
  const { data: invoices = [] } = useInvoices({ status: 'overdue' });

  const grouped = invoices.reduce((acc, inv) => {
    const k = inv.tenantId || 'unknown';
    if (!acc[k]) acc[k] = { tenantId: k, months: 0, total: 0, oldestDays: 0 };
    acc[k].months += 1;
    acc[k].total += inv.total;
    acc[k].oldestDays = Math.max(acc[k].oldestDays, inv.daysOverdue);
    return acc;
  }, {});
  const rows = Object.values(grouped);

  const totalDebt = rows.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <PageHeader
        title="Công nợ"
        subtitle="Tổng hợp công nợ theo khách thuê — gửi nhắc nợ hàng loạt"
        actions={<Button icon={<Send size={16} />}>Gửi nhắc nợ hàng loạt</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <StatCard label="Tổng công nợ" value={formatCurrency(totalDebt, { compact: true })} icon={AlertTriangle} accent="danger" />
        <StatCard label="Số khách nợ" value={rows.length} accent="warning" />
        <StatCard label="Nợ lâu nhất" value={`${Math.max(0, ...rows.map(r => r.oldestDays))} ngày`} accent="danger" />
      </div>

      <Table
        columns={[
          { key: 'tenant', header: 'Khách thuê', render: (r) => <span className="font-medium text-ink">{r.tenantId}</span> },
          { key: 'months', header: 'Số tháng nợ', render: (r) => `${r.months} tháng` },
          { key: 'total', header: 'Tổng nợ', className: 'text-right font-semibold text-danger', render: (r) => formatCurrency(r.total) },
          { key: 'oldest', header: 'Quá hạn lâu nhất', render: (r) => <Badge color="danger">{r.oldestDays} ngày</Badge> },
          { key: 'action', header: '', render: () => <Button size="sm" variant="secondary">Gửi nhắc nợ</Button> },
        ]}
        data={rows}
        emptyText="Không có công nợ"
      />
    </>
  );
}
