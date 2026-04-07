"use client";

import { GitCompare } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatLapTime } from "@/lib/format";
import type { OpenF1Driver, OpenF1Lap } from "@/lib/openf1/types";

type Stats = {
  bestLap: number | null;
  avgLap: number | null;
  avgSpeed: number | null;
  sectors: [number | null, number | null, number | null];
};

function computeStats(laps: OpenF1Lap[]): Stats {
  const usable = laps.filter(
    (l) =>
      typeof l.lap_duration === "number" &&
      l.lap_duration > 0 &&
      !l.is_pit_out_lap,
  );
  if (!usable.length) {
    return {
      bestLap: null,
      avgLap: null,
      avgSpeed: null,
      sectors: [null, null, null],
    };
  }
  const bestLap = Math.min(...usable.map((l) => l.lap_duration as number));
  const avgLap =
    usable.reduce((s, l) => s + (l.lap_duration as number), 0) / usable.length;

  const speeds = usable
    .map((l) => l.st_speed)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const avgSpeed = speeds.length
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length
    : null;

  const avgSector = (pick: (l: OpenF1Lap) => number | null | undefined) => {
    const vals = usable
      .map(pick)
      .filter((v): v is number => typeof v === "number" && v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  return {
    bestLap,
    avgLap,
    avgSpeed,
    sectors: [
      avgSector((l) => l.duration_sector_1),
      avgSector((l) => l.duration_sector_2),
      avgSector((l) => l.duration_sector_3),
    ],
  };
}

function DriverColumn({
  label,
  driver,
  stats,
}: {
  label: string;
  driver: OpenF1Driver | null;
  stats: Stats;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </div>
        {driver ? (
          <>
            <div className="mt-1 font-medium text-white">{driver.full_name}</div>
            <div className="text-xs text-zinc-500">{driver.team_name}</div>
          </>
        ) : (
          <div className="text-sm text-zinc-500">—</div>
        )}
      </div>
      <Separator className="bg-white/10" />
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Best lap</dt>
          <dd className="tabular-nums text-zinc-100">
            {formatLapTime(stats.bestLap)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Average lap</dt>
          <dd className="tabular-nums text-zinc-100">
            {formatLapTime(stats.avgLap)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Avg trap speed</dt>
          <dd className="tabular-nums text-zinc-100">
            {stats.avgSpeed != null ? `${stats.avgSpeed.toFixed(0)} km/h` : "—"}
          </dd>
        </div>
        <div className="pt-1">
          <div className="mb-1 text-xs text-zinc-500">Sector averages (s)</div>
          <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
            <div className="rounded-md bg-white/[0.04] px-2 py-1.5 text-center">
              <div className="text-[10px] text-zinc-500">S1</div>
              <div className="text-zinc-100">
                {stats.sectors[0] != null ? stats.sectors[0].toFixed(3) : "—"}
              </div>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1.5 text-center">
              <div className="text-[10px] text-zinc-500">S2</div>
              <div className="text-zinc-100">
                {stats.sectors[1] != null ? stats.sectors[1].toFixed(3) : "—"}
              </div>
            </div>
            <div className="rounded-md bg-white/[0.04] px-2 py-1.5 text-center">
              <div className="text-[10px] text-zinc-500">S3</div>
              <div className="text-zinc-100">
                {stats.sectors[2] != null ? stats.sectors[2].toFixed(3) : "—"}
              </div>
            </div>
          </div>
        </div>
      </dl>
    </div>
  );
}

export function DriverComparisonPanel({
  driverA,
  driverB,
  lapsA,
  lapsB,
  isLoading,
}: {
  driverA: OpenF1Driver | null;
  driverB: OpenF1Driver | null;
  lapsA: OpenF1Lap[];
  lapsB: OpenF1Lap[];
  isLoading?: boolean;
}) {
  const statsA = computeStats(lapsA);
  const statsB = computeStats(lapsB);

  return (
    <Card className="border-white/[0.06] bg-card/80 ring-white/[0.06] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <GitCompare className="size-4 text-primary" />
          <CardTitle className="text-base">Driver comparison</CardTitle>
        </div>
        <CardDescription>
          Lap deltas, rolling sector balance, and speed-trap tendencies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Comparing telemetry…
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <DriverColumn label="Driver A" driver={driverA} stats={statsA} />
            <DriverColumn label="Driver B" driver={driverB} stats={statsB} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
