import { DoorOpen, Receipt, Banknote, CheckCircle2, Clock } from 'lucide-react';
import { PageHeader, StatCard, Card, CardHeader, Badge } from '../../components/common';
import { useRooms } from '../../controllers/useRooms.js';
import { useInvoices } from '../../controllers/useInvoices.js';

const TODAY_TASKS = [
  { id: 1, text: 'Ghi chỉ số điện nước phòng 101 — 305', done: false },
  { id: 2, text: 'Xác nhận thu tiền mặt HĐ-202605-002', done: false },
  { id: 3, text: 'Gia hạn hợp đồng HD2025-002 (sắp hết hạn)', done: false },
  { id: 4, text: 'Trả lời 2 yêu cầu liên hệ từ khách vãng lai', done: true },
];

export default function ManagerDashboardPage() {
  const { data: rooms = [] } = useRooms({ propertyId: 'p-001' });
  const { data: invoices = [] } = useInvoices({ propertyId: 'p-001' });
  const vacant = rooms.filter((r) => r.status === 'vacant').length;
  const pending = invoices.filter((i) => i.status === 'pending').length;
  const cash = invoices.filter((i) => i.status === 'pending_cash').length;

  return (
    <>
      <PageHeader title="Dashboard Quản lý" subtitle="Nhà trọ An Phú — Quận 1" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <StatCard label="Phòng đang trống" value={vacant} icon={DoorOpen} accent="success" />
        <StatCard label="Hoá đơn cần phát hành" value={pending} icon={Receipt} accent="warning" />
        <StatCard label="Tiền mặt cần đối soát" value={cash} icon={Banknote} accent="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        <Card className="lg:col-span-2">
          <CardHeader title="Lịch tháng 05/2026" subtitle="Mốc quan trọng" />
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
              <div key={d} className="text-xs text-ink-muted font-semibold py-1">{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const isToday = d === 22;
              const isMeter = d === 1;
              const isInvoice = d === 31;
              return (
                <div
                  key={d}
                  className={`aspect-square flex flex-col items-center justify-center rounded-md ${
                    isToday ? 'bg-primary text-white font-bold' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>{d}</span>
                  {isMeter && <span className="h-1 w-1 rounded-full bg-amber-500 mt-0.5"></span>}
                  {isInvoice && <span className="h-1 w-1 rounded-full bg-red-500 mt-0.5"></span>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-xs text-ink-muted mt-3">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Ngày chốt chỉ số</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Phát hành hoá đơn</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Tác vụ hôm nay" subtitle="22/05/2026" />
          <ul className="space-y-2">
            {TODAY_TASKS.map((t) => (
              <li key={t.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50">
                {t.done ? (
                  <CheckCircle2 size={18} className="text-success mt-0.5 shrink-0" />
                ) : (
                  <Clock size={18} className="text-warning mt-0.5 shrink-0" />
                )}
                <span className={`text-sm ${t.done ? 'line-through text-ink-muted' : 'text-ink'}`}>{t.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
