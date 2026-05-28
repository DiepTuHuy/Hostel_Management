import { cn } from '../../utils/cn.js';

export function Avatar({ name = '?', src, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .slice(-2)
    .join('')
    .toUpperCase();
  if (src) {
    return <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />;
  }
  return (
    <div
      className={cn(
        'rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center',
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
