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
  }, [duration]);

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
    error: <XCircle className="text-danger" size={18} />,
    info: <Info className="text-info" size={18} />,
  };

  const borders = {
    success: 'border-green-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-l-4 border-l-success',
    warning: 'border-amber-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-l-4 border-l-warning',
    error: 'border-red-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-l-4 border-l-danger',
    info: 'border-blue-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-l-4 border-l-info',
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
