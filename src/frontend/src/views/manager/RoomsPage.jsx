import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn.js';
import {
  Plus, RotateCcw, Edit, FileText, User, Phone, Calendar, Building2, Info, Layers, Settings, X, Activity, ArrowLeft, Trash2, ShieldCheck, Hammer
} from 'lucide-react';
import { useRooms } from '../../controllers/useRooms.js';
import { roomService, serviceService, readingService, invoiceService } from '../../services/index.js';

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
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [assetsFormList, setAssetsFormList] = useState([]);

  useEffect(() => {
    if (!loading) {
      setRooms(apiRooms || []);
    }
  }, [apiRooms, loading]);

  const [services, setServices] = useState([]);
  useEffect(() => {
    if (propertyId) {
      serviceService.list(propertyId)
        .then(data => setServices(data || []))
        .catch(err => console.error("Lỗi tải cấu hình dịch vụ:", err));
    }
  }, [propertyId]);

  const electricService = services.find(s => s.name.toLowerCase().includes('điện')) || { price: 3500, id: 'elec-default' };
  const waterService = services.find(s => s.name.toLowerCase().includes('nước')) || { price: 15000, id: 'water-default' };

  const [electricityOld, setElectricityOld] = useState(1200);
  const [electricityNew, setElectricityNew] = useState(1350);
  const [waterOld, setWaterOld] = useState(45);
  const [waterNew, setWaterNew] = useState(52);
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      let backendStatus = editForm.status;
      if (editForm.status === 'vacant') backendStatus = 'empty';
      else if (editForm.status === 'occupied') backendStatus = 'rented';
      else if (editForm.status === 'paused') backendStatus = 'maintenance';

      const updated = await roomService.update(editForm.id, {
        roomNumber: editForm.code,
        status: backendStatus,
        area: editForm.area,
        price: editForm.price,
        description: editForm.description
      });

      setRooms(rooms.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRoomId(updated.id);
      setIsEditing(false);
      showToast(`Đã cập nhật thông tin phòng ${updated.code}`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi hệ thống khi cập nhật phòng');
    }
  };

  const handleOpenAssets = (room) => {
    setAssetsFormList(room.assets || []);
    setShowAssetsModal(true);
  };

  const handleSaveAssets = async (e) => {
    e.preventDefault();
    try {
      const updated = await roomService.update(selectedRoomId, {
        assets: assetsFormList
      });
      setRooms(rooms.map(r => r.id === updated.id ? updated : r));
      setSelectedRoomId(updated.id);
      setShowAssetsModal(false);
      showToast(`Đã cập nhật danh sách tài sản phòng ${updated.code}`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi hệ thống khi cập nhật tài sản');
    }
  };

  const handleOpenInvoice = (room) => {
    setInvoiceRoomId(room.id);
    setElectricityOld(1200 + Math.floor(Math.random() * 50));
    setElectricityNew(1250 + Math.floor(Math.random() * 50));
    setWaterOld(45 + Math.floor(Math.random() * 10));
    setWaterNew(48 + Math.floor(Math.random() * 10));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const invoiceRoomObj = rooms.find((r) => r.id === invoiceRoomId);
    try {
      const readingsPayload = [
        {
          roomId: invoiceRoomId,
          serviceId: electricService.id,
          period: '2026-05',
          oldValue: electricityOld,
          newValue: electricityNew
        },
        {
          roomId: invoiceRoomId,
          serviceId: waterService.id,
          period: '2026-05',
          oldValue: waterOld,
          newValue: waterNew
        }
      ];
      await readingService.create(readingsPayload);
      await invoiceService.generateInvoices(propertyId, '2026-05');
      setInvoiceRoomId(null);
      showToast(`Đã lập hoá đơn thành công cho phòng ${invoiceRoomObj.code}!`);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Lỗi lập hoá đơn');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 4500);
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

  const roomsByFloor = {};
  filteredRooms.forEach(room => {
    if (!roomsByFloor[room.floor]) {
      roomsByFloor[room.floor] = [];
    }
    roomsByFloor[room.floor].push(room);
  });
  
  const sortedFloors = Object.keys(roomsByFloor).sort((a, b) => b - a);

  return (
    <div className="flex flex-col gap-6 w-full text-zinc-900 select-none">
      
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-primary border border-primary/20 text-white font-extrabold text-xs py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Info size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bento Grid Stats / Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Tổng phòng */}
        <div
          onClick={() => setStatusFilter('all')}
          className={cn(
            "bg-white border border-zinc-200/50 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-95 group",
            statusFilter === 'all' ? 'ring-2 ring-primary bg-primary-soft/20 border-primary/10' : ''
          )}
        >
          <div className="p-2.5 bg-primary/5 text-primary rounded-xl transition-colors group-hover:bg-primary group-hover:text-white">
            <Building2 size={18} />
          </div>
          <div>
            <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tổng số phòng</div>
            <div className="text-sm font-extrabold text-zinc-900 mt-0.5">{rooms.length} phòng</div>
          </div>
        </div>

        {/* Còn trống */}
        <div
          onClick={() => setStatusFilter('vacant')}
          className={cn(
            "bg-white border border-zinc-200/50 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-95 group",
            statusFilter === 'vacant' ? 'ring-2 ring-emerald-500 bg-emerald-50/20 border-emerald-500/10' : ''
          )}
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-[9px] text-emerald-600/70 font-bold uppercase tracking-wider">Còn trống</div>
            <div className="text-sm font-extrabold text-emerald-600 mt-0.5">{vacantCount} phòng</div>
          </div>
        </div>

        {/* Đang thuê */}
        <div
          onClick={() => setStatusFilter('occupied')}
          className={cn(
            "bg-white border border-zinc-200/50 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-95 group",
            statusFilter === 'occupied' ? 'ring-2 ring-blue-500 bg-blue-50/20 border-blue-500/10' : ''
          )}
        >
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <User size={18} />
          </div>
          <div>
            <div className="text-[9px] text-blue-600/70 font-bold uppercase tracking-wider">Đang thuê</div>
            <div className="text-sm font-extrabold text-blue-600 mt-0.5">{occupiedCount} phòng</div>
          </div>
        </div>

        {/* Đặt cọc */}
        <div
          onClick={() => setStatusFilter('deposit')}
          className={cn(
            "bg-white border border-zinc-200/50 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-95 group",
            statusFilter === 'deposit' ? 'ring-2 ring-amber-500 bg-amber-50/20 border-amber-500/10' : ''
          )}
        >
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl transition-colors group-hover:bg-amber-600 group-hover:text-white">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-[9px] text-amber-600/70 font-bold uppercase tracking-wider">Đặt cọc</div>
            <div className="text-sm font-extrabold text-amber-600 mt-0.5">{depositCount} phòng</div>
          </div>
        </div>

        {/* Bảo trì */}
        <div
          onClick={() => setStatusFilter('paused')}
          className={cn(
            "bg-white border border-zinc-200/50 p-4 rounded-2xl flex items-center gap-3.5 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-300 active:scale-95 group",
            statusFilter === 'paused' ? 'ring-2 ring-zinc-400 bg-zinc-50 border-zinc-300' : ''
          )}
        >
          <div className="p-2.5 bg-zinc-100 text-zinc-500 rounded-xl transition-colors group-hover:bg-zinc-500 group-hover:text-white">
            <Settings size={18} />
          </div>
          <div>
            <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Bảo trì</div>
            <div className="text-sm font-extrabold text-zinc-700 mt-0.5">{pausedCount} phòng</div>
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Rooms Map (Bento Layout) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-950">Sơ đồ phòng theo tầng</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Nhấp chọn phòng để quản lý chi tiết thông tin và dịch vụ</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 select-none">
              {selectedRoomId && (
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-sm active:scale-95"
                >
                  <ArrowLeft size={13} />
                  <span>Quay lại</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedRoomId(null);
                  setIsEditing(false);
                  setStatusFilter('all');
                  setFloorFilter('all');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-zinc-50 text-zinc-700 rounded-xl border border-zinc-200 transition-colors active:scale-95"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw size={13} />
                <span>Đặt lại</span>
              </button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold px-3 py-1.5 text-zinc-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Trạng thái (Tất cả)</option>
                <option value="vacant">Còn trống</option>
                <option value="occupied">Đang thuê</option>
                <option value="deposit">Đặt cọc</option>
                <option value="paused">Bảo trì</option>
              </select>

              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold px-3 py-1.5 text-zinc-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tầng (Tất cả)</option>
                <option value="1">Tầng 1</option>
                <option value="2">Tầng 2</option>
                <option value="3">Tầng 3</option>
              </select>
            </div>
          </div>

          {/* Sơ đồ danh sách phòng */}
          <div className="space-y-6">
            {sortedFloors.length > 0 ? (
              sortedFloors.map((floorNum) => (
                <div key={floorNum} className="bg-zinc-50/50 border border-zinc-200/40 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-200/40">
                    <Layers size={14} className="text-primary" />
                    <span className="text-xs font-extrabold text-zinc-900">Tầng {floorNum}</span>
                    <span className="text-[10px] text-zinc-400 font-bold">({roomsByFloor[floorNum].length} phòng)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {roomsByFloor[floorNum].map((room) => {
                      let statusBg = 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700';
                      let statusColorDot = 'bg-zinc-400';
                      let statusText = 'Bảo trì';

                      if (room.status === 'vacant') {
                        statusBg = 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 border-emerald-100/60';
                        statusColorDot = 'bg-emerald-500';
                        statusText = 'Còn trống';
                      } else if (room.status === 'occupied') {
                        statusBg = 'bg-primary-soft hover:bg-primary-soft/90 text-primary border-primary/10';
                        statusColorDot = 'bg-primary';
                        statusText = 'Đang thuê';
                      } else if (room.status === 'deposit') {
                        statusBg = 'bg-amber-50 hover:bg-amber-100/70 text-amber-700 border-amber-100/60';
                        statusColorDot = 'bg-amber-500';
                        statusText = 'Đặt cọc';
                      } else if (room.status === 'paused') {
                        statusBg = 'bg-zinc-50 hover:bg-zinc-100 text-zinc-500 border-zinc-200/60';
                        statusColorDot = 'bg-zinc-400';
                        statusText = 'Bảo trì';
                      }

                      const isSelected = selectedRoomId === room.id;

                      return (
                        <div
                          key={room.id}
                          onClick={() => handleClickRoom(room)}
                          className={cn(
                            "group border p-3 rounded-2xl cursor-pointer flex flex-col justify-between h-24 transition-all duration-300 active:scale-95 bg-white shadow-sm",
                            statusBg,
                            isSelected 
                              ? "ring-4 ring-primary/10 scale-[1.03] border-primary/30 shadow-md" 
                              : "hover:scale-[1.01]"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-xs text-zinc-900 group-hover:text-primary transition-colors">
                              {room.code}
                            </span>
                            <span className="flex items-center gap-1 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-white border border-zinc-100">
                              <span className={cn("w-1 h-1 rounded-full animate-pulse", statusColorDot)} />
                              <span>{statusText}</span>
                            </span>
                          </div>

                          <div className="flex justify-between items-end border-t border-zinc-100 pt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                            <span>{room.area} m²</span>
                            <span className="text-zinc-900 font-extrabold">{formatCurrency(room.price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-zinc-400">
                <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-full">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800">Không tìm thấy phòng nào</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-1">Điều chỉnh bộ lọc để xem danh sách phòng</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Room Details Sheet */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/50 rounded-3xl p-6 shadow-sm">
          {selectedRoom ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 bg-primary-soft text-primary border border-primary/20 rounded-lg">
                    Phòng {selectedRoom.code}
                  </span>
                  <h2 className="text-sm font-extrabold mt-1 text-zinc-900">Chi tiết phòng trọ</h2>
                </div>
                <button
                  onClick={() => setSelectedRoomId(null)}
                  className="p-1 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-zinc-50/50 border border-zinc-200/60 p-3 rounded-2xl text-xs">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Trạng thái phòng</span>
                  <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[9px] uppercase border ${
                    selectedRoom.status === 'vacant'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : selectedRoom.status === 'occupied'
                      ? 'bg-primary-soft text-primary border-primary/20'
                      : selectedRoom.status === 'deposit'
                      ? 'bg-amber-50 text-amber-700 border-amber-100'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  }`}>
                    {selectedRoom.status === 'vacant'
                      ? 'Còn trống'
                      : selectedRoom.status === 'occupied'
                      ? 'Đang thuê'
                      : selectedRoom.status === 'deposit'
                      ? 'Đặt cọc'
                      : 'Bảo trì'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50/50 p-3 rounded-2xl border border-zinc-200/40">
                    <span className="text-zinc-400 block text-[9px] font-bold uppercase tracking-wider">Diện tích</span>
                    <span className="font-extrabold text-zinc-800 mt-1 block text-sm">{selectedRoom.area} m²</span>
                  </div>
                  <div className="bg-zinc-50/50 p-3 rounded-2xl border border-zinc-200/40">
                    <span className="text-zinc-400 block text-[9px] font-bold uppercase tracking-wider">Giá thuê</span>
                    <span className="font-extrabold text-zinc-800 mt-1 block text-sm">{formatCurrency(selectedRoom.price)}</span>
                  </div>
                </div>

                {selectedRoom.status === 'occupied' || selectedRoom.status === 'deposit' ? (
                  <div className="bg-primary-soft/10 border border-primary/10 p-4 rounded-2xl flex flex-col gap-2.5">
                    <h3 className="font-bold text-xs text-primary flex items-center gap-1.5 border-b border-primary/5 pb-2">
                      <User size={14} />
                      <span>Thông tin khách thuê</span>
                    </h3>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 font-bold">Khách thuê</span>
                        <span className="font-extrabold text-zinc-800">{selectedRoom.tenantName || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 font-bold">Điện thoại</span>
                        <span className="font-extrabold text-zinc-800 flex items-center gap-1">
                          <Phone size={12} className="text-zinc-400" /> {selectedRoom.tenantPhone || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400 font-bold">Ngày dời vào</span>
                        <span className="font-extrabold text-zinc-800">{selectedRoom.checkInDate || 'Chưa cập nhật'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl flex items-center gap-2 text-xs text-zinc-400 font-bold">
                    <Info size={14} className="text-primary shrink-0" />
                    <span>Hiện chưa có khách thuê</span>
                  </div>
                )}

                {/* Tài sản trong phòng */}
                <div className="bg-zinc-50/50 border border-zinc-200/60 p-4 rounded-2xl flex flex-col gap-2.5">
                  <h3 className="font-bold text-xs text-zinc-800 flex items-center justify-between border-b border-zinc-200/40 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Layers size={14} className="text-primary" />
                      <span>Tài sản trang bị</span>
                    </div>
                    <button
                      onClick={() => handleOpenAssets(selectedRoom)}
                      className="text-[10px] text-primary hover:underline font-extrabold"
                    >
                      Thiết lập
                    </button>
                  </h3>
                  <div className="flex flex-col gap-1.5 text-[11px] max-h-40 overflow-y-auto pr-1">
                    {selectedRoom.assets && selectedRoom.assets.length > 0 ? (
                      selectedRoom.assets.map((a, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-zinc-100 last:border-0">
                          <span className="text-zinc-700 font-bold">{a.name}</span>
                          <span className="text-zinc-400 font-semibold text-[10px]">
                            {a.condition} · {formatCurrency(a.value)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-zinc-400 text-center py-2 font-bold">Chưa cấu hình trang thiết bị</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-zinc-100 mt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-xl border border-zinc-200 transition-colors active:scale-95"
                >
                  <Edit size={13} />
                  <span>Sửa thông tin</span>
                </button>
                {selectedRoom.status === 'occupied' && (
                  <button
                    onClick={() => handleOpenInvoice(selectedRoom)}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    <FileText size={13} />
                    <span>Lập hoá đơn</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-3 py-16">
              <div className="p-4 bg-zinc-50 border border-zinc-200/50 rounded-full text-zinc-300">
                <Layers size={28} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-800">Chưa chọn phòng</h3>
                <p className="text-[10px] text-zinc-400 font-semibold max-w-[180px] mt-1 mx-auto">
                  Nhấp vào một ô phòng trong sơ đồ để kiểm tra chi tiết
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Room Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white border border-zinc-200/60 rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-[fadeInScale_0.3s_ease-out]">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                <Edit className="text-primary" size={16} />
                <span>Chỉnh sửa phòng {editForm.code}</span>
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Mã phòng</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value="vacant">Còn trống</option>
                    <option value="occupied">Đang thuê</option>
                    <option value="deposit">Đặt cọc</option>
                    <option value="paused">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Diện tích (m²)</label>
                  <input
                    type="number"
                    required
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Giá thuê (VND)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                  />
                </div>
              </div>

              {(editForm.status === 'occupied' || editForm.status === 'deposit') && (
                <div className="space-y-4 border-t border-zinc-100 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Họ tên khách thuê</label>
                    <input
                      type="text"
                      required
                      value={editForm.tenantName || ''}
                      onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                      <input
                        type="text"
                        required
                        value={editForm.tenantPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, tenantPhone: e.target.value })}
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Ngày bắt đầu</label>
                      <input
                        type="date"
                        required
                        value={editForm.checkInDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 h-10 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-sm active:scale-95"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assets Modal */}
      {showAssetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowAssetsModal(false)} />
          <div className="relative bg-white border border-zinc-200/60 rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-[fadeInScale_0.3s_ease-out] max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3 select-none">
              <h2 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                <Layers className="text-primary" size={16} />
                <span>Thiết bị trang bị phòng {rooms.find(r => r.id === selectedRoomId)?.code}</span>
              </h2>
              <button
                onClick={() => setShowAssetsModal(false)}
                className="p-1.5 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAssets} className="flex flex-col gap-4 text-xs flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {assetsFormList.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400 font-bold">Chưa trang bị vật tư nào. Chọn thêm ở góc dưới.</div>
                ) : (
                  assetsFormList.map((asset, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-200/60 relative">
                      <div className="col-span-5 flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tên thiết bị</label>
                        <input
                          type="text"
                          required
                          value={asset.name || asset.tenTaiSan || ''}
                          placeholder="VD: Điều hoà Daikin, Tủ lạnh..."
                          onChange={(e) => {
                            const newArr = [...assetsFormList];
                            newArr[idx] = { ...newArr[idx], name: e.target.value, tenTaiSan: e.target.value };
                            setAssetsFormList(newArr);
                          }}
                          className="bg-white text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-primary text-xs"
                        />
                      </div>
                      
                      <div className="col-span-3 flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Tình trạng</label>
                        <select
                          value={asset.condition || asset.tinhTrang || 'Tốt'}
                          onChange={(e) => {
                            const newArr = [...assetsFormList];
                            newArr[idx] = { ...newArr[idx], condition: e.target.value, tinhTrang: e.target.value };
                            setAssetsFormList(newArr);
                          }}
                          className="bg-white text-zinc-800 border border-zinc-200 px-2 py-1.5 rounded-xl focus:outline-none focus:border-primary text-xs cursor-pointer font-bold"
                        >
                          <option value="Tốt">Tốt</option>
                          <option value="Khá">Khá</option>
                          <option value="Cũ">Cũ</option>
                          <option value="Cần sửa">Cần sửa</option>
                          <option value="Hỏng">Hỏng</option>
                        </select>
                      </div>

                      <div className="col-span-3 flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Khấu hao (đ)</label>
                        <input
                          type="number"
                          value={asset.value !== undefined ? asset.value : (asset.giaTri !== undefined ? asset.giaTri : 0)}
                          onChange={(e) => {
                            const newArr = [...assetsFormList];
                            const val = parseInt(e.target.value) || 0;
                            newArr[idx] = { ...newArr[idx], value: val, giaTri: val };
                            setAssetsFormList(newArr);
                          }}
                          className="bg-white text-zinc-800 border border-zinc-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-primary text-xs font-semibold"
                        />
                      </div>

                      <div className="col-span-1 flex items-end justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAssetsFormList(assetsFormList.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                          title="Gỡ bỏ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    setAssetsFormList([...assetsFormList, { name: '', condition: 'Tốt', value: 0, tenTaiSan: '', tinhTrang: 'Tốt', giaTri: 0 }]);
                  }}
                  className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-primary border border-primary/10 font-bold rounded-xl flex items-center gap-1.5 active:scale-95"
                >
                  <Plus size={14} />
                  <span>Thêm thiết bị</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssetsModal(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 active:scale-95"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-sm active:scale-95"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Invoice Modal */}
      {invoiceRoomId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setInvoiceRoomId(null)} />
          <div className="relative bg-white border border-zinc-200/60 rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-[fadeInScale_0.3s_ease-out]">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-extrabold text-zinc-950 flex items-center gap-2">
                <FileText className="text-primary" size={16} />
                <span>Chốt số điện nước phòng {rooms.find((r) => r.id === invoiceRoomId)?.code}</span>
              </h2>
              <button
                onClick={() => setInvoiceRoomId(null)}
                className="p-1.5 hover:bg-zinc-50 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/60">
                <span className="text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Tiền phòng cố định</span>
                <span className="font-extrabold text-zinc-900">
                  {formatCurrency(rooms.find((r) => r.id === invoiceRoomId)?.price || 0)}
                </span>
              </div>

              {/* Chỉ số điện */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-zinc-800 text-xs">Đo chỉ số Điện (kWh)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chỉ số cũ</label>
                    <input
                      type="number"
                      required
                      value={electricityOld}
                      onChange={(e) => setElectricityOld(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chỉ số mới</label>
                    <input
                      type="number"
                      required
                      value={electricityNew}
                      onChange={(e) => setElectricityNew(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Chỉ số nước */}
              <div className="space-y-2">
                <h3 className="font-extrabold text-zinc-800 text-xs">Đo chỉ số Nước (m³)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chỉ số cũ</label>
                    <input
                      type="number"
                      required
                      value={waterOld}
                      onChange={(e) => setWaterOld(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Chỉ số mới</label>
                    <input
                      type="number"
                      required
                      value={waterNew}
                      onChange={(e) => setWaterNew(parseInt(e.target.value) || 0)}
                      className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200/60 rounded-xl focus:outline-none focus:border-primary focus:bg-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/60 space-y-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <div className="flex justify-between items-center">
                  <span>Tiêu dùng điện:</span>
                  <span className="text-zinc-800 font-extrabold">{electricityNew - electricityOld} kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tiêu dùng nước:</span>
                  <span className="text-zinc-800 font-extrabold">{waterNew - waterOld} m³</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setInvoiceRoomId(null)}
                  className="flex-1 h-10 rounded-xl border border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50 active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-sm active:scale-95"
                >
                  Xác nhận chốt & lập hoá đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
}
