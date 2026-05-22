import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Send, Zap, Droplet, Check, Mail, MessageSquare } from 'lucide-react';
import { Button, PageHeader, Card, Badge, Modal, Toast } from '../../components/common';
import { useRooms } from '../../controllers/useRooms.js';
import { formatCurrency } from '../../utils/format.js';

const ELECTRIC_PRICE = 3000;
const WATER_PRICE = 20000;

export default function MetersPage() {
  const [propertyId, setPropertyId] = useState(localStorage.getItem('bhpro_selected_property_id') || '');

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

  const { data: rooms = [], loading } = useRooms({ propertyId, status: 'occupied' });
  const [readings, setReadings] = useState({});
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [channels, setChannels] = useState({ zalo: true, sms: true, app: true });

  const updateReading = (roomId, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [field]: parseInt(value || 0, 10) },
    }));
  };

  const calc = (room) => {
    const r = readings[room.id] || {};
    const prevE = 12450, prevW = 380;
    const newE = r.newE !== undefined ? r.newE : prevE;
    const newW = r.newW !== undefined ? r.newW : prevW;
    const elec = Math.max(0, newE - prevE);
    const water = Math.max(0, newW - prevW);
    const elecCost = elec * ELECTRIC_PRICE;
    const waterCost = water * WATER_PRICE;
    
    // Warning if electric consumption is unusually high (e.g., > 200 kWh)
    const warning = elec > 250; 
    
    return {
      prevE, newE, elec, elecCost,
      prevW, newW, water, waterCost,
      total: elecCost + waterCost,
      warning,
    };
  };

  // Handler for Save Draft
  const handleSaveDraft = () => {
    const enteredCount = Object.keys(readings).length;
    setToast({
      message: `Đã lưu nháp chỉ số thành công cho ${enteredCount || rooms.length} phòng! Trạng thái nháp sẽ được giữ trong phiên làm việc.`,
      type: 'success'
    });
  };

  // Scan rooms with abnormal consumption warnings
  const warningRooms = rooms.filter(room => {
    const c = calc(room);
    return c.warning;
  });

  const handleOpenAlert = () => {
    if (warningRooms.length === 0) {
      setToast({
        message: 'Hiện không phát hiện bất kỳ phòng nào có chỉ số tiêu thụ điện nước bất thường.',
        type: 'info'
      });
      return;
    }
    setIsAlertOpen(true);
  };

  const handleSendAlerts = () => {
    const activeChannels = Object.keys(channels).filter(k => channels[k]).map(k => k.toUpperCase()).join(', ');
    setToast({
      message: `Đã gửi cảnh báo tiêu dùng bất thường thành công tới ${warningRooms.length} phòng qua kênh: ${activeChannels}!`,
      type: 'success'
    });
    setIsAlertOpen(false);
  };

  // Total invoice summary calculation
  const totalInvoiceSum = rooms.reduce((sum, room) => sum + calc(room).total, 0);

  const handleIssueInvoices = () => {
    setIsIssuing(true);
    setTimeout(() => {
      setIsIssuing(false);
      setIsInvoiceOpen(false);
      setToast({
        message: `Đã phát hành hoá đơn tiền điện nước Tháng 05/2026 thành công cho ${rooms.length} phòng! Tổng tiền hoá đơn: ${formatCurrency(totalInvoiceSum)}.`,
        type: 'success'
      });
    }, 1200);
  };

  return (
    <>
      <PageHeader
        title="Ghi chỉ số điện nước"
        subtitle={`Kỳ tháng 05/2026 — ${rooms.length} phòng cần ghi`}
      />

      <Card padded={false} className="overflow-hidden mb-gutter">
        {loading && rooms.length === 0 ? (
          <div className="p-8 text-center text-ink-muted">Đang tải danh sách phòng...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Khách thuê</th>
                  <th><Zap className="inline mr-1" size={14} /> Điện cũ</th>
                  <th><Zap className="inline mr-1" size={14} /> Điện mới</th>
                  <th>Tiêu thụ điện</th>
                  <th><Droplet className="inline mr-1" size={14} /> Nước cũ</th>
                  <th><Droplet className="inline mr-1" size={14} /> Nước mới</th>
                  <th>Tiêu thụ nước</th>
                  <th className="text-right">Tổng dự kiến</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const c = calc(room);
                  return (
                    <tr key={room.id} className={c.warning ? 'bg-amber-50/40' : ''}>
                      <td className="font-semibold text-ink">{room.code}</td>
                      <td className="text-xs text-ink-muted">{room.currentTenantId || 'Hoàng Thuỳ Linh (Giả lập)'}</td>
                      <td className="text-ink-muted font-medium">{c.prevE}</td>
                      <td>
                        <input
                          type="number"
                          defaultValue={c.newE}
                          onChange={(e) => updateReading(room.id, 'newE', e.target.value)}
                          className={`w-28 input ${c.warning ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-250/20' : ''}`}
                        />
                      </td>
                      <td>
                        <Badge color={c.warning ? 'warning' : 'neutral'}>{c.elec} kWh</Badge>
                      </td>
                      <td className="text-ink-muted font-medium">{c.prevW}</td>
                      <td>
                        <input
                          type="number"
                          defaultValue={c.newW}
                          onChange={(e) => updateReading(room.id, 'newW', e.target.value)}
                          className="w-24 input"
                        />
                      </td>
                      <td><Badge color="neutral">{c.water} m³</Badge></td>
                      <td className="text-right font-bold text-primary">{formatCurrency(c.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t border-line p-4 flex flex-wrap gap-3 justify-end shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.03)] z-10">
          <Button variant="ghost" icon={<Save size={16} />} className="apple-press" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button variant="secondary" icon={<AlertTriangle size={16} />} className="apple-press" onClick={handleOpenAlert}>
            Gửi cảnh báo bất thường
          </Button>
          <Button icon={<Send size={16} />} className="apple-press" onClick={() => setIsInvoiceOpen(true)}>
            Phát hành hoá đơn lô
          </Button>
        </div>
      </Card>

      {/* Warning Abnormal Rooms Modal */}
      <Modal
        open={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Gửi Cảnh báo Tiêu thụ Bất thường"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAlertOpen(false)} className="apple-press">Đóng</Button>
            <Button onClick={handleSendAlerts} className="apple-press">Gửi cảnh báo ngay</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-sm flex gap-2">
            <AlertTriangle className="shrink-0 text-warning mt-0.5" size={18} />
            <div>
              Hệ thống phát hiện thấy có <strong className="font-semibold">{warningRooms.length} phòng</strong> đang sử dụng sản lượng điện tăng đột biến so với tháng trước (vượt 250 kWh).
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">Danh sách phòng cảnh báo:</label>
            <div className="divide-y divide-line max-h-40 overflow-y-auto border border-line rounded-xl bg-gray-50/50">
              {warningRooms.map((r) => {
                const c = calc(r);
                return (
                  <div key={r.id} className="p-3 text-sm flex justify-between items-center">
                    <span className="font-semibold text-ink">{r.code}</span>
                    <span className="text-xs text-ink-muted">Điện: <strong className="text-warning font-semibold">{c.elec} kWh</strong> (Tăng đột biến)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="label">Kênh gửi thông báo:</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'zalo', label: 'Zalo OA', desc: 'Nhắn qua Zalo' },
                { key: 'sms', label: 'SMS Brand', desc: 'Tin nhắn di động' },
                { key: 'app', label: 'In-app Notification', desc: 'Thông báo app' },
              ].map((c) => (
                <div
                  key={c.key}
                  onClick={() => setChannels(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                  className={`border p-3 rounded-xl cursor-pointer text-center transition-all duration-200 ${
                    channels[c.key] 
                      ? 'border-primary bg-primary-soft/30 font-semibold ring-2 ring-primary/10'
                      : 'border-line/60 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm text-ink">{c.label}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Issuing Bulk Invoices Confirmation Modal */}
      <Modal
        open={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        title="Xác nhận phát hành hoá đơn lô"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsInvoiceOpen(false)} className="apple-press" disabled={isIssuing}>Bỏ qua</Button>
            <Button onClick={handleIssueInvoices} className="apple-press" loading={isIssuing}>Phát hành ngay</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Kỳ hoá đơn:</span>
              <span className="font-semibold text-ink">Tháng 05/2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Số lượng phòng phát hành:</span>
              <span className="font-semibold text-ink">{rooms.length} phòng occupied</span>
            </div>
            <div className="flex justify-between border-t border-line pt-2.5 mt-2.5">
              <span className="text-ink font-semibold">Ước tính tổng tiền:</span>
              <span className="font-bold text-primary text-base">{formatCurrency(totalInvoiceSum)}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/40 border border-blue-100 text-blue-800 rounded-xl text-xs leading-relaxed flex gap-2">
            <Check className="shrink-0 text-info mt-0.5" size={16} />
            <div>
              Khi xác nhận phát hành, hệ thống sẽ tạo hoá đơn nháp dịch vụ, lập bảng kê chi tiết điện nước và tự động thông báo cho khách thuê đóng phí qua các kênh Zalo/SMS/Email cùng đường dẫn thanh toán.
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Alert */}
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
