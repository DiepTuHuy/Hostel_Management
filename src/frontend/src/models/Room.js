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
        return 'bg-[#059669] border border-[#34D399]/40 text-white shadow-[0_4px_12px_rgba(5,150,105,0.45)]';
      case ROOM_STATUS.OCCUPIED:
        return 'bg-[#2563EB] border border-[#60A5FA]/40 text-white shadow-[0_4px_12px_rgba(37,99,235,0.45)]';
      case ROOM_STATUS.DEPOSIT:
        return 'bg-[#D97706] border border-[#FBBF24]/40 text-white shadow-[0_4px_12px_rgba(217,119,6,0.45)]';
      case ROOM_STATUS.PAUSED:
      default:
        return 'bg-[#4B5563] border border-[#9CA3AF]/40 text-white shadow-[0_4px_12px_rgba(75,85,99,0.45)]';
    }
  }

  get statusTextClass() {
    switch (this.status) {
      case ROOM_STATUS.VACANT:
        return 'text-[#059669]';
      case ROOM_STATUS.OCCUPIED:
        return 'text-[#2563EB]';
      case ROOM_STATUS.DEPOSIT:
        return 'text-[#D97706]';
      case ROOM_STATUS.PAUSED:
      default:
        return 'text-[#4B5563]';
    }
  }
}
