import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorOpen, Receipt, Banknote, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, StatCard, Card, CardHeader, Badge, Toast } from '../../components/common';
import { useRooms } from '../../controllers/useRooms.js';
import { useInvoices } from '../../controllers/useInvoices.js';

const INITIAL_TASKS = [
  { id: 1, text: 'Ghi chỉ số điện nước phòng 101 — 305', done: false, path: '/manager/billing' },
  { id: 2, text: 'Xác nhận thu tiền mặt HĐ-202605-002', done: false, path: '/manager/cash-receipts' },
  { id: 3, text: 'Gia hạn hợp đồng HD2025-002 (sắp hết hạn)', done: false, path: '/manager/contracts' },
  { id: 4, text: 'Trả lời 2 yêu cầu liên hệ từ khách vãng lai', done: true, path: '/manager/notifications' },
];

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const { data: rooms = [] } = useRooms({ propertyId: 'p-001' });
  const { data: invoices = [] } = useInvoices({ propertyId: 'p-001' });
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [toast, setToast] = useState(null);

  const vacant = rooms.filter((r) => r.status === 'vacant').length;
  const pending = invoices.filter((i) => i.status === 'pending').length;
  const cash = invoices.filter((i) => i.status === 'pending_cash').length;

  const toggleTask = (id, event) => {
    event.stopPropagation(); // Avoid triggering navigation when clicking checkbox
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextDone = !t.done;
          setToast({
            message: nextDone ? `Đã hoàn thành tác vụ: "${t.text}"!` : `Đã mở lại tác vụ: "${t.text}"`,
            type: nextDone ? 'success' : 'info'
          });
          return { ...t, done: nextDone };
        }
        return t;
      })
    );
  };

  const handleTaskClick = (task) => {
    if (task.path) {
      setToast({ message: `Đang di chuyển đến mục xử lý tác vụ...`, type: 'info', duration: 1500 });
      setTimeout(() => {
        navigate(task.path);
      }, 500);
    }
  };

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
                  className={`aspect-square flex flex-col items-center justify-center rounded-md transition-all duration-200 cursor-pointer ${
                    isToday ? 'bg-primary text-white font-bold scale-[1.05] shadow-md' : 'hover:bg-gray-150 hover:bg-primary-soft/40'
                  }`}
                  onClick={() => {
                    if (isToday) {
                      setToast({ message: 'Hôm nay ngày 22/05/2026: Vận hành bình thường.', type: 'info' });
                    } else if (isMeter) {
                      setToast({ message: 'Mốc: Ngày 1 hàng tháng chốt chỉ số điện nước.', type: 'info' });
                    } else if (isInvoice) {
                      setToast({ message: 'Mốc: Ngày cuối tháng tự động phát hành hoá đơn.', type: 'info' });
                    } else {
                      setToast({ message: `Lịch ngày ${d}/05/2026: Không có tác vụ đặc biệt.`, type: 'info' });
                    }
                  }}
                >
                  <span>{d}</span>
                  {isMeter && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-0.5"></span>}
                  {isInvoice && <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-0.5"></span>}
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
            {tasks.map((t) => (
              <li
                key={t.id}
                onClick={() => handleTaskClick(t)}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-line/40 transition-all duration-300 cursor-pointer apple-press group"
              >
                <button
                  onClick={(e) => toggleTask(t.id, e)}
                  className="mt-0.5 shrink-0 hover:scale-110 transition-transform duration-200"
                >
                  {t.done ? (
                    <CheckCircle2 size={18} className="text-success animate-apple-pop" />
                  ) : (
                    <Clock size={18} className="text-warning group-hover:text-primary transition-colors" />
                  )}
                </button>
                <span className={`text-sm transition-all duration-300 ${
                  t.done ? 'line-through text-ink-muted opacity-60' : 'text-ink font-medium'
                }`}>
                  {t.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

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
