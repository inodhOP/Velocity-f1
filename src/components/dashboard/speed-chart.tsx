"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  NEON_AXIS_TICK,
  NEON_GRID,
  NEON_TOOLTIP,
  neonStrokeGlow,
} from "@/components/charts/chart-neon";

type Point = { tSec: number; speed: number };

export function SpeedChart({
  data,
  isLoading,
}: {
  data: Point[];
  isLoading?: boolean;
}) {
  const gid = useId().replace(/:/g, "");

  if (isLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Loading speed trace…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No telemetry samples for this stint.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`${gid}-spd`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={NEON_GRID} vertical={false} />
          <XAxis
            dataKey="tSec"
            tick={NEON_AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: NEON_GRID }}
          />
          <YAxis
            dataKey="speed"
            tick={NEON_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, "auto"]}
          />
          <Tooltip
            contentStyle={NEON_TOOLTIP}
            formatter={(v) => [`${v ?? "—"} km/h`, "Speed"]}
            labelFormatter={(t) => `t = ${t}s`}
          />
          <Area
            type="monotone"
            dataKey="speed"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill={`url(#${gid}-spd)`}
            isAnimationActive={false}
            style={{ filter: neonStrokeGlow("#22d3ee", 9) }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
