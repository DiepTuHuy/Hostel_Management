/**
 * Room Model — phòng trọ
 * Status: 'vacant' | 'occupied' | 'deposit' | 'paused'
 */
export const ROOM_STATUS = {
  VACANT: 'vacant',
  OCCUPIED: 'occupied',
  DEPOSIT: 'deposit',
  PAUSED: 'paused',
};

export const ROOM_STATUS_META = {
  vacant:   { label: 'Trống',       color: 'success', dot: '#16A34A' },
  occupied: { label: 'Đang thuê',   color: 'info',    dot: '#0EA5E9' },
  deposit:  { label: 'Đặt cọc',     color: 'warning', dot: '#F59E0B' },
  paused:   { label: 'Ngưng cho thuê', color: 'neutral', dot: '#6B7280' },
};

export class Room {
  constructor({
    id,
    code,
    propertyId,
    floor,
    type, // 'studio' | 'shared' | 'private' ...
    area, // m2
    price, // VND / tháng
    amenities = [],
    status = ROOM_STATUS.VACANT,
    currentTenantId = null,
    photos = [],
    description = '',
  }) {
    this.id = id;
    this.code = code;
    this.propertyId = propertyId;
    this.floor = floor;
    this.type = type;
    this.area = area;
    this.price = price;
    this.amenities = amenities;
    
    // Map database room status to frontend status
    let mappedStatus = status;
    if (status === 'empty') {
      mappedStatus = ROOM_STATUS.VACANT;
    } else if (status === 'rented') {
      mappedStatus = ROOM_STATUS.OCCUPIED;
    } else if (status === 'maintenance') {
      mappedStatus = ROOM_STATUS.PAUSED;
    }
    this.status = mappedStatus;
    
    this.currentTenantId = currentTenantId;
    this.photos = photos;
    this.description = description;
  }

  get statusMeta() {
    return ROOM_STATUS_META[this.status];
  }

  get isAvailable() {
    return this.status === ROOM_STATUS.VACANT;
  }

  get statusBgClass() {
    switch (this.status) {
      case ROOM_STATUS.VACANT:
        return 'bg-emerald-600 border border-emerald-500/20 text-white shadow-md';
      case ROOM_STATUS.OCCUPIED:
        return 'bg-blue-600 border border-blue-500/20 text-white shadow-md';
      case ROOM_STATUS.DEPOSIT:
        return 'bg-amber-500 border border-amber-400/20 text-white shadow-md';
      case ROOM_STATUS.PAUSED:
      default:
        return 'bg-gray-500 border border-gray-400/20 text-white shadow-md';
    }
  }

  get statusTextClass() {
    switch (this.status) {
      case ROOM_STATUS.VACANT:
        return 'text-emerald-600';
      case ROOM_STATUS.OCCUPIED:
        return 'text-blue-600';
      case ROOM_STATUS.DEPOSIT:
        return 'text-amber-500';
      case ROOM_STATUS.PAUSED:
      default:
        return 'text-gray-500';
    }
  }
}
