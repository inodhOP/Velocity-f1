"use client";

import { Check, Filter } from "lucide-react";
import { Activity } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  neonStrokeGlow,
} from "@/components/charts/chart-neon";
import type { ProgressionPayload } from "@/lib/openf1/types";

type TooltipItem = {
  name: string;
  value: number;
  color?: string;
};

const DRS_HOVER_MS = 2000;
const DRS_COOLDOWN_MS = 12000;

function ProgressionTooltip({
  active,
  label,
  payload,
  fullSeriesTooltip,
  chartPayload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{
    name?: unknown;
    value?: unknown;
    color?: string;
  }>;
  fullSeriesTooltip?: boolean;
  chartPayload?: ProgressionPayload;
}) {
  if (!active || label == null) return null;

  let rows: TooltipItem[];
  if (fullSeriesTooltip && chartPayload) {
    const row = chartPayload.chartData.find((r) => String(r.round) === String(label));
    if (!row) return null;
    rows = chartPayload.series
      .map((s) => ({
        name: s.label,
        value: Number(row[s.dataKey] ?? 0),
        color: s.color,
      }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  } else {
    if (!payload?.length) return null;
    rows = [...payload]
      .map((entry) => ({
        name: String(entry.name ?? ""),
        value: Number(entry.value ?? 0),
        color: entry.color,
      }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  }

  return (
    <div className="w-[min(86vw,260px)] rounded-2xl border border-white/12 bg-[rgba(15,15,18,0.92)] p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
      <div className="mb-2 text-xs font-semibold text-zinc-200">{String(label)}</div>
      <div className="velocity-scrollbar max-h-44 space-y-1 overflow-y-auto pr-1">
        {rows.map((row: TooltipItem) => (
          <div
            key={row.name}
            className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 text-[11px]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-zinc-300">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: row.color ?? "#a1a1aa" }}
              />
              <span className="truncate">{row.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-zinc-100">
              {row.value % 1 ? row.value.toFixed(1) : row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChampionshipProgressionChart({
  payload,
  subtitle,
  title = "Championship progression",
  itemLabel = "drivers",
  tooltipFullSeries = false,
  drsBoostDataKey = null,
}: {
  payload: ProgressionPayload;
  subtitle: string;
  title?: string;
  itemLabel?: string;
  tooltipFullSeries?: boolean;
  /** When set (e.g. P1 driver line), DRS easter egg can briefly emphasize this series. */
  drsBoostDataKey?: string | null;
}) {
  const baseId = useId().replace(/:/g, "");
  const { chartData, series, meta } = payload;
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredSeriesKey, setHoveredSeriesKey] = useState<string | null>(null);
  const [drsVisible, setDrsVisible] = useState(false);
  const filterWrapRef = useRef<HTMLDivElement>(null);
  const chartHoverRef = useRef(false);
  const drsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDrsAtRef = useRef(0);
  const hiddenSet = useMemo(() => new Set(hiddenKeys), [hiddenKeys]);
  const visibleSeries = useMemo(
    () => series.filter((s) => !hiddenSet.has(s.dataKey)),
    [series, hiddenSet],
  );

  const toggleSeries = (dataKey: string) => {
    setHiddenKeys((prev) =>
      prev.includes(dataKey)
        ? prev.filter((k) => k !== dataKey)
        : [...prev, dataKey],
    );
  };

  const clearDrsTimer = () => {
    if (drsTimerRef.current) {
      clearTimeout(drsTimerRef.current);
      drsTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearDrsTimer();
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (filterWrapRef.current && !filterWrapRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [filterOpen]);

  const handleChartEnter = () => {
    chartHoverRef.current = true;
    if (!drsBoostDataKey) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    if (Date.now() - lastDrsAtRef.current < DRS_COOLDOWN_MS) return;
    clearDrsTimer();
    drsTimerRef.current = setTimeout(() => {
      if (!chartHoverRef.current) return;
      lastDrsAtRef.current = Date.now();
      setDrsVisible(true);
      window.setTimeout(() => setDrsVisible(false), 1180);
    }, DRS_HOVER_MS);
  };

  const handleChartLeave = () => {
    chartHoverRef.current = false;
    clearDrsTimer();
    setDrsVisible(false);
  };

  const drsBoostActive = Boolean(drsVisible && drsBoostDataKey);

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
            <Activity className="size-3 text-emerald-400" aria-hidden />
            Live data
          </span>
          <div ref={filterWrapRef} className="relative">
            <button
              type="button"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-md transition-colors hover:bg-white/[0.1]"
            >
              <Filter className="size-3.5" />
              {visibleSeries.length}/{series.length} {itemLabel}
            </button>
            {filterOpen ? (
              <div
                className="velocity-scrollbar absolute right-0 z-50 mt-2 max-h-64 min-h-0 min-w-[220px] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[rgba(12,12,18,0.95)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.62)] backdrop-blur-2xl"
                style={{ touchAction: "pan-y" }}
              >
                {series.map((s) => {
                  const active = !hiddenSet.has(s.dataKey);
                  return (
                    <button
                      key={s.dataKey}
                      type="button"
                      onClick={() => toggleSeries(s.dataKey)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs text-zinc-300 transition-colors hover:bg-white/[0.08]"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="truncate">{s.label}</span>
                      </span>
                      <span className="shrink-0">
                        {active ? <Check className="size-3.5 text-emerald-400" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          {meta.source === "mock" && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-amber-200/80">
              Preview
            </span>
          )}
        </div>
      </div>

      <div
        className="relative h-[340px] w-full min-w-0 sm:h-[380px]"
        onMouseEnter={handleChartEnter}
        onMouseLeave={handleChartLeave}
      >
        {drsVisible && drsBoostDataKey ? (
          <div
            className="velocity-drs-badge pointer-events-none absolute bottom-3 right-3 z-20 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200/95 shadow-[0_0_24px_rgba(16,185,129,0.2)] backdrop-blur-md"
            role="status"
          >
            DRS active
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 8, left: -18, bottom: 8 }}
            onMouseLeave={() => setHoveredSeriesKey(null)}
          >
            <defs>
              {visibleSeries.map((s, i) => (
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
              content={({ active, label, payload: tipPayload }) => (
                <ProgressionTooltip
                  active={active}
                  label={label}
                  payload={tipPayload}
                  fullSeriesTooltip={tooltipFullSeries}
                  chartPayload={payload}
                />
              )}
            />
            {visibleSeries.map((s, i) => {
              const dimmed =
                hoveredSeriesKey != null && hoveredSeriesKey !== s.dataKey;
              const highlighted = hoveredSeriesKey === s.dataKey;
              const drsLine = drsBoostActive && drsBoostDataKey === s.dataKey;
              return (
                <Area
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.label}
                  stroke={s.color}
                  strokeWidth={
                    drsLine ? 3.8 : highlighted ? 3.2 : 2.5
                  }
                  strokeOpacity={dimmed ? 0.22 : 1}
                  fill={`url(#${baseId}-fill-${i})`}
                  fillOpacity={
                    dimmed
                      ? 0.06
                      : Math.max(0.18, 0.42 - visibleSeries.length * 0.012)
                  }
                  isAnimationActive
                  animationDuration={720}
                  animationBegin={i * 52}
                  onMouseEnter={() => setHoveredSeriesKey(s.dataKey)}
                  style={{
                    transition:
                      "stroke-opacity 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease",
                    filter: neonStrokeGlow(
                      s.color,
                      drsLine ? 20 : highlighted ? 16 : 10,
                    ),
                  }}
                />
              );
            })}
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                  {value}
                </span>
              )}
              iconType="circle"
              wrapperStyle={{ paddingTop: 16 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
