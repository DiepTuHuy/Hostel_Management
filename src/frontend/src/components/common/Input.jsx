import { cn } from '../../utils/cn.js';

export function Input({ label, helper, error, prefix, suffix, className = '', ...rest }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{prefix}</span>}
        <input
          className={cn('input', prefix && 'pl-10', suffix && 'pr-10', error && 'border-danger focus:border-danger focus:ring-danger/20')}
          {...rest}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">{suffix}</span>}
      </div>
      {error ? <p className="error-text">{error}</p> : helper ? <p className="helper">{helper}</p> : null}
    </div>
  );
}
