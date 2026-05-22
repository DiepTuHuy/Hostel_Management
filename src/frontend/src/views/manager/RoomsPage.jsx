import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Plus,
  RotateCcw,
  Edit,
  FileText,
  User,
  Phone,
  Calendar,
  Building,
  Info,
  Layers,
  Settings,
  X,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { useRooms } from '../../controllers/useRooms.js';

const initialRoomsData = [
  { id: '101', code: 'P.101', floor: 1, area: 25, price: 3200000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '' },
  { id: '102', code: 'P.102', floor: 1, area: 25, price: 3200000, status: 'occupied', tenantName: 'Nguyễn Văn Hải', tenantPhone: '0987654321', checkInDate: '2026-01-10' },
  { id: '103', code: 'P.103', floor: 1, area: 30, price: 4000000, status: 'deposit', tenantName: 'Trần Thị Thu Trang', tenantPhone: '0912345678', checkInDate: '2026-02-15' },
  { id: '104', code: 'P.104', floor: 1, area: 25, price: 3200000, status: 'paused', tenantName: '', tenantPhone: '', checkInDate: '' },
  { id: '201', code: 'P.201', floor: 2, area: 25, price: 3500000, status: 'occupied', tenantName: 'Lê Minh Quốc', tenantPhone: '0934567890', checkInDate: '2026-03-01' },
  { id: '202', code: 'P.202', floor: 2, area: 25, price: 3500000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '' },
  { id: '203', code: 'P.203', floor: 2, area: 30, price: 4200000, status: 'occupied', tenantName: 'Phạm Hồng Thái', tenantPhone: '0945678901', checkInDate: '2026-03-20' },
  { id: '204', code: 'P.204', floor: 2, area: 25, price: 3500000, status: 'deposit', tenantName: 'Đặng Thùy Chi', tenantPhone: '0956789012', checkInDate: '2026-04-05' },
  { id: '301', code: 'P.301', floor: 3, area: 28, price: 3800000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '' },
  { id: '302', code: 'P.302', floor: 3, area: 28, price: 3800000, status: 'occupied', tenantName: 'Vũ Hữu Phước', tenantPhone: '0967890123', checkInDate: '2026-04-12' },
  { id: '303', code: 'P.303', floor: 3, area: 32, price: 4500000, status: 'paused', tenantName: '', tenantPhone: '', checkInDate: '' },
  { id: '304', code: 'P.304', floor: 3, area: 28, price: 3800000, status: 'occupied', tenantName: 'Hoàng Mỹ Linh', tenantPhone: '0978901234', checkInDate: '2026-04-18' },
];

export default function RoomsPage() {
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

  const { data: apiRooms = [], loading } = useRooms({ propertyId });
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [invoiceRoomId, setInvoiceRoomId] = useState(null);

  useEffect(() => {
    if (!loading) {
      setRooms(apiRooms || []);
    }
  }, [apiRooms, loading]);

  const [electricityOld, setElectricityOld] = useState(1200);
  const [electricityNew, setElectricityNew] = useState(1350);
  const [waterOld, setWaterOld] = useState(45);
  const [waterNew, setWaterNew] = useState(52);
  const [electricityPrice] = useState(3500);
  const [waterPrice] = useState(15000);
  const [serviceFee] = useState(150000);
  const [toastMessage, setToastMessage] = useState('');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleClickRoom = (room) => {
    setSelectedRoomId(room.id);
    setEditForm({ ...room });
    setIsEditing(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setRooms(rooms.map((r) => (r.id === editForm.id ? editForm : r)));
    setSelectedRoomId(editForm.id);
    setIsEditing(false);
    showToast(`Đã cập nhật thông tin phòng ${editForm.code}`);
  };

  const handleOpenInvoice = (room) => {
    setInvoiceRoomId(room.id);
    setElectricityOld(1200 + Math.floor(Math.random() * 50));
    setElectricityNew(1350 + Math.floor(Math.random() * 50));
    setWaterOld(45 + Math.floor(Math.random() * 10));
    setWaterNew(52 + Math.floor(Math.random() * 10));
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const invoiceRoomObj = rooms.find((r) => r.id === invoiceRoomId);
    const elecUsage = electricityNew - electricityOld;
    const waterUsage = waterNew - waterOld;
    const totalAmount = invoiceRoomObj.price + elecUsage * electricityPrice + waterUsage * waterPrice + serviceFee;

    setInvoiceRoomId(null);
    showToast(`Đã lập hoá đơn thành công cho phòng ${invoiceRoomObj.code} với tổng tiền: ${formatCurrency(totalAmount)}`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter;
    return matchesStatus && matchesFloor;
  });

  const vacantCount = rooms.filter((r) => r.status === 'vacant').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const depositCount = rooms.filter((r) => r.status === 'deposit').length;
  const pausedCount = rooms.filter((r) => r.status === 'paused').length;

  // Group rooms by floor (sorted from highest floor to lowest floor)
  const roomsByFloor = {};
  filteredRooms.forEach(room => {
    if (!roomsByFloor[room.floor]) {
      roomsByFloor[room.floor] = [];
    }
    roomsByFloor[room.floor].push(room);
  });
  
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-100px)] min-h-[600px] text-ink p-2">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary border border-primary/20 text-white font-semibold py-3 px-6 rounded-xl shadow-modal flex items-center gap-3 animate-bounce">
          <Info size={20} />
          <span>{toastMessage}</span>
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={cn(
            "bg-white border border-line p-3 rounded-xl flex items-center gap-3 shadow-card cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200 apple-press",
            statusFilter === 'all' ? 'ring-2 ring-primary bg-primary-soft/30 scale-[1.03] border-primary/20' : ''
          )}
        >
          <div className="p-2 bg-primary-soft rounded-lg text-primary">
            <Building size={20} />
          </div>
          <div>
            <div className="text-[10px] text-ink-muted font-semibold uppercase">Tổng phòng</div>
            <div className="text-lg font-bold text-ink">{rooms.length} phòng</div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('vacant')}
          className={cn(
            "bg-white border border-line p-3 rounded-xl flex items-center gap-3 shadow-card cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200 apple-press",
            statusFilter === 'vacant' ? 'ring-2 ring-success bg-green-50/30 scale-[1.03] border-success/20' : ''
          )}
        >
          <div className="p-2 bg-green-50 text-success rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-[10px] text-success font-semibold uppercase">Còn trống</div>
            <div className="text-lg font-bold text-success">{vacantCount} phòng</div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('occupied')}
          className={cn(
            "bg-white border border-line p-3 rounded-xl flex items-center gap-3 shadow-card cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200 apple-press",
            statusFilter === 'occupied' ? 'ring-2 ring-primary bg-primary-soft/30 scale-[1.03] border-primary/20' : ''
          )}
        >
          <div className="p-2 bg-primary-soft text-primary rounded-lg">
            <User size={20} />
          </div>
          <div>
            <div className="text-[10px] text-primary font-semibold uppercase">Đang thuê</div>
            <div className="text-lg font-bold text-primary">{occupiedCount} phòng</div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('deposit')}
          className={cn(
            "bg-white border border-line p-3 rounded-xl flex items-center gap-3 shadow-card cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200 apple-press",
            statusFilter === 'deposit' ? 'ring-2 ring-warning bg-amber-50/30 scale-[1.03] border-warning/20' : ''
          )}
        >
          <div className="p-2 bg-amber-50 text-warning rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[10px] text-warning font-semibold uppercase">Đặt cọc</div>
            <div className="text-lg font-bold text-warning">{depositCount} phòng</div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('paused')}
          className={cn(
            "bg-white border border-line p-3 rounded-xl flex items-center gap-3 shadow-card cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all duration-200 apple-press",
            statusFilter === 'paused' ? 'ring-2 ring-gray-400 bg-gray-50 scale-[1.03] border-gray-300' : ''
          )}
        >
          <div className="p-2 bg-gray-100 text-ink-muted rounded-lg">
            <Settings size={20} />
          </div>
          <div>
            <div className="text-[10px] text-ink-muted font-semibold uppercase">Bảo trì</div>
            <div className="text-lg font-bold text-ink">{pausedCount} phòng</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-line p-6 flex flex-col gap-6 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-250 scrollbar-track-transparent shadow-card">
          {/* Header filters */}
          <div className="flex justify-between items-center border-b border-line pb-4">
            <h3 className="text-sm font-bold text-ink uppercase tracking-wider">Sơ Đồ Phòng Theo Tầng</h3>
            <div className="flex gap-2">
              {selectedRoomId && (
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm apple-press animate-apple-pop"
                >
                  <ArrowLeft size={14} />
                  <span>Quay Lại Sơ Đồ</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedRoomId(null);
                  setIsEditing(false);
                  setStatusFilter('all');
                  setFloorFilter('all');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-gray-50 text-ink rounded-lg border border-line transition-colors apple-press"
              >
                <RotateCcw size={14} />
                <span>Đặt Lại</span>
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white text-ink border border-line text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="all">Trạng thái (Tất cả)</option>
                <option value="vacant">Trống</option>
                <option value="occupied">Đang thuê</option>
                <option value="deposit">Đặt cọc</option>
                <option value="paused">Bảo trì</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-white text-ink border border-line text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="all">Tầng (Tất cả)</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
              </select>
            </div>
          </div>

          {/* Floor lists */}
          <div className="flex-1 flex flex-col gap-6">
            {sortedFloors.length > 0 ? (
              sortedFloors.map((floorNum) => (
                <div key={floorNum} className="flex flex-col gap-3 bg-gray-50/50 border border-line/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 border-b border-line/50 pb-2">
                    <Layers size={15} className="text-primary" />
                    <span className="text-xs font-bold text-ink">Tầng {floorNum}</span>
                    <span className="text-[10px] text-ink-muted font-medium">({roomsByFloor[floorNum].length} phòng)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {roomsByFloor[floorNum].map((room) => {
                      let statusBg = 'bg-gray-150 border-gray-250 text-gray-700 hover:border-gray-400';
                      let statusColorDot = 'bg-gray-400';
                      let statusText = 'Bảo trì';

                      if (room.status === 'vacant') {
                        statusBg = 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:border-emerald-400/50';
                        statusColorDot = 'bg-success';
                        statusText = 'Còn trống';
                      } else if (room.status === 'occupied') {
                        statusBg = 'bg-primary-soft border-primary/20 text-primary hover:border-primary/50';
                        statusColorDot = 'bg-primary';
                        statusText = 'Đang thuê';
                      } else if (room.status === 'deposit') {
                        statusBg = 'bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-400/50';
                        statusColorDot = 'bg-warning';
                        statusText = 'Đặt cọc';
                      } else if (room.status === 'paused') {
                        statusBg = 'bg-gray-50 border-line text-ink-muted hover:border-gray-400';
                        statusColorDot = 'bg-gray-400';
                        statusText = 'Bảo trì';
                      }

                      const isSelected = selectedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          onClick={() => handleClickRoom(room)}
                          className={cn(
                            "group border p-3.5 rounded-xl cursor-pointer flex flex-col gap-2.5 transition-apple-bouncy duration-300 apple-press bg-white shadow-sm",
                            statusBg,
                            isSelected 
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-white scale-[1.03] shadow-md shadow-primary/10" 
                              : "hover:scale-[1.02] hover:shadow-md"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-sm text-ink group-hover:text-primary transition-colors">
                              {room.code}
                            </span>
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-line">
                              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusColorDot)} />
                              <span>{statusText}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-end border-t border-line/40 pt-2 text-[10px] text-ink-muted">
                            <span className="font-medium">{room.area} m²</span>
                            <span className="font-bold text-ink">{formatCurrency(room.price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-ink-muted">
                <div className="p-3 bg-gray-50 border border-line rounded-full">
                  <Info size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Không tìm thấy phòng nào</h4>
                  <p className="text-xs text-ink-muted mt-1 max-w-[250px]">Vui lòng điều chỉnh lại bộ lọc trạng thái hoặc tầng.</p>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-[10px] bg-gray-50 px-3 py-2.5 border border-line rounded-xl mt-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-success" />
              <span className="text-ink-muted">Còn trống</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-primary" />
              <span className="text-ink-muted">Đang thuê</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-warning" />
              <span className="text-ink-muted">Đặt cọc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gray-400" />
              <span className="text-ink-muted">Bảo trì</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-4 flex-1 shadow-card">
            {selectedRoom ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-start border-b border-line pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-primary-soft text-primary border border-primary/20 rounded">
                      Phòng {selectedRoom.code}
                    </span>
                    <h2 className="text-base font-bold mt-1 text-ink">Chi Tiết Phòng</h2>
                  </div>
                  <button
                    onClick={() => setSelectedRoomId(null)}
                    className="p-1 text-ink-muted hover:text-ink transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-3.5 text-xs flex-1">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-line">
                    <span className="text-ink-muted">Trạng thái</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedRoom.status === 'vacant'
                        ? 'bg-green-50 text-success border border-green-200'
                        : selectedRoom.status === 'occupied'
                        ? 'bg-primary-soft text-primary border border-primary/20'
                        : selectedRoom.status === 'deposit'
                        ? 'bg-amber-50 text-warning border border-amber-200'
                        : 'bg-gray-100 text-ink-muted border border-line'
                    }`}>
                      {selectedRoom.status === 'vacant'
                        ? 'Còn Trống'
                        : selectedRoom.status === 'occupied'
                        ? 'Đang Thuê'
                        : selectedRoom.status === 'deposit'
                        ? 'Đặt cọc'
                        : 'Bảo Trì'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded border border-line/60">
                      <span className="text-ink-muted block text-[10px] uppercase">Diện tích</span>
                      <span className="font-bold text-ink mt-0.5 block">{selectedRoom.area} m²</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded border border-line/60">
                      <span className="text-ink-muted block text-[10px] uppercase">Giá thuê</span>
                      <span className="font-bold text-ink mt-0.5 block">{formatCurrency(selectedRoom.price)}</span>
                    </div>
                  </div>

                  {selectedRoom.status === 'occupied' || selectedRoom.status === 'deposit' ? (
                    <div className="bg-primary-soft/50 border border-primary/10 p-3 rounded-lg flex flex-col gap-2">
                      <h3 className="font-semibold text-primary flex items-center gap-1.5 border-b border-primary/10 pb-1.5">
                        <User size={14} />
                        <span>Thông Tin Khách Thuê</span>
                      </h3>
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-ink-muted">Khách thuê</span>
                          <span className="font-bold text-ink">{selectedRoom.tenantName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-muted">Điện thoại</span>
                          <span className="font-bold text-ink">{selectedRoom.tenantPhone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink-muted">Ngày dời vào</span>
                          <span className="font-bold text-ink">{selectedRoom.checkInDate || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-line p-3 rounded-lg flex items-center gap-2 text-ink-muted">
                      <Info size={14} className="text-primary shrink-0" />
                      <span>Không có khách thuê hiện tại</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-line">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-ink rounded-lg border border-line transition-colors"
                  >
                    <Edit size={14} />
                    <span>Sửa</span>
                  </button>
                  {selectedRoom.status === 'occupied' && (
                    <button
                      onClick={() => handleOpenInvoice(selectedRoom)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors shadow-sm"
                    >
                      <FileText size={14} />
                      <span>Lập Hoá Đơn</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 h-full py-12">
                <div className="p-4 bg-gray-50 rounded-full text-ink-muted border border-line">
                  <Layers size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Chưa Chọn Phòng</h3>
                  <p className="text-xs text-ink-muted max-w-[200px] mt-1 mx-auto">
                    Nhấp vào một ô phòng trong sơ đồ để xem thông tin chi tiết
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-line rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-modal animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <Edit className="text-primary" size={18} />
                <span>Chỉnh Sửa Phòng {editForm.code}</span>
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-ink-muted hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-ink-muted font-semibold">Mã phòng</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-ink-muted font-semibold">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="vacant">Còn Trống</option>
                    <option value="occupied">Đang Thuê</option>
                    <option value="deposit">Đặt cọc</option>
                    <option value="paused">Bảo Trì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-ink-muted font-semibold">Diện tích (m²)</label>
                  <input
                    type="number"
                    required
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) || 0 })}
                    className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-ink-muted font-semibold">Giá thuê (VND/tháng)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {(editForm.status === 'occupied' || editForm.status === 'deposit') && (
                <div className="flex flex-col gap-3 border-t border-line pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-ink-muted font-semibold">Tên khách thuê</label>
                    <input
                      type="text"
                      required
                      value={editForm.tenantName || ''}
                      onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })}
                      className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-ink-muted font-semibold">Điện thoại</label>
                      <input
                        type="text"
                        required
                        value={editForm.tenantPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, tenantPhone: e.target.value })}
                        className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-ink-muted font-semibold">Ngày dời vào</label>
                      <input
                        type="date"
                        required
                        value={editForm.checkInDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                        className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-ink border border-line font-semibold rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {invoiceRoomId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-line rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-modal animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink flex items-center gap-2">
                <FileText className="text-primary" size={18} />
                <span>Lập Hoá Đơn Phòng {rooms.find((r) => r.id === invoiceRoomId)?.code}</span>
              </h2>
              <button
                onClick={() => setInvoiceRoomId(null)}
                className="text-ink-muted hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-line">
                <div className="flex justify-between">
                  <span className="text-ink-muted font-medium">Tiền phòng cơ bản:</span>
                  <span className="font-bold text-ink">
                    {formatCurrency(rooms.find((r) => r.id === invoiceRoomId)?.price || 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-ink mb-1">Chỉ số Điện</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-ink-muted text-[10px] uppercase font-semibold">Cũ</label>
                    <input
                      type="number"
                      required
                      value={electricityOld}
                      onChange={(e) => setElectricityOld(parseInt(e.target.value) || 0)}
                      className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-ink-muted text-[10px] uppercase font-semibold">Mới</label>
                    <input
                      type="number"
                      required
                      value={electricityNew}
                      onChange={(e) => setElectricityNew(parseInt(e.target.value) || 0)}
                      className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-bold text-ink mb-1">Chỉ số Nước</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-ink-muted text-[10px] uppercase font-semibold">Cũ</label>
                    <input
                      type="number"
                      required
                      value={waterOld}
                      onChange={(e) => setWaterOld(parseInt(e.target.value) || 0)}
                      className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-ink-muted text-[10px] uppercase font-semibold">Mới</label>
                    <input
                      type="number"
                      required
                      value={waterNew}
                      onChange={(e) => setWaterNew(parseInt(e.target.value) || 0)}
                      className="bg-white text-ink border border-line px-3 py-2 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-line pt-3 text-[11px] text-ink-muted">
                <div className="flex justify-between">
                  <span>Tiêu thụ điện:</span>
                  <span className="font-semibold text-ink">{electricityNew - electricityOld} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiêu thụ nước:</span>
                  <span className="font-semibold text-ink">{waterNew - waterOld} m³</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setInvoiceRoomId(null)}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-ink border border-line font-semibold rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Lập hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
