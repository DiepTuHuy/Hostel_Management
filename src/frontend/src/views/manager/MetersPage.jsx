import { useState } from 'react';
import { Save, AlertTriangle, Send, Zap, Droplet } from 'lucide-react';
import { Button, PageHeader, Card, Badge } from '../../components/common';
import { useRooms } from '../../controllers/useRooms.js';
import { formatCurrency } from '../../utils/format.js';

const ELECTRIC_PRICE = 3000;
const WATER_PRICE = 20000;

export default function MetersPage() {
  const { data: rooms = [] } = useRooms({ propertyId: 'p-001', status: 'occupied' });
  const [readings, setReadings] = useState({});

  const updateReading = (roomId, field, value) => {
    setReadings((prev) => ({
      ...prev,
      [roomId]: { ...(prev[roomId] || {}), [field]: parseInt(value || 0, 10) },
    }));
  };

  const calc = (room) => {
    const r = readings[room.id] || {};
    const prevE = 12450, prevW = 380;
    const newE = r.newE || prevE;
    const newW = r.newW || prevW;
    const elec = Math.max(0, newE - prevE);
    const water = Math.max(0, newW - prevW);
    return {
      prevE, newE, elec, elecCost: elec * ELECTRIC_PRICE,
      prevW, newW, water, waterCost: water * WATER_PRICE,
      total: elec * ELECTRIC_PRICE + water * WATER_PRICE,
      warning: elec > prevE * 0.2, 
    };
  };

  return (
    <>
      <PageHeader
        title="Ghi chỉ số điện nước"
        subtitle={`Kỳ tháng 05/2026 — ${rooms.length} phòng cần ghi`}
      />

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Khách thuê</th>
                <th><Zap className="inline" size={14} /> Điện cũ</th>
                <th><Zap className="inline" size={14} /> Điện mới</th>
                <th>Tiêu thụ điện</th>
                <th><Droplet className="inline" size={14} /> Nước cũ</th>
                <th><Droplet className="inline" size={14} /> Nước mới</th>
                <th>Tiêu thụ nước</th>
                <th className="text-right">Tổng dự kiến</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const c = calc(room);
                return (
                  <tr key={room.id} className={c.warning ? 'bg-amber-50/50' : ''}>
                    <td className="font-semibold">{room.code}</td>
                    <td className="text-xs text-ink-muted">{room.currentTenantId || '—'}</td>
                    <td className="text-ink-muted">{c.prevE}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={c.prevE}
                        onChange={(e) => updateReading(room.id, 'newE', e.target.value)}
                        className={`w-24 input ${c.warning ? 'border-amber-400 focus:border-amber-500' : ''}`}
                      />
                    </td>
                    <td>
                      <Badge color={c.warning ? 'warning' : 'neutral'}>{c.elec} kWh</Badge>
                      {c.warning && <AlertTriangle className="inline ml-1 text-warning" size={14} />}
                    </td>
                    <td className="text-ink-muted">{c.prevW}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={c.prevW}
                        onChange={(e) => updateReading(room.id, 'newW', e.target.value)}
                        className="w-20 input"
                      />
                    </td>
                    <td><Badge color="neutral">{c.water} m³</Badge></td>
                    <td className="text-right font-semibold text-primary">{formatCurrency(c.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-line p-4 flex flex-wrap gap-3 justify-end">
          <Button variant="ghost" icon={<Save size={16} />}>Lưu nháp</Button>
          <Button variant="secondary" icon={<AlertTriangle size={16} />}>Gửi cảnh báo bất thường</Button>
          <Button icon={<Send size={16} />}>Phát hành hoá đơn lô</Button>
        </div>
      </Card>
    </>
  );
}
