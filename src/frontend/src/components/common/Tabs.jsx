import { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn.js';

export function Tabs({ tabs = [], value, onChange, variant = 'underline' }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0
  });

  useEffect(() => {
    const updateIndicator = () => {
      if (!containerRef.current) return;
      const activeEl = containerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    // Schedule a small delay to handle layout changes or loading
    const timer = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [value, tabs]);

  if (variant === 'pill') {
    return (
      <div ref={containerRef} className="inline-flex gap-1 p-1 bg-gray-100 rounded-lg relative">
        <div
          className="absolute bg-white rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0 shadow-sm"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height: 'calc(100% - 8px)',
            top: '4px',
            opacity: indicatorStyle.opacity,
          }}
        />
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            data-active={value === t.value ? "true" : "false"}
            className={cn(
              'px-4 py-1.5 text-sm font-semibold rounded-md transition-colors relative z-10 apple-press',
              value === t.value ? 'text-ink' : 'text-ink-muted hover:text-ink'
            )}
          >
            {t.label}
            {t.count != null && (
              <span className={cn(
                'ml-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs transition-colors',
                value === t.value ? 'bg-primary text-white font-normal' : 'bg-gray-200 text-ink'
              )}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex gap-6 border-b border-line relative">
      <div
        className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-0"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          data-active={value === t.value ? "true" : "false"}
          className={cn(
            '-mb-px py-3 text-sm font-semibold transition-colors relative z-10 apple-press flex items-center gap-1.5',
            value === t.value
              ? 'text-primary'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <span>{t.label}</span>
          {t.count != null && (
            <span className={cn(
              'text-xs transition-colors',
              value === t.value ? 'text-primary font-bold' : 'text-ink-muted'
            )}>
              ({t.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
