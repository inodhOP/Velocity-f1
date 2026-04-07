"use client";

import { useId } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
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
import type { OpenF1Lap } from "@/lib/openf1/types";
import { formatLapTime } from "@/lib/format";

type Row = { lap: number; seconds: number; fastest: boolean };

export function LapTimeChart({
  laps,
  isLoading,
}: {
  laps: OpenF1Lap[];
  isLoading?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const filtered = laps.filter(
    (l) =>
      typeof l.lap_duration === "number" &&
      l.lap_duration > 0 &&
      !l.is_pit_out_lap,
  );

  const fastest = filtered.reduce(
    (min, l) =>
      l.lap_duration != null && l.lap_duration < min ? l.lap_duration : min,
    Infinity as number,
  );

  const data: Row[] = filtered.map((l) => ({
    lap: l.lap_number,
    seconds: l.lap_duration as number,
    fastest:
      l.lap_duration != null &&
      Number.isFinite(fastest) &&
      l.lap_duration === fastest,
  }));

  const fastestRow = data.find((d) => d.fastest);

  if (isLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Loading lap trace…
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No lap data for this selection.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`${gid}-lap`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={NEON_GRID} vertical={false} />
          <XAxis
            dataKey="lap"
            tick={NEON_AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: NEON_GRID }}
          />
          <YAxis
            dataKey="seconds"
            domain={["dataMin - 0.15", "dataMax + 0.15"]}
            tickFormatter={(v) => formatLapTime(Number(v))}
            tick={NEON_AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={NEON_TOOLTIP}
            formatter={(value) => [
              formatLapTime(Number(value ?? 0)),
              "Lap time",
            ]}
            labelFormatter={(lap) => `Lap ${lap}`}
          />
          <Area
            type="monotone"
            dataKey="seconds"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill={`url(#${gid}-lap)`}
            isAnimationActive={false}
            style={{ filter: neonStrokeGlow("#22d3ee", 8) }}
          />
          {Number.isFinite(fastest) && (
            <ReferenceLine
              y={fastest}
              stroke="#FF2D2D"
              strokeDasharray="5 6"
              strokeOpacity={0.75}
            />
          )}
          {fastestRow && (
            <ReferenceDot
              x={fastestRow.lap}
              y={fastestRow.seconds}
              r={7}
              fill="#FF2D2D"
              stroke="#0B0B0F"
              strokeWidth={2}
              style={{ filter: neonStrokeGlow("#FF2D2D", 12) }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
