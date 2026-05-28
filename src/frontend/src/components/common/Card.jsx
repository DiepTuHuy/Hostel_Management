import { useRef } from 'react';
import { cn } from '../../utils/cn.js';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export function Card({ className = '', padded = true, children, tilt = false, ...rest }) {
  const cardRef = useRef(null);

  useGSAP(() => {
    if (!tilt || !cardRef.current) return;

    const card = cardRef.current;

    const onMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Tọa độ chuột so với trung tâm của card
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      // Chuẩn hóa tọa độ từ -0.5 đến 0.5
      const normX = mouseX / width;
      const normY = mouseY / height;

      // Góc nghiêng tối đa (độ)
      const maxRotX = 8; // Xoay quanh trục X (dựa trên Y chuột)
      const maxRotY = 8; // Xoay quanh trục Y (dựa trên X chuột)

      gsap.to(card, {
        rotateX: -normY * maxRotX,
        rotateY: normX * maxRotY,
        scale: 1.03,
        transformPerspective: 1000,
        ease: 'power1.out',
        duration: 0.08,
        overwrite: 'auto',
        boxShadow: `
          ${-normX * 20}px ${-normY * 20}px 35px rgba(0, 0, 0, 0.12),
          0 12px 24px rgba(0, 0, 0, 0.06),
          0 1px 4px rgba(0, 0, 0, 0.03)
        `
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: '', // Reset về mặc định css
        ease: 'power2.out',
        duration: 0.4,
        overwrite: 'auto'
      });
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [tilt]);

  if (!tilt) {
    return (
      <div
        className={cn('card', padded && 'p-6', className)}
        {...rest}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow',
        transition: 'none',
        width: '100%',
        height: '100%',
        ...rest.style
      }}
      {...rest}
    >
      <div 
        className={cn('card', padded && 'p-6', className)}
        style={{ 
          transform: 'translateZ(15px)', 
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
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
