'use client';

import { Calendar, Users2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DriverSeasonTrendChart } from '@/components/championship/driver-season-trend-chart';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { OPENF1_PROXY_PREFIX } from '@/lib/openf1/constants';
import { hexToRgb, resolveTeamColor } from '@/lib/openf1/team-colors';
import { cn } from '@/lib/utils';
import type { ConstructorStandingRow, TeamBreakdownPayload } from '@/lib/openf1/types';

export function TeamDetailModal({
  open,
  onOpenChange,
  team,
  seasonYear,
  sessionKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: ConstructorStandingRow | null;
  seasonYear: number;
  sessionKey: number;
}) {
  const [payload, setPayload] = useState<TeamBreakdownPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!team) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${OPENF1_PROXY_PREFIX}/team-breakdown?year=${seasonYear}&team_name=${encodeURIComponent(team.name)}&session_key=${sessionKey}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(String(res.status));
      setPayload((await res.json()) as TeamBreakdownPayload);
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [team, seasonYear, sessionKey]);

  useEffect(() => {
    if (!open || !team) {
      setPayload(null);
      return;
    }
    void load();
  }, [open, team, load]);

  const d = payload;
  const rounds = d?.rounds ?? [];
  const teamName = d?.teamName ?? team?.name ?? 'Team';
  const shortName = d?.shortName ?? team?.shortName ?? teamName;
  const totalPts = d?.totalPoints ?? team?.points ?? 0;
  const position = d?.championshipPosition ?? team?.position ?? '—';
  const color = resolveTeamColor(teamName, d?.teamColour ?? team?.teamColour);
  const rgb = hexToRgb(color);
  const roundGridClass = useMemo(() => {
    if (rounds.length > 14) return 'grid-cols-2 xl:grid-cols-3';
    if (rounds.length > 8) return 'grid-cols-2';
    return 'grid-cols-1';
  }, [rounds.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[min(96vw,1320px)]! max-w-none! overflow-hidden border border-white/10! bg-[rgba(5,5,8,0.86)]! p-0! text-zinc-100 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-[30px]!"
      >
        <DialogTitle className="sr-only">{teamName} — constructor breakdown</DialogTitle>
        <DialogDescription className="sr-only">Round-by-round constructor points and driver contributions.</DialogDescription>

        <div className="relative grid max-h-[min(90vh,860px)] grid-cols-1 overflow-hidden lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.03),transparent_20%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.02),transparent_22%),radial-gradient(circle_at_18%_78%,rgba(255,0,0,0.04),transparent_16%)]" />

          <aside
            className="relative border-b border-white/8 px-5 py-5 lg:border-r lg:border-b-0 xl:px-6 xl:py-6"
            style={{ boxShadow: `inset -1px 0 0 rgba(255,255,255,0.04), 40px 0 100px rgba(${rgb},0.035)` }}
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-full border text-base font-semibold text-white xl:size-12" style={{ borderColor: `rgba(${rgb},0.5)`, backgroundColor: `rgba(${rgb},0.1)`, boxShadow: `0 0 28px rgba(${rgb},0.2)` }}>
              {position}
            </div>
            <h2 className="text-2xl leading-[0.95] font-semibold tracking-tight xl:text-[2.15rem]" style={{ color }}>
              {shortName}
            </h2>
            <p className="mt-2 max-w-[28ch] text-sm leading-5 text-zinc-400">{teamName}</p>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Driver lineup</p>
              <div className="mt-2.5 space-y-2">
                {(d?.drivers ?? team?.drivers ?? []).map((driver) => (
                  <div key={driver.driverNumber} className="flex items-center justify-between gap-3 rounded-2xl border border-white/7 bg-white/[0.03] px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{driver.driverName}</p>
                      <p className="text-[11px] text-zinc-500">#{driver.driverNumber}</p>
                    </div>
                    <p className="text-base font-semibold tabular-nums" style={{ color }}>
                      {driver.points % 1 === 0 ? driver.points : driver.points.toFixed(1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-300 xl:text-sm">
                <Users2 className="size-4" style={{ color }} /> Season performance
              </div>
              {loading ? <div className="h-24 animate-pulse rounded-2xl bg-white/5" /> : d ? <DriverSeasonTrendChart data={d.trend} color={color} compact /> : null}
            </div>
          </aside>

          <section className="relative flex min-w-0 flex-col px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
            <div className="mb-3 flex items-start justify-between gap-3 pr-14">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-zinc-500" />
                <h3 className="text-xl font-semibold tracking-tight text-white xl:text-2xl">Constructor points breakdown</h3>
              </div>
              <span className="pt-0.5 text-sm font-medium text-zinc-500 xl:text-base">{seasonYear} season</span>
            </div>

            <div className={cn('grid gap-2.5', roundGridClass)}>
              {(loading ? [] : rounds).map((round) => (
                <article key={round.meetingKey} className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <span className="hidden text-4xl leading-none font-bold tracking-tight text-white/[0.06] sm:block">{round.index}</span>
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-semibold tracking-tight text-white xl:text-lg">{round.roundLabel}</h4>
                        <div className="mt-1 space-y-1">
                          {round.contributions.map((contribution) => (
                            <p key={contribution.driverNumber} className="truncate text-[11px] text-zinc-400 xl:text-xs">
                              {contribution.driverName} · {contribution.racePosition ? `P${contribution.racePosition}` : 'No result'} · +{contribution.pointsScored % 1 === 0 ? contribution.pointsScored : contribution.pointsScored.toFixed(1)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="shrink-0 text-lg font-semibold tabular-nums xl:text-xl" style={{ color }}>
                      +{round.pointsScored % 1 === 0 ? round.pointsScored : round.pointsScored.toFixed(1)}
                    </p>
                  </div>
                </article>
              ))}
              {loading && <div className="h-24 animate-pulse rounded-[1.4rem] bg-white/5" />}
            </div>

            <div className="mt-3 border-t border-white/8 pt-3 text-xs text-zinc-500 xl:text-sm">
              Constructor total:{' '}
              <span className="font-semibold" style={{ color }}>
                {totalPts % 1 === 0 ? totalPts : totalPts.toFixed(1)} pts
              </span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
