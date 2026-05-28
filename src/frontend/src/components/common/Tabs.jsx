import { cn } from '../../utils/cn.js';

export function Tabs({ tabs = [], value, onChange, variant = 'underline' }) {
  if (variant === 'pill') {
    return (
      <div className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
              value === t.value ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cn(
                'ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs',
                value === t.value ? 'bg-primary text-white' : 'bg-gray-200 text-ink'
              )}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-6 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            '-mb-px py-3 text-sm font-medium border-b-2 transition-colors',
            value === t.value
              ? 'text-primary border-primary'
              : 'text-ink-muted border-transparent hover:text-ink'
          )}
        >
          {t.label}
          {t.count != null && (
            <span className="ml-2 text-xs text-ink-muted">({t.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
