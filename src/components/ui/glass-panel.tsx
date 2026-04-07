import * as React from "react";

import { cn } from "@/lib/utils";

/** Apple-style frosted surface (glassmorphism). */
export function GlassPanel({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "data-velocity-ripple relative overflow-hidden rounded-3xl border border-white/[0.14] bg-[rgba(18,18,22,0.5)] shadow-[0_24px_80px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-[32px] backdrop-saturate-150",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_42%)] before:opacity-55 after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.04),transparent_30%)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
