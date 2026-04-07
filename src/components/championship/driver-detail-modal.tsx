'use client';

import { Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DriverSeasonTrendChart } from '@/components/championship/driver-season-trend-chart';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { OPENF1_PROXY_PREFIX } from '@/lib/openf1/constants';
import { hexToRgb, resolveTeamColor } from '@/lib/openf1/team-colors';
import { getTeamIdentity } from '@/lib/openf1/team-meta';
import { cn } from '@/lib/utils';
import type { DriverBreakdownPayload, DriverStandingRow } from '@/lib/openf1/types';

export function DriverDetailModal({
  open,
  onOpenChange,
  driver,
  seasonYear,
  sessionKey,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: DriverStandingRow | null;
  seasonYear: number;
  sessionKey: number;
}) {
  const [payload, setPayload] = useState<DriverBreakdownPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!driver) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${OPENF1_PROXY_PREFIX}/driver-breakdown?year=${seasonYear}&driver_number=${driver.driverNumber}&session_key=${sessionKey}`,
        { cache: 'no-store' },
      );
      if (!res.ok) throw new Error(String(res.status));
      setPayload((await res.json()) as DriverBreakdownPayload);
    } catch {
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [driver, seasonYear, sessionKey]);

  useEffect(() => {
    if (!open || !driver) {
      setPayload(null);
      return;
    }
    void load();
  }, [open, driver, load]);

  const d = payload;
  const rounds = d?.rounds ?? [];
  const showName = d?.driverName ?? driver?.driverName ?? 'Driver';
  const showTeam = d?.teamName ?? driver?.team ?? '—';
  const showTeamShort = getTeamIdentity(showTeam).shortName;
  const position = d?.championshipPosition ?? driver?.position ?? '—';
  const totalPts = d?.totalPoints ?? driver?.points ?? 0;
  const teamColor = resolveTeamColor(showTeam, driver?.teamColour);
  const teamRgb = hexToRgb(teamColor);
  const roundGridClass = useMemo(() => {
    if (rounds.length > 16) return 'grid-cols-2 xl:grid-cols-3';
    if (rounds.length > 8) return 'grid-cols-2';
    return 'grid-cols-1';
  }, [rounds.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[min(96vw,1320px)]! max-w-none! overflow-hidden border border-white/10! bg-[rgba(4,4,8,0.86)]! p-0! text-zinc-100 shadow-[0_30px_100px_rgba(0,0,0,0.78)] ring-white/10! backdrop-blur-[30px]!"
      >
        <DialogTitle className="sr-only">{showName} — points breakdown</DialogTitle>
        <DialogDescription className="sr-only">Season points by round and cumulative trend.</DialogDescription>

        <div className="relative grid max-h-[min(90vh,860px)] grid-cols-1 overflow-hidden lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(255,255,255,0.03),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.03),transparent_18%),radial-gradient(circle_at_20%_84%,rgba(255,0,0,0.06),transparent_16%)]" />

          <aside
            className="relative border-b border-white/8 px-5 py-5 lg:border-r lg:border-b-0 xl:px-6 xl:py-6"
            style={{ boxShadow: `inset -1px 0 0 rgba(255,255,255,0.05), 40px 0 120px rgba(${teamRgb},0.04)` }}
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-full border text-base font-semibold text-white xl:size-12" style={{ borderColor: `rgba(${teamRgb},0.55)`, backgroundColor: `rgba(${teamRgb},0.12)`, boxShadow: `0 0 26px rgba(${teamRgb},0.2)` }}>
              {position}
            </div>
            <h2 className="max-w-[12ch] text-2xl leading-[0.95] font-semibold tracking-tight xl:text-[2.25rem]" style={{ color: teamColor }}>
              {showName}
            </h2>
            <p className="mt-2 text-sm text-zinc-400 xl:text-base">{showTeamShort}</p>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Number</p>
                <p className="mt-1.5 text-[1.8rem] leading-none font-semibold tracking-tight text-white">#{driver?.driverNumber ?? '—'}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Nationality</p>
                <p className="mt-1.5 text-[1.8rem] leading-none font-semibold tracking-tight text-white">{loading ? '…' : d?.countryCode ?? '—'}</p>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-300 xl:text-sm">
                <TrendingUp className="size-4" style={{ color: teamColor }} />
                Season performance
              </div>
              {loading ? <div className="h-24 animate-pulse rounded-2xl bg-white/5" /> : d ? <DriverSeasonTrendChart data={d.trend} color={teamColor} compact /> : null}
            </div>

            <Link href="/dashboard" className="mt-4 inline-flex text-xs font-medium text-zinc-500 underline decoration-white/15 underline-offset-4 hover:text-zinc-300 xl:text-sm" onClick={() => onOpenChange(false)}>
              Open telemetry lab →
            </Link>
          </aside>

          <section className="relative flex min-w-0 flex-col px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
            <div className="mb-3 flex items-start justify-between gap-3 pr-14">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-zinc-500" />
                <h3 className="text-xl font-semibold tracking-tight text-white xl:text-2xl">Points breakdown</h3>
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
                        <p className="mt-0.5 text-xs text-zinc-400 xl:text-sm">{round.racePosition ? `Position: ${round.racePosition}` : 'No classified finish'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-lg font-semibold tabular-nums xl:text-xl" style={{ color: teamColor }}>
                      +{round.pointsScored % 1 === 0 ? round.pointsScored : round.pointsScored.toFixed(1)}
                    </span>
                  </div>
                </article>
              ))}
              {loading && <div className="h-24 animate-pulse rounded-[1.4rem] bg-white/5" />}
            </div>

            <div className="mt-3 border-t border-white/8 pt-3 text-xs text-zinc-500 xl:text-sm">
              Championship total:{' '}
              <span className="font-semibold" style={{ color: teamColor }}>
                {totalPts % 1 === 0 ? totalPts : totalPts.toFixed(1)} pts
              </span>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
