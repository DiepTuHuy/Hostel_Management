import { cn } from '../../utils/cn.js';

const colorMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
  primary: 'badge-primary',
};

export function Badge({ color = 'neutral', className = '', children, ...rest }) {
  return (
    <span className={cn('badge', colorMap[color] || 'badge-neutral', className)} {...rest}>
      {children}
    </span>
  );
}
