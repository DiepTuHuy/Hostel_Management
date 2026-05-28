/**
 * Contract Model — hợp đồng thuê
 */
export const CONTRACT_STATUS = {
  DRAFT: 'draft',
  PENDING_SIGN: 'pending_sign',
  ACTIVE: 'active',
  EXPIRING: 'expiring',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
};

export const CONTRACT_STATUS_META = {
  draft:         { label: 'Dự thảo',       color: 'neutral' },
  pending_sign:  { label: 'Chờ ký',        color: 'warning' },
  active:        { label: 'Hiệu lực',      color: 'success' },
  expiring:      { label: 'Sắp hết hạn',   color: 'warning' },
  ended:         { label: 'Đã kết thúc',   color: 'neutral' },
  cancelled:     { label: 'Đã huỷ',        color: 'danger'  },
};

export class Contract {
  constructor({
    id,
    code,
    propertyId,
    roomId,
    tenantId,
    startDate,
    endDate,
    deposit,
    monthlyRent,
    services = [],
    status = CONTRACT_STATUS.DRAFT,
    pdfUrl = null,
    createdAt,
  }) {
    Object.assign(this, {
      id, code, propertyId, roomId, tenantId,
      startDate, endDate, deposit, monthlyRent, services,
      status, pdfUrl, createdAt,
    });
  }

  get statusMeta() {
    return CONTRACT_STATUS_META[this.status];
  }

  get daysToExpire() {
    if (!this.endDate) return null;
    const now = new Date();
    const end = new Date(this.endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }
}
