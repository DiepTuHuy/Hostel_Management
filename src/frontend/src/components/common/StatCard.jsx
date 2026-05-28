import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Card } from './Card.jsx';

export function StatCard({ label, value, delta, icon: Icon, accent = 'primary', extra, onClick, tilt = false }) {
  const accentBg = {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-rose-50 text-danger',
    info: 'bg-blue-50 text-blue-600',
  }[accent] || 'bg-primary-soft text-primary';

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
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">{label}</span>
          <span className="text-title-xl text-ink font-bold leading-tight">{value}</span>
        </div>
        <div className={cn("p-3 rounded-2xl shadow-sm", accentBg)}>
          {Icon && <Icon size={22} strokeWidth={2.2} />}
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-line/60 pt-3 mt-1">
        {delta != null && (
          <span className={cn("flex items-center gap-0.5 text-xs font-bold", positive ? 'text-success' : 'text-danger')}>
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {positive ? '+' : ''}{delta}%
          </span>
        )}
        {extra && <div className="mt-2">{extra}</div>}
      </div>
    </Card>
  );
}
