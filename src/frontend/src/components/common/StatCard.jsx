import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Card } from './Card.jsx';

export function StatCard({ label, value, delta, icon: Icon, accent = 'primary', extra, onClick, tilt = false }) {
  const accentBg = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
    info: 'bg-sky-50 text-info',
  }[accent];

  const positive = delta != null && delta >= 0;

  return (
    <Card
      onClick={onClick}
      tilt={tilt}
      className={cn(
        "flex flex-col gap-4",
        onClick && "cursor-pointer active:scale-[0.98] transition-transform duration-200"
      )}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
        {Icon && <span className={cn('p-2 rounded-lg', accentBg)}><Icon size={18} /></span>}
      </div>
      <div>
        <div className="text-display-lg text-ink leading-none">{value}</div>
        {delta != null && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs', positive ? 'text-success' : 'text-danger')}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{positive ? '+' : ''}{delta}% so với tháng trước</span>
          </div>
        )}
        {extra && <div className="mt-2">{extra}</div>}
      </div>
    </Card>
  );
}
