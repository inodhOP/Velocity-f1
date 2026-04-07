'use client';

import { useRef } from 'react';

import { cn } from '@/lib/utils';

export function VelocityTitle({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = innerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const x = (e.clientX - r.left) / r.width;
    const originX = Math.min(100, Math.max(0, x * 100));
    el.style.transformOrigin = `${originX}% 50%`;
    el.style.transform = 'scaleX(1.04)';
  };

  const onLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transformOrigin = '50% 50%';
    el.style.transform = 'scaleX(1)';
  };

  return (
    <span
      className={cn('relative inline-block', className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span
        ref={innerRef}
        className="relative z-[1] will-change-transform transition-transform duration-150 ease-out"
      >
        {children}
      </span>
    </span>
  );
}

