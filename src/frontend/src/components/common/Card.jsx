import { cn } from '../../utils/cn.js';

export function Card({ className = '', padded = true, children, ...rest }) {
  return (
    <div className={cn('card', padded && 'p-6', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-title-lg text-ink">{title}</h3>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
