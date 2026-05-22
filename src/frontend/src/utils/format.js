/**
 * Helpers định dạng tiền tệ, ngày, số.
 */
export const formatCurrency = (value, opts = {}) => {
  const { withSymbol = true, compact = false } = opts;
  if (value == null || isNaN(value)) return '—';

  if (compact && Math.abs(value) >= 1_000_000) {
    const m = (value / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return withSymbol ? `${m}M ₫` : `${m}M`;
  }
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.round(value));
  return withSymbol ? `${formatted} ₫` : formatted;
};

export const formatDate = (input, opts = {}) => {
  if (!input) return '—';
  const date = new Date(input);
  const { withTime = false } = opts;
  const opts2 = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  return new Intl.DateTimeFormat('vi-VN', opts2).format(date);
};

export const formatPeriod = (period) => {
  if (!period) return '—';
  const [y, m] = period.split('-');
  return `Tháng ${parseInt(m, 10)}/${y}`;
};

export const formatRelative = (input) => {
  if (!input) return '—';
  const date = new Date(input);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 30) return `${days} ngày trước`;
  return formatDate(input);
};

export const truncate = (str, n = 40) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
};
