import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const [shouldRender, setShouldRender] = useState(open);
  const backdropRef = useRef(null);
  const containerRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: backdropRef });

  // Đồng bộ open prop với shouldRender state
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    }
  }, [open]);

  // Đóng modal với hiệu ứng exit transition
  const handleClose = contextSafe((callback) => {
    const tl = gsap.timeline({
      onComplete: () => {
        setShouldRender(false);
        callback?.();
      }
    });

    // Mờ dần backdrop
    tl.to(backdropRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut'
    }, 0);

    // Thu nhỏ và trượt nhẹ xuống dưới đối với container
    tl.to(containerRef.current, {
      scale: 0.95,
      y: 20,
      opacity: 0,
      duration: 0.25,
      ease: 'power3.in'
    }, 0);
  });

  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) {
        handleClose(onClose);
      }
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, handleClose]);

  // Thực hiện animation mở/đóng bằng useGSAP
  useGSAP(() => {
    if (open && shouldRender) {
      // Đặt giá trị ban đầu trước khi chạy animation
      gsap.set(backdropRef.current, { opacity: 0 });
      gsap.set(containerRef.current, { scale: 0.95, y: 20, opacity: 0 });

      // Animate backdrop mờ dần vào
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out'
      });

      // Animate container xuất hiện theo chuẩn Apple (expo easing mượt mà)
      gsap.to(containerRef.current, {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power4.out'
      });
    } else if (!open && shouldRender) {
      // Trường hợp open chuyển từ true -> false từ component cha
      handleClose(onClose);
    }
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => handleClose(onClose)}
      style={{ opacity: 0 }}
    >
      <div
        ref={containerRef}
        className={`bg-white rounded-modal shadow-modal w-full ${widths[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
        style={{ transform: 'scale(0.95) translateY(20px)', opacity: 0 }}
      >
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h3 className="text-title-lg text-ink">{title}</h3>
          <button onClick={() => handleClose(onClose)} className="p-1 rounded-md hover:bg-gray-100 text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && <div className="p-5 border-t border-line bg-gray-50 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
