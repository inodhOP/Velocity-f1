"use client";

import { type ReactNode, useEffect } from "react";

/**
 * Delegated glass-style ripple on pointerdown for elements with [data-velocity-ripple].
 */
export function GlassRippleProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const host = target.closest("[data-velocity-ripple]");
      if (!host || !(host instanceof HTMLElement)) return;
      const rect = host.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement("span");
      ripple.className = "velocity-glass-ripple-el";
      ripple.style.setProperty("--rx", `${x}px`);
      ripple.style.setProperty("--ry", `${y}px`);
      const overflowBefore = getComputedStyle(host).overflow;
      if (overflowBefore === "visible") host.style.overflow = "hidden";
      host.appendChild(ripple);
      requestAnimationFrame(() => ripple.classList.add("velocity-glass-ripple-el--active"));
      window.setTimeout(() => {
        ripple.remove();
        if (overflowBefore === "visible") host.style.removeProperty("overflow");
      }, 300);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  return <>{children}</>;
}
