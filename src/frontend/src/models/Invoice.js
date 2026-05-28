/**
 * Invoice Model — hoá đơn cuối tháng
 */
export const INVOICE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PENDING_CASH: 'pending_cash',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const INVOICE_STATUS_META = {
  draft:        { label: 'Bản nháp',          color: 'neutral' },
  pending:      { label: 'Đang chờ',          color: 'info'    },
  pending_cash: { label: 'Chờ xác nhận tiền mặt', color: 'warning' },
  paid:         { label: 'Đã thanh toán',     color: 'success' },
  overdue:      { label: 'Quá hạn',           color: 'danger'  },
};

export class Invoice {
  constructor({
    id,
    code,
    contractId,
    propertyId,
    roomId,
    tenantId,
    period, // 'YYYY-MM'
    dueDate,
    deadline, // DB alias
    items = [], // [{name, qty, unitPrice, total}]
    details = [], // DB alias
    subtotal = 0,
    total = 0,
    totalAmount, // DB alias
    status = INVOICE_STATUS.PENDING,
    paidAt = null,
    paymentMethod = null,
    receiptUrl = null,
    meterReadings = null,
  }) {
    // Map DB fields to frontend fields
    const resolvedTotal = total || totalAmount || 0;
    const resolvedDueDate = dueDate || deadline;
    
    // Map DB details array to frontend items array
    let resolvedItems = items;
    if ((!items || items.length === 0) && details && details.length > 0) {
      resolvedItems = details.map(d => ({
        name: d.name,
        qty: d.quantity || 1,
        unit: d.unit || 'phần',
        price: d.price,
        total: d.amount || d.total || (d.price * (d.quantity || 1))
      }));
    }

    Object.assign(this, {
      id, code, contractId, propertyId, roomId, tenantId,
      period, 
      dueDate: resolvedDueDate, 
      items: resolvedItems, 
      subtotal: subtotal || resolvedTotal, 
      total: resolvedTotal, 
      status,
      paidAt, paymentMethod, receiptUrl, meterReadings,
    });
  }

  get statusMeta() {
    return INVOICE_STATUS_META[this.status];
  }

  get daysOverdue() {
    if (this.status !== INVOICE_STATUS.OVERDUE) return 0;
    const now = new Date();
    const due = new Date(this.dueDate);
    return Math.max(0, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
  }

  get daysToDue() {
    const now = new Date();
    const due = new Date(this.dueDate);
    return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  }
}
