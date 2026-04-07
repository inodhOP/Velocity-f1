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

type Point = { tSec: number; throttle: number; brake: number };

export function ThrottleBrakeChart({
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
        Loading inputs…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No throttle / brake samples.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`${gid}-th`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${gid}-br`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF2D2D" stopOpacity={0.38} />
              <stop offset="100%" stopColor="#FF2D2D" stopOpacity={0} />
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
            domain={[0, 100]}
            tick={NEON_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={NEON_TOOLTIP}
            formatter={(value, name) => [
              `${Number(value ?? 0).toFixed(0)}%`,
              name === "throttle" ? "Throttle" : "Brake",
            ]}
            labelFormatter={(t) => `t = ${t}s`}
          />
          <Area
            type="monotone"
            dataKey="throttle"
            name="throttle"
            stroke="#4ade80"
            strokeWidth={2.5}
            fill={`url(#${gid}-th)`}
            isAnimationActive={false}
            style={{ filter: neonStrokeGlow("#4ade80", 7) }}
          />
          <Area
            type="monotone"
            dataKey="brake"
            name="brake"
            stroke="#FF2D2D"
            strokeWidth={2.5}
            fill={`url(#${gid}-br)`}
            isAnimationActive={false}
            style={{ filter: neonStrokeGlow("#FF2D2D", 8) }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
