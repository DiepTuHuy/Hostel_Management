export const branches = [
  {
    id: 'b1',
    name: 'BoardingHouse Quận 1',
    address: '123 Nguyễn Thị Minh Khai, Bến Thành, Quận 1, TP. HCM',
    phone: '0901234567',
    totalRooms: 12,
    description: 'Chi nhánh trung tâm, đầy đủ tiện nghi, gần các trường đại học.'
  },
  {
    id: 'b2',
    name: 'BoardingHouse Quận 7',
    address: '456 Nguyễn Thị Thập, Tân Phong, Quận 7, TP. HCM',
    phone: '0907654321',
    totalRooms: 8,
    description: 'Không gian yên tĩnh, an ninh tốt, gần Lotte Mart.'
  }
];

export const rooms = [
  { id: '101', code: 'P.101', floor: 1, area: 25, price: 3200000, status: 'vacant', branchId: 'b1', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 0, z: -1.2 },
  { id: '102', code: 'P.102', floor: 1, area: 25, price: 3200000, status: 'occupied', branchId: 'b1', tenantName: 'Nguyễn Văn Hải', tenantPhone: '0987654321', checkInDate: '2026-01-10', x: 1.2, y: 0, z: -1.2 },
  { id: '103', code: 'P.103', floor: 1, area: 30, price: 4000000, status: 'deposit', branchId: 'b1', tenantName: 'Trần Thị Thu Trang', tenantPhone: '0912345678', checkInDate: '2026-02-15', x: -1.2, y: 0, z: 1.2 },
  { id: '104', code: 'P.104', floor: 1, area: 25, price: 3200000, status: 'paused', branchId: 'b1', tenantName: '', tenantPhone: '', checkInDate: '', x: 1.2, y: 0, z: 1.2 },
  { id: '201', code: 'P.201', floor: 2, area: 25, price: 3500000, status: 'occupied', branchId: 'b1', tenantName: 'Lê Minh Quốc', tenantPhone: '0934567890', checkInDate: '2026-03-01', x: -1.2, y: 1.6, z: -1.2 },
  { id: '202', code: 'P.202', floor: 2, area: 25, price: 3500000, status: 'vacant', branchId: 'b1', tenantName: '', tenantPhone: '', checkInDate: '', x: 1.2, y: 1.6, z: -1.2 },
  { id: '203', code: 'P.203', floor: 2, area: 30, price: 4200000, status: 'occupied', branchId: 'b1', tenantName: 'Phạm Hồng Thái', tenantPhone: '0945678901', checkInDate: '2026-03-20', x: -1.2, y: 1.6, z: 1.2 },
  { id: '204', code: 'P.204', floor: 2, area: 25, price: 3500000, status: 'deposit', branchId: 'b1', tenantName: 'Đặng Thùy Chi', tenantPhone: '0956789012', checkInDate: '2026-04-05', x: 1.2, y: 1.6, z: 1.2 },
  { id: '301', code: 'P.301', floor: 3, area: 28, price: 3800000, status: 'vacant', branchId: 'b1', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 3.2, z: -1.2 },
  { id: '302', code: 'P.302', floor: 3, area: 28, price: 3800000, status: 'occupied', branchId: 'b1', tenantName: 'Vũ Hữu Phước', tenantPhone: '0967890123', checkInDate: '2026-04-12', x: 1.2, y: 3.2, z: -1.2 },
  { id: '303', code: 'P.303', floor: 3, area: 32, price: 4500000, status: 'paused', branchId: 'b1', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 3.2, z: 1.2 },
  { id: '304', code: 'P.304', floor: 3, area: 28, price: 3800000, status: 'occupied', branchId: 'b1', tenantName: 'Hoàng Mỹ Linh', tenantPhone: '0978901234', checkInDate: '2026-04-18', x: 1.2, y: 3.2, z: 1.2 },
  { id: '701', code: 'P.701', floor: 1, area: 22, price: 2800000, status: 'vacant', branchId: 'b2', tenantName: '', tenantPhone: '', checkInDate: '', x: -1.2, y: 0, z: -1.2 },
  { id: '702', code: 'P.702', floor: 1, area: 22, price: 2800000, status: 'occupied', branchId: 'b2', tenantName: 'Lâm Văn Nam', tenantPhone: '0981112223', checkInDate: '2026-01-15', x: 1.2, y: 0, z: -1.2 }
];

export const users = [
  {
    id: 'u1',
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@boardinghouse.vn',
    phone: '0901234567',
    role: 'admin',
    status: 'active',
    propertyIds: [],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-01'
  },
  {
    id: 'u2',
    fullName: 'Lê Hoàng Manager',
    email: 'manager.q1@boardinghouse.vn',
    phone: '0907654321',
    role: 'manager',
    status: 'active',
    propertyIds: ['b1', 'b2'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10'
  },
  {
    id: 'u3',
    fullName: 'Nguyễn Văn Hải',
    email: 'duc.pm@gmail.com',
    phone: '0987654321',
    role: 'tenant',
    status: 'active',
    propertyIds: [],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-10'
  }
];

export const invoices = [
  {
    id: 'i1',
    roomId: '102',
    roomCode: 'P.102',
    month: '05/2026',
    price: 3200000,
    electricityOld: 1200,
    electricityNew: 1350,
    waterOld: 45,
    waterNew: 52,
    total: 3955000,
    status: 'paid',
    dueDate: '2026-05-15'
  },
  {
    id: 'i2',
    roomId: '201',
    roomCode: 'P.201',
    month: '05/2026',
    price: 3500000,
    electricityOld: 1800,
    electricityNew: 1980,
    waterOld: 80,
    waterNew: 92,
    total: 4410000,
    status: 'unpaid',
    dueDate: '2026-06-05'
  },
  {
    id: 'i3',
    roomId: '203',
    roomCode: 'P.203',
    month: '05/2026',
    price: 4200000,
    electricityOld: 2100,
    electricityNew: 2310,
    waterOld: 110,
    waterNew: 128,
    total: 5205000,
    status: 'unpaid',
    dueDate: '2026-06-05'
  }
];

export const contracts = [
  {
    id: 'c1',
    roomId: '102',
    roomCode: 'P.102',
    tenantName: 'Nguyễn Văn Hải',
    tenantPhone: '0987654321',
    price: 3200000,
    deposit: 3200000,
    startDate: '2026-01-10',
    endDate: '2027-01-10',
    status: 'active',
    signatureLink: 'https://boardinghouse.vn/signatures/c1'
  },
  {
    id: 'c2',
    roomId: '201',
    roomCode: 'P.201',
    tenantName: 'Lê Minh Quốc',
    tenantPhone: '0934567890',
    price: 3500000,
    deposit: 3500000,
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    status: 'active',
    signatureLink: 'https://boardinghouse.vn/signatures/c2'
  }
];
