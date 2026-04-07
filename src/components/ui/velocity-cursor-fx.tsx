"use client";

import { useEffect, useRef, useState } from "react";

const SPEED_THRESHOLD = 1.65;

export function VelocityCursorFx() {
  const [ambient, setAmbient] = useState({ x: 0, y: 0 });
  const [streak, setStreak] = useState<{
    id: number;
    x: number;
    y: number;
    angle: number;
  } | null>(null);
  const lastRef = useRef({ x: 0, y: 0, t: 0 });
  const rafAmbient = useRef(0);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;
    queueMicrotask(() => {
      setEnabled(true);
    });

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      const px = e.clientX;
      const py = e.clientY;
      const dx = px - lastRef.current.x;
      const dy = py - lastRef.current.y;
      const dt = Math.max(now - lastRef.current.t, 1);
      const speed = Math.hypot(dx, dy) / dt;
      if (speed > SPEED_THRESHOLD && Math.hypot(dx, dy) > 10) {
        const id = now;
        const angle = Math.atan2(dy, dx);
        setStreak({ id, x: px, y: py, angle });
        window.setTimeout(() => {
          setStreak((s) => (s?.id === id ? null : s));
        }, 180);
      }
      lastRef.current = { x: px, y: py, t: now };
      if (rafAmbient.current) cancelAnimationFrame(rafAmbient.current);
      rafAmbient.current = requestAnimationFrame(() => {
        setAmbient({ x: px, y: py });
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafAmbient.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-[8] mix-blend-soft-light"
        style={{
          background: `radial-gradient(480px circle at ${ambient.x}px ${ambient.y}px, rgba(255,255,255,0.04), transparent 58%)`,
        }}
        aria-hidden
      />
      {streak ? (
        <div
          key={streak.id}
          className="velocity-speed-streak pointer-events-none fixed z-[9] h-[2px] w-20 origin-left"
          style={{
            left: streak.x,
            top: streak.y,
            transform: `translate(-2px, -1px) rotate(${streak.angle}rad)`,
            background: "linear-gradient(90deg, rgba(255,45,45,0.5), transparent)",
            boxShadow: "0 0 14px rgba(255,45,45,0.22)",
          }}
          aria-hidden
        />
      ) : null}
    </>
  );
}
