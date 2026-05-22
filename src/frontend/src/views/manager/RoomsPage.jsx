import { useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
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

const initialRoomsData = [
  { id: '101', code: 'P.101', floor: 1, area: 25, price: 3200000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 0, z: -1.2 },
  { id: '102', code: 'P.102', floor: 1, area: 25, price: 3200000, status: 'occupied', tenantName: 'Nguyễn Văn Hải', tenantPhone: '0987654321', checkInDate: '2026-01-10', x: 1.2, y: 0, z: -1.2 },
  { id: '103', code: 'P.103', floor: 1, area: 30, price: 4000000, status: 'deposit', tenantName: 'Trần Thị Thu Trang', tenantPhone: '0912345678', checkInDate: '2026-02-15', x: -1.2, y: 0, z: 1.2 },
  { id: '104', code: 'P.104', floor: 1, area: 25, price: 3200000, status: 'paused', tenantName: '', tenantPhone: '', checkInDate: '', x: 1.2, y: 0, z: 1.2 },
  { id: '201', code: 'P.201', floor: 2, area: 25, price: 3500000, status: 'occupied', tenantName: 'Lê Minh Quốc', tenantPhone: '0934567890', checkInDate: '2026-03-01', x: -1.2, y: 1.6, z: -1.2 },
  { id: '202', code: 'P.202', floor: 2, area: 25, price: 3500000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '', x: 1.2, y: 1.6, z: -1.2 },
  { id: '203', code: 'P.203', floor: 2, area: 30, price: 4200000, status: 'occupied', tenantName: 'Phạm Hồng Thái', tenantPhone: '0945678901', checkInDate: '2026-03-20', x: -1.2, y: 1.6, z: 1.2 },
  { id: '204', code: 'P.204', floor: 2, area: 25, price: 3500000, status: 'deposit', tenantName: 'Đặng Thùy Chi', tenantPhone: '0956789012', checkInDate: '2026-04-05', x: 1.2, y: 1.6, z: 1.2 },
  { id: '301', code: 'P.301', floor: 3, area: 28, price: 3800000, status: 'vacant', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 3.2, z: -1.2 },
  { id: '302', code: 'P.302', floor: 3, area: 28, price: 3800000, status: 'occupied', tenantName: 'Vũ Hữu Phước', tenantPhone: '0967890123', checkInDate: '2026-04-12', x: 1.2, y: 3.2, z: -1.2 },
  { id: '303', code: 'P.303', floor: 3, area: 32, price: 4500000, status: 'paused', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 3.2, z: 1.2 },
  { id: '304', code: 'P.304', floor: 3, area: 28, price: 3800000, status: 'occupied', tenantName: 'Hoàng Mỹ Linh', tenantPhone: '0978901234', checkInDate: '2026-04-18', x: 1.2, y: 3.2, z: 1.2 },
];

function CameraController({ selectedRoom }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;
    const targetLookAt = new THREE.Vector3(0, 1.6, 0);
    const targetCamera = new THREE.Vector3(8, 8, 8);

    if (selectedRoom) {
      targetLookAt.set(selectedRoom.x, selectedRoom.y + 0.3, selectedRoom.z);
      targetCamera.set(selectedRoom.x + 3.2, selectedRoom.y + 3.2, selectedRoom.z + 3.2);
    }

    controlsRef.current.target.lerp(targetLookAt, 0.08);
    camera.position.lerp(targetCamera, 0.08);
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={4}
      maxDistance={25}
    />
  );
}

function RoomMesh({ room, isSelected, isHovered, onHover, onClick }) {
  const groupRef = useRef();
  let targetY = 0;
  let targetScale = 1;
  let color = '#cbd5e1';

  if (room.status === 'vacant') {
    color = '#10b981';
  } else if (room.status === 'occupied') {
    color = '#3b82f6';
  } else if (room.status === 'deposit') {
    color = '#f97316';
  } else if (room.status === 'paused') {
    color = '#6b7280';
  }

  if (isHovered) {
    targetY = 0.25;
    targetScale = 1.08;
  } else if (isSelected) {
    targetY = 0.12;
    targetScale = 1.03;
  }

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.15;
    const scaleVal = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.15);
    groupRef.current.scale.set(scaleVal, scaleVal, scaleVal);
  });

  return (
    <group position={[room.x, room.y, room.z]}>
      <mesh position={[0, -0.61, 0]}>
        <boxGeometry args={[1.82, 0.03, 1.82]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      <group ref={groupRef}>
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(room.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(room);
          }}
        >
          <boxGeometry args={[1.74, 1.2, 1.74]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.72}
            emissive={isHovered ? color : '#000000'}
            emissiveIntensity={isHovered ? 0.25 : 0}
            roughness={0.3}
            metalness={0.15}
          />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(1.742, 1.202, 1.742)]} />
          <lineBasicMaterial color={isHovered ? '#60a5fa' : '#ffffff'} transparent opacity={0.3} />
        </lineSegments>
      </group>

      <Html position={[0, 0.8, 0]} center distanceFactor={8} className="pointer-events-none select-none">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all duration-200 ${
          isSelected
            ? 'bg-blue-600 text-white border-blue-400 shadow-md scale-110'
            : isHovered
            ? 'bg-slate-700 text-white border-slate-500 shadow'
            : 'bg-slate-900/90 text-slate-200 border-slate-700/50 shadow-sm'
        }`}>
          {room.code}
        </div>
      </Html>
    </group>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState(initialRoomsData);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [invoiceRoomId, setInvoiceRoomId] = useState(null);

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

  const handleHoverRoom = (id) => {
    setHoveredRoomId(id);
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

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-100px)] min-h-[600px] text-slate-100 p-2">
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 border border-blue-400 text-white font-semibold py-3 px-6 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Info size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 backdrop-blur border border-slate-800 p-4 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building className="text-blue-500" />
            <span>Mô Hình Quản Lý Không Gian 3D</span>
          </h1>
          <p className="text-xs text-slate-400">Xem trực quan và vận hành các phòng trọ theo thời gian thực</p>
        </div>
        <div className="flex gap-2">
          {selectedRoomId && (
            <button
              onClick={() => setSelectedRoomId(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg"
            >
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </button>
          )}
          <button
            onClick={() => {
              setSelectedRoomId(null);
              setIsEditing(false);
              setStatusFilter('all');
              setFloorFilter('all');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Đặt Lại</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
            <Building size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Tổng phòng</div>
            <div className="text-lg font-bold text-slate-200">{rooms.length} phòng</div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 font-semibold uppercase">Còn trống</div>
            <div className="text-lg font-bold text-emerald-300">{vacantCount} phòng</div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-950 text-blue-400 rounded-lg">
            <User size={20} />
          </div>
          <div>
            <div className="text-[10px] text-blue-400 font-semibold uppercase">Đang thuê</div>
            <div className="text-lg font-bold text-blue-300">{occupiedCount} phòng</div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-orange-950/80 text-orange-400 rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[10px] text-orange-400 font-semibold uppercase">Đặt cọc</div>
            <div className="text-lg font-bold text-orange-300">{depositCount} phòng</div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
            <Settings size={20} />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Bảo trì</div>
            <div className="text-lg font-bold text-slate-300">{pausedCount} phòng</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[400px] grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="lg:col-span-3 bg-slate-950/80 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/90 text-slate-200 border border-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
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
              className="bg-slate-900/90 text-slate-200 border border-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tầng (Tất cả)</option>
              <option value="1">Tầng 1</option>
              <option value="2">Tầng 2</option>
              <option value="3">Tầng 3</option>
            </select>
          </div>

          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [8, 8, 8], fov: 40 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.4} />

              <group position={[0, -1.2, 0]}>
                {filteredRooms.map((room) => (
                  <RoomMesh
                    key={room.id}
                    room={room}
                    isSelected={selectedRoomId === room.id}
                    isHovered={hoveredRoomId === room.id}
                    onHover={handleHoverRoom}
                    onClick={handleClickRoom}
                  />
                ))}
              </group>

              <CameraController selectedRoom={selectedRoom} />
            </Canvas>
          </div>

          <div className="absolute bottom-4 left-4 z-10 flex gap-4 text-[10px] bg-slate-900/80 backdrop-blur px-3 py-2 border border-slate-800 rounded-lg">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" />
              <span>Đang thuê</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" />
              <span>Đặt cọc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-gray-500" />
              <span>Bảo trì</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 flex-1">
            {selectedRoom ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-900 rounded">
                      Phòng {selectedRoom.code}
                    </span>
                    <h2 className="text-base font-bold mt-1 text-slate-100">Chi Tiết Phòng</h2>
                  </div>
                  <button
                    onClick={() => setSelectedRoomId(null)}
                    className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-3.5 text-xs flex-1">
                  <div className="flex justify-between items-center bg-slate-800/30 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Trạng thái</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      selectedRoom.status === 'vacant'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : selectedRoom.status === 'occupied'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : selectedRoom.status === 'deposit'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
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
                    <div className="bg-slate-800/20 p-2 rounded border border-slate-800/60">
                      <span className="text-slate-400 block text-[10px] uppercase">Diện tích</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">{selectedRoom.area} m²</span>
                    </div>
                    <div className="bg-slate-800/20 p-2 rounded border border-slate-800/60">
                      <span className="text-slate-400 block text-[10px] uppercase">Giá thuê</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">{formatCurrency(selectedRoom.price)}</span>
                    </div>
                  </div>

                  {selectedRoom.status === 'occupied' || selectedRoom.status === 'deposit' ? (
                    <div className="bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg flex flex-col gap-2">
                      <h3 className="font-semibold text-blue-400 flex items-center gap-1.5 border-b border-blue-950 pb-1.5">
                        <User size={14} />
                        <span>Thông Tin Khách Thuê</span>
                      </h3>
                      <div className="flex flex-col gap-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Khách thuê</span>
                          <span className="font-bold text-slate-200">{selectedRoom.tenantName || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Điện thoại</span>
                          <span className="font-bold text-slate-200">{selectedRoom.tenantPhone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Ngày dời vào</span>
                          <span className="font-bold text-slate-200">{selectedRoom.checkInDate || 'Chưa cập nhật'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/20 border border-slate-800 p-3 rounded-lg flex items-center gap-2 text-slate-400">
                      <Info size={14} className="text-blue-500 shrink-0" />
                      <span>Không có khách thuê hiện tại</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Edit size={14} />
                    <span>Sửa</span>
                  </button>
                  {selectedRoom.status === 'occupied' && (
                    <button
                      onClick={() => handleOpenInvoice(selectedRoom)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <FileText size={14} />
                      <span>Lập Hoá Đơn</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 h-full py-12">
                <div className="p-4 bg-slate-800/40 rounded-full text-slate-500 border border-slate-800">
                  <Layers size={32} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-300">Chưa Chọn Phòng</h3>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-1 mx-auto">
                    Nhấp vào một khối phòng 3D trong mô hình để xem thông tin
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit className="text-blue-500" size={18} />
                <span>Chỉnh Sửa Phòng {editForm.code}</span>
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Mã phòng</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                    className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Trạng thái</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
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
                  <label className="text-slate-400">Diện tích (m²)</label>
                  <input
                    type="number"
                    required
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400">Giá thuê (VND/tháng)</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {(editForm.status === 'occupied' || editForm.status === 'deposit') && (
                <div className="flex flex-col gap-3 border-t border-slate-800/80 pt-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-400">Tên khách thuê</label>
                    <input
                      type="text"
                      required
                      value={editForm.tenantName || ''}
                      onChange={(e) => setEditForm({ ...editForm, tenantName: e.target.value })}
                      className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400">Điện thoại</label>
                      <input
                        type="text"
                        required
                        value={editForm.tenantPhone || ''}
                        onChange={(e) => setEditForm({ ...editForm, tenantPhone: e.target.value })}
                        className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-400">Ngày dời vào</label>
                      <input
                        type="date"
                        required
                        value={editForm.checkInDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                        className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {invoiceRoomId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="text-blue-500" size={18} />
                <span>Lập Hoá Đơn Phòng {rooms.find((r) => r.id === invoiceRoomId)?.code}</span>
              </h2>
              <button
                onClick={() => setInvoiceRoomId(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-2 bg-slate-950/50 p-3 rounded-lg border border-slate-850">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tiền phòng cơ bản:</span>
                  <span className="font-bold text-slate-200">
                    {formatCurrency(rooms.find((r) => r.id === invoiceRoomId)?.price || 0)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-slate-300 mb-1">Chỉ số Điện</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Cũ</label>
                    <input
                      type="number"
                      required
                      value={electricityOld}
                      onChange={(e) => setElectricityOld(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Mới</label>
                    <input
                      type="number"
                      required
                      value={electricityNew}
                      onChange={(e) => setElectricityNew(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-slate-300 mb-1">Chỉ số Nước</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Cũ</label>
                    <input
                      type="number"
                      required
                      value={waterOld}
                      onChange={(e) => setWaterOld(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-400 text-[10px] uppercase">Mới</label>
                    <input
                      type="number"
                      required
                      value={waterNew}
                      onChange={(e) => setWaterNew(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 text-slate-200 border border-slate-850 px-3 py-2 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Tiêu thụ điện:</span>
                  <span className="font-semibold text-slate-200">{electricityNew - electricityOld} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiêu thụ nước:</span>
                  <span className="font-semibold text-slate-200">{waterNew - waterOld} m³</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setInvoiceRoomId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
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
