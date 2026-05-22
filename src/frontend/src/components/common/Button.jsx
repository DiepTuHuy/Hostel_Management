import { cn } from '../../utils/cn.js';

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon = null,
  className = '',
  children,
  ...rest
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    link: 'text-primary hover:underline bg-transparent',
  }[variant];

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size];

  return (
    <button
      className={cn('btn', sizeClass, variantClass, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-r-transparent rounded-full" /> : icon}
      {children}
    </button>
  );
}
