import { Check, X, Upload } from 'lucide-react';
import { Button, PageHeader, Card, Badge } from '../../components/common';
import { useInvoices } from '../../controllers/useInvoices.js';
import { formatCurrency, formatPeriod } from '../../utils/format.js';

export default function CashReceiptsPage() {
  const { data: invoices = [] } = useInvoices({ status: 'pending_cash' });

  return (
    <>
      <PageHeader
        title="Xác nhận thu tiền mặt"
        subtitle="Các khoản tiền mặt đang chờ Quản lý xác nhận đã thu"
      />

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <Card><p className="text-center text-ink-muted py-8">Hiện chưa có hoá đơn nào chờ xác nhận tiền mặt</p></Card>
        ) : (
          invoices.map((inv) => (
            <Card key={inv.id}>
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-50 text-warning flex items-center justify-center font-bold">{inv.code.slice(-3)}</div>
                  <div>
                    <div className="font-semibold text-ink">{inv.code}</div>
                    <div className="text-sm text-ink-muted">Khách: {inv.tenantId} · Phòng {inv.roomId} · {formatPeriod(inv.period)}</div>
                    <Badge color="warning" className="mt-1">Chờ xác nhận tiền mặt</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink">{formatCurrency(inv.total)}</div>
                  <div className="text-xs text-ink-muted">Phương thức: {inv.paymentMethod}</div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="secondary" icon={<X size={16} />}>Từ chối</Button>
                  <Button icon={<Check size={16} />}>Xác nhận đã thu</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-gutter bg-blue-50/50 border-blue-200">
        <h3 className="text-title-lg text-ink mb-2">Quy trình xác nhận</h3>
        <p className="text-sm text-ink-muted">
          Khi xác nhận, hãy chọn ngày thực thu, nhập số tiền thực nhận và tải lên ảnh biên lai (nếu có).
          Trạng thái hoá đơn sẽ tự động chuyển sang <strong>Đã thanh toán</strong>.
        </p>
        <div className="mt-3 border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-sm text-ink-muted">
          <Upload className="inline mr-2" size={16} /> Upload ảnh biên lai khi xác nhận
        </div>
      </Card>
    </>
  );
}
