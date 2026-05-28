import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const toastRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: toastRef });

  // Tự động đóng Toast kèm theo animation slide-out sang phải trước khi unmount
  const handleClose = contextSafe(() => {
    gsap.to(toastRef.current, {
      x: '120%',
      opacity: 0,
      duration: 0.35,
      ease: 'power3.in',
      onComplete: () => {
        onClose?.();
      }
    });
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  // Entrance animation: Trượt nảy từ bên phải vào (spring-back easing)
  useGSAP(() => {
    gsap.fromTo(toastRef.current,
      { x: '120%', opacity: 0 },
      { x: '0%', opacity: 1, duration: 0.45, ease: 'back.out(1.1)' }
    );
  }, { scope: toastRef });

  const icons = {
    success: <CheckCircle2 className="text-success" size={18} />,
    warning: <AlertTriangle className="text-warning" size={18} />,
    danger: <XCircle className="text-danger" size={18} />,
    info: <Info className="text-primary" size={18} />,
  };

  const borders = {
    success: 'bg-emerald-50/90 shadow-lg shadow-emerald-500/10 border-emerald-200/50',
    warning: 'bg-amber-50/90 shadow-lg shadow-amber-500/10 border-amber-200/50',
    danger: 'bg-rose-50/90 shadow-lg shadow-rose-500/10 border-rose-200/50',
    info: 'bg-blue-50/90 shadow-lg shadow-blue-500/10 border-blue-200/50',
  };

  return (
    <div ref={toastRef} className="fixed top-20 right-6 z-[100] max-w-sm w-full" style={{ transform: 'translateX(120%)', opacity: 0 }}>
      <div className={cn(
        "flex items-center gap-3 p-4 rounded-xl border border-line/60 backdrop-blur-md transition-all duration-300 transform hover:scale-[1.02]",
        borders[type]
      )}>
        <div className="shrink-0">{icons[type]}</div>
        <div className="flex-1 text-sm font-semibold text-ink leading-tight">{message}</div>
        <button
          onClick={handleClose}
          className="shrink-0 p-1 rounded-full text-ink-muted hover:bg-gray-100 transition-colors apple-press"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
