"use client";

import { Activity } from "lucide-react";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
import type { ProgressionPayload } from "@/lib/openf1/types";

export function ChampionshipProgressionChart({
  payload,
  subtitle,
}: {
  payload: ProgressionPayload;
  subtitle: string;
}) {
  const baseId = useId().replace(/:/g, "");
  const { chartData, series, meta } = payload;

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Championship progression
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
            <Activity className="size-3 text-emerald-400" aria-hidden />
            Live data
          </span>
          {meta.source === "mock" && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-amber-200/80">
              Preview
            </span>
          )}
        </div>
      </div>

      <div className="h-[340px] w-full min-w-0 sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 8, left: -18, bottom: 8 }}
          >
            <defs>
              {series.map((s, i) => (
                <linearGradient
                  key={s.dataKey}
                  id={`${baseId}-fill-${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={s.color}
                    stopOpacity={0.45}
                  />
                  <stop
                    offset="100%"
                    stopColor={s.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={NEON_GRID} vertical={false} />
            <XAxis
              dataKey="round"
              tick={NEON_AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: NEON_GRID }}
              interval={0}
              tickMargin={10}
            />
            <YAxis
              tick={NEON_AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={36}
              domain={[0, "auto"]}
            />
            <Tooltip
              contentStyle={NEON_TOOLTIP}
              labelStyle={{ color: "#e4e4e7", fontWeight: 600 }}
              formatter={(v) => {
                const n = Number(v ?? 0);
                const body = Number.isFinite(n)
                  ? n % 1 ? n.toFixed(1) : String(n)
                  : String(v ?? "—");
                return [body, "Pts"];
              }}
            />
            {series.map((s, i) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#${baseId}-fill-${i})`}
                fillOpacity={1}
                isAnimationActive={false}
                style={{
                  filter: neonStrokeGlow(s.color, 10),
                }}
              />
            ))}
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  {value}
                </span>
              )}
              iconType="square"
              wrapperStyle={{ paddingTop: 16 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
