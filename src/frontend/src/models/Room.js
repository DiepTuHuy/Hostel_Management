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
    this.status = status;
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
}
