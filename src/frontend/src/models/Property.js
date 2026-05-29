/**
 * Property Model — nhà trọ / chi nhánh
 */
export class Property {
  constructor({
    id,
    code,
    name,
    address,
    district,
    city,
    coordinates = null, // { lat, lng }
    image = null,
    totalRooms = 0,
    occupiedRooms = 0,
    managerIds = [],
    status = 'active', // 'active' | 'paused'
    qrCodeUrl = '',
    createdAt,
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.address = address;
    this.district = district;
    this.city = city;
    this.coordinates = coordinates;
    this.image = image;
    this.totalRooms = totalRooms;
    this.occupiedRooms = occupiedRooms;
    this.managerIds = managerIds;
    this.status = status;
    this.qrCodeUrl = qrCodeUrl;
    this.createdAt = createdAt;
  }

  get occupancyRate() {
    if (!this.totalRooms) return 0;
    return Math.round((this.occupiedRooms / this.totalRooms) * 100);
  }

  get vacantRooms() {
    return Math.max(0, this.totalRooms - this.occupiedRooms);
  }
}
