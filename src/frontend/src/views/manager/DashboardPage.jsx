import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoorOpen, Receipt, Banknote, CheckCircle2, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import { PageHeader, Toast } from '../../components/common';
import { useRooms } from '../../controllers/useRooms.js';
import { useInvoices } from '../../controllers/useInvoices.js';
import { propertyService } from '../../services/propertyService.js';

const INITIAL_TASKS = [
  { id: 1, text: 'Ghi chỉ số điện nước phòng 101 — 305', done: false, path: '/manager/billing' },
  { id: 2, text: 'Xác nhận thu tiền mặt HĐ-202605-002', done: false, path: '/manager/cash-receipts' },
  { id: 3, text: 'Gia hạn hợp đồng HD2025-002 (sắp hết hạn)', done: false, path: '/manager/contracts' },
  { id: 4, text: 'Trả lời 2 yêu cầu liên hệ từ khách vãng lai', done: true, path: '/manager/notifications' },
];

export default function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [propertyId, setPropertyId] = useState(localStorage.getItem('bhpro_selected_property_id') || '');
  const [propertyName, setPropertyName] = useState('Đang tải cơ sở...');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handlePropertyChange = () => {
      const activeId = localStorage.getItem('bhpro_selected_property_id') || '';
      setPropertyId(activeId);
    };
    window.addEventListener('bhpro_property_changed', handlePropertyChange);
    return () => {
      window.removeEventListener('bhpro_property_changed', handlePropertyChange);
    };
  }, []);

  useEffect(() => {
    if (propertyId) {
      propertyService.list().then(res => {
        const found = res.find(p => p.id === propertyId);
        if (found) {
          setPropertyName(found.name);
        } else {
          setPropertyName('Cơ sở không xác định');
        }
      }).catch(err => {
        console.error("Error loading property name in dashboard:", err);
        setPropertyName('Cơ sở');
      });
    } else {
      setPropertyName('Chưa chọn cơ sở');
    }
  }, [propertyId]);

  const { data: rooms = [] } = useRooms({ propertyId });
  const { data: invoices = [] } = useInvoices({ propertyId });

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
      <PageHeader title="Dashboard Quản lý" subtitle={propertyName} />

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Phòng trống */}
        <div 
          onClick={() => navigate('/manager/rooms')}
          className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Phòng đang trống</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <DoorOpen size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">{vacant}</h2>
              <span className="text-xs font-semibold text-zinc-400">phòng trống sẵn sàng</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-500">
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              Khả dụng
            </span>
            <span className="text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Xem sơ đồ <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Hóa đơn cần phát hành */}
        <div 
          onClick={() => navigate('/manager/billing')}
          className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Hoá đơn cần phát hành</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <Receipt size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">{pending}</h2>
              <span className="text-xs font-semibold text-zinc-400">hoá đơn chưa chốt chỉ số</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-500">
            <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              Chốt chỉ số
            </span>
            <span className="text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Chốt ngay <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        {/* Tiền mặt đối soát */}
        <div 
          onClick={() => navigate('/manager/cash-receipts')}
          className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 group"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tiền mặt cần đối soát</span>
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl transition-colors group-hover:bg-red-600 group-hover:text-white">
                <Banknote size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">{cash}</h2>
              <span className="text-xs font-semibold text-zinc-400">yêu cầu cần xác nhận</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-100 text-xs font-semibold text-zinc-500">
            <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold">
              Đối soát
            </span>
            <span className="text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Kiểm tra <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

      </div>

      {/* Calendar & Tasks section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month Calendar Card */}
        <div className="lg:col-span-2 bg-white border border-zinc-200/50 rounded-3xl p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-950">Lịch vận hành tháng 05/2026</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Mốc thời gian và sự kiện vận hành quan trọng</p>
            </div>
            <div className="p-2 bg-zinc-50 border border-zinc-200/50 text-zinc-500 rounded-xl">
              <Calendar size={16} />
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center text-xs select-none">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
              <div key={d} className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider py-2">{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const isToday = d === 22;
              const isMeter = d === 1;
              const isInvoice = d === 31;
              return (
                <div
                  key={d}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer text-xs font-bold ${
                    isToday 
                      ? 'bg-primary text-white font-extrabold shadow-md shadow-primary/20 scale-[1.05]' 
                      : 'hover:bg-zinc-50 text-zinc-800 border border-transparent hover:border-zinc-100'
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
                  <div className="flex gap-0.5 justify-center mt-1">
                    {isMeter && <span className="h-1 w-1 rounded-full bg-amber-500" />}
                    {isInvoice && <span className="h-1 w-1 rounded-full bg-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-6 pt-4 border-t border-zinc-100">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Ngày chốt chỉ số</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />Phát hành hoá đơn</span>
          </div>
        </div>

        {/* Today's Tasks Card */}
        <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-zinc-950">Tác vụ hôm nay</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Công việc cần giải quyết ngày 22/05/2026</p>
            </div>
            
            <ul className="space-y-2.5">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  onClick={() => handleTaskClick(t)}
                  className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-zinc-50 border border-transparent hover:border-zinc-100/60 transition-all duration-300 cursor-pointer group select-none"
                >
                  <button
                    onClick={(e) => toggleTask(t.id, e)}
                    className="mt-0.5 shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200"
                  >
                    {t.done ? (
                      <CheckCircle2 size={16} className="text-emerald-500 animate-apple-pop" />
                    ) : (
                      <Clock size={16} className="text-amber-500 group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  <span className={`text-xs transition-all duration-300 ${
                    t.done ? 'line-through text-zinc-400 font-semibold' : 'text-zinc-800 font-bold'
                  }`}>
                    {t.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-widest pt-4 border-t border-zinc-100/60 mt-6">
            Đã hoàn thành {tasks.filter(t => t.done).length}/{tasks.length} tác vụ
          </div>
        </div>

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
