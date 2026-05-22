import { Plus, Settings2 } from 'lucide-react';
import { Button, PageHeader, Card, Badge } from '../../components/common';
import services from '../../mocks/services.json';
import { formatCurrency } from '../../utils/format.js';

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        title="Cấu hình dịch vụ & đơn giá"
        subtitle="Thiết lập đơn giá điện, nước, internet và các dịch vụ kèm theo"
        actions={<Button icon={<Plus size={16} />}>Thêm dịch vụ</Button>}
      />

      <Card padded={false} className="overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Đơn vị</th>
              <th>Loại</th>
              <th>Đơn giá</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-ink">{s.name}</td>
                <td>{s.unit}</td>
                <td>
                  <Badge color={s.type === 'metered' ? 'info' : 'neutral'}>
                    {s.type === 'metered' ? 'Theo chỉ số' : 'Cố định'}
                  </Badge>
                </td>
                <td>
                  {s.tiers ? (
                    <div className="space-y-1">
                      {s.tiers.map((t, i) => (
                        <div key={i} className="text-xs">
                          {t.from}-{t.to ?? '∞'} {s.unit}: <strong>{formatCurrency(t.price)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-semibold">{formatCurrency(s.price)}/{s.unit}</span>
                  )}
                </td>
                <td>
                  <Badge color={s.active ? 'success' : 'neutral'}>{s.active ? 'Đang dùng' : 'Tạm tắt'}</Badge>
                </td>
                <td>
                  <button className="text-primary hover:underline flex items-center gap-1 text-sm">
                    <Settings2 size={14} /> Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-gutter">
        <h3 className="text-title-lg text-ink mb-3">Bậc thang điện áp dụng</h3>
        <p className="text-sm text-ink-muted">
          Đơn giá điện được tính theo bậc thang dựa trên tổng lượng tiêu thụ trong kỳ. Có hiệu lực từ 01/01/2026.
        </p>
      </Card>
    </>
  );
}
