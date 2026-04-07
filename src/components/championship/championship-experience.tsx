'use client';

import {
  BarChart3,
  Calendar as CalendarIcon,
  CalendarDays,
  ChevronRight,
  MapPin,
  Users,
  Users2,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { DriverDetailModal } from '@/components/championship/driver-detail-modal';
import { ChampionshipProgressionChart } from '@/components/championship/championship-progression-chart';
import { RaceDetailModal } from '@/components/championship/race-detail-modal';
import { RefreshStandingsButton } from '@/components/championship/refresh-standings';
import { TeamDetailModal } from '@/components/championship/team-detail-modal';
import { VelocityTitle } from '@/components/fx/velocity-title';
import { GlassPanel } from '@/components/ui/glass-panel';
import { cn } from '@/lib/utils';
import { getSessionVibe } from '@/lib/openf1/session-vibe';
import { hexToRgb, resolveTeamColor } from '@/lib/openf1/team-colors';
import { getTeamIdentity } from '@/lib/openf1/team-meta';
import type {
  CalendarRace,
  ChampionshipPayload,
  ConstructorStandingRow,
  DriverStandingRow,
  ProgressionPayload,
  SeasonCalendarPayload,
} from '@/lib/openf1/types';

type TabId = 'drivers' | 'teams' | 'analytics' | 'calendar';

const TABS: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'teams', label: 'Teams', icon: Users2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
];

function DriverCard({
  row,
  seasonYear,
  onSelect,
}: {
  row: DriverStandingRow;
  seasonYear: number;
  onSelect: (row: DriverStandingRow) => void;
}) {
  const color = resolveTeamColor(row.team, row.teamColour, seasonYear);
  const rgb = hexToRgb(color);
  const teamIdentity = getTeamIdentity(row.team, seasonYear);
  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      data-velocity-ripple
      className="velocity-panel-pattern group relative block w-full cursor-pointer overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(16,16,20,0.58)] p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08),0_0_80px_rgba(var(--team-rgb),0.08)] backdrop-blur-[26px] transition-[transform,box-shadow,border-color] duration-200 ease-out outline-none will-change-transform hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_28px_72px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.1),0_0_88px_rgba(var(--team-rgb),0.14)] hover:ring-1 hover:ring-white/12 focus-visible:ring-2"
      style={{ ['--team-rgb' as string]: rgb }}
    >
      <span className="pointer-events-none absolute -left-1 -top-2 select-none text-7xl font-bold tracking-tighter text-white/[0.05] sm:text-8xl" aria-hidden>
        #{row.driverNumber}
      </span>
      <div
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border text-sm font-semibold tabular-nums text-white"
        style={{ borderColor: `rgba(${rgb},0.35)`, backgroundColor: `rgba(${rgb},0.12)`, boxShadow: `0 0 26px rgba(${rgb},0.28)` }}
      >
        {row.position}
      </div>
      <div className="relative pt-6">
        <h3 className="text-lg font-semibold leading-tight" style={{ color }}>
          {row.driverName}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{teamIdentity.shortName}</p>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Points</p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight text-white">{row.points % 1 === 0 ? row.points : row.points.toFixed(1)}</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-zinc-300 transition-colors duration-200 group-hover:border-white/22 group-hover:bg-white/[0.09] group-hover:text-white">
            <ChevronRight className="size-5" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

function TeamCard({
  row,
  seasonYear,
  onSelect,
}: {
  row: ConstructorStandingRow;
  seasonYear: number;
  onSelect: (row: ConstructorStandingRow) => void;
}) {
  const color = resolveTeamColor(row.name, row.teamColour, seasonYear);
  const rgb = hexToRgb(color);
  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      data-velocity-ripple
      className="velocity-panel-pattern group relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(16,16,20,0.58)] p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08),0_0_80px_rgba(var(--team-rgb),0.08)] backdrop-blur-[26px] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_28px_72px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.1),0_0_88px_rgba(var(--team-rgb),0.14)] hover:ring-1 hover:ring-white/12"
      style={{ ['--team-rgb' as string]: rgb }}
    >
      <span className="pointer-events-none absolute -left-1 -top-2 select-none text-7xl font-bold tracking-tighter text-white/[0.05] sm:text-8xl" aria-hidden>
        #{row.position}
      </span>
      <div
        className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border text-sm font-semibold tabular-nums text-white"
        style={{ borderColor: `rgba(${rgb},0.35)`, backgroundColor: `rgba(${rgb},0.12)`, boxShadow: `0 0 26px rgba(${rgb},0.28)` }}
      >
        {row.position}
      </div>
      <div className="relative pt-6">
        <div className="flex items-start gap-2">
          <span
            className="mt-1 size-3 shrink-0 rounded-sm ring-1 ring-white/20 transition-[transform,opacity,box-shadow] duration-200 ease-out group-hover:scale-110 group-hover:opacity-100 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.12)]"
            style={{ backgroundColor: color }}
          />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white">{row.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{row.drivers.map((d) => d.driverName).join(' · ')}</p>
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Points</p>
            <p className="mt-0.5 text-3xl font-semibold tabular-nums tracking-tight text-white">{row.points % 1 === 0 ? row.points : row.points.toFixed(1)}</p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-zinc-300 transition-colors duration-200 group-hover:border-white/22 group-hover:bg-white/[0.09] group-hover:text-white">
            <ChevronRight className="size-5" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

function CalendarCard({ race, onSelect }: { race: CalendarRace; onSelect: (race: CalendarRace) => void }) {
  const statusClasses =
    race.status === 'completed'
      ? 'border-emerald-500/25 bg-emerald-500/14 text-emerald-300'
      : 'border-sky-500/25 bg-sky-500/14 text-sky-300';

  return (
    <button
      type="button"
      onClick={() => onSelect(race)}
      data-velocity-ripple
      className="velocity-panel-pattern group relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(18,18,22,0.56)] p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[26px] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-[3px] hover:border-white/20 hover:shadow-[0_28px_72px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.1)] hover:ring-1 hover:ring-white/12"
    >
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Round {race.round}</span>
          <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', statusClasses)}>{race.status}</span>
        </div>

        <div className="flex items-start gap-2">
          <Zap className="mt-1 size-4 text-zinc-500" />
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">{race.name}</h3>
            <p className="mt-1 text-base text-zinc-500">{race.location}</p>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-400">{race.grandPrixName}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-5 text-lg font-semibold text-zinc-300">
          <span className="inline-flex items-center gap-3">
            <CalendarDays className="size-4 text-zinc-500" />
            {race.dateLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ChampionshipExperience({
  data,
  progression,
  constructorsProgression,
  calendar,
}: {
  data: ChampionshipPayload;
  progression: ProgressionPayload;
  constructorsProgression: ProgressionPayload;
  calendar: SeasonCalendarPayload;
}) {
  const [tab, setTab] = useState<TabId>('drivers');
  const [detailDriver, setDetailDriver] = useState<DriverStandingRow | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<ConstructorStandingRow | null>(null);
  const [selectedRace, setSelectedRace] = useState<CalendarRace | null>(null);
  const { session, driverStandings, constructorStandings, meta, seasonYear } = data;
  const sessionVibe = getSessionVibe(session);

  return (
    <div
      data-session-vibe={sessionVibe}
      className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col overflow-hidden bg-[#050507]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(33,90,180,0.18),transparent_22%),radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.03),transparent_18%),radial-gradient(circle_at_82%_82%,rgba(34,197,94,0.14),transparent_18%),radial-gradient(circle_at_55%_38%,rgba(255,255,255,0.02),transparent_20%),linear-gradient(180deg,#040406_0%,#050507_48%,#030305_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:120px_120px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="mx-auto w-full max-w-[1380px] flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Formula 1 World Championship</p>
            <VelocityTitle className="velocity-title cursor-default text-6xl font-semibold tracking-tight sm:text-7xl md:text-8xl xl:text-[9rem]">
              Velocity
            </VelocityTitle>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:pt-10">
            <nav
              className="relative grid w-full grid-cols-4 rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] sm:w-auto sm:min-w-[560px]"
              aria-label="Section"
            >
              <span
                className="pointer-events-none absolute inset-y-1 rounded-full bg-white shadow-md transition-[left,width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]"
                style={{
                  width: "calc((100% - 8px) / 4)",
                  left: `calc(4px + (100% - 8px) * ${Math.max(0, TABS.findIndex((x) => x.id === tab))} / 4)`,
                }}
                aria-hidden
              />
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative z-10 flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors duration-200 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm",
                      active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-200",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0 opacity-80 sm:size-4" aria-hidden />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </nav>
            <RefreshStandingsButton />
          </div>
        </header>

        <div className="velocity-tab-panel-stack mt-10">
          <section className="velocity-tab-panel-item" data-active={tab === 'drivers'}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {driverStandings.map((row) => (
                <DriverCard key={row.driverNumber} row={row} seasonYear={seasonYear} onSelect={setDetailDriver} />
              ))}
            </div>
          </section>

          <section className="velocity-tab-panel-item" data-active={tab === 'teams'} aria-hidden={tab !== 'teams'}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {constructorStandings.map((row) => (
                <TeamCard key={row.name} row={row} seasonYear={seasonYear} onSelect={setSelectedTeam} />
              ))}
            </div>
          </section>

          <section className="velocity-tab-panel-item" data-active={tab === 'analytics'} aria-hidden={tab !== 'analytics'}>
            {tab === 'analytics' ? (
              <div className="space-y-8">
                <GlassPanel className="p-5 sm:p-8">
                  <ChampionshipProgressionChart
                    payload={progression}
                    title="Drivers championship progression"
                    itemLabel="drivers"
                    subtitle={`Cumulative points across the ${seasonYear} season`}
                    drsBoostDataKey={progression.series[0]?.dataKey ?? null}
                  />
                </GlassPanel>
                <GlassPanel className="p-5 sm:p-8">
                  <ChampionshipProgressionChart
                    payload={constructorsProgression}
                    title="Constructors championship progression"
                    itemLabel="constructors"
                    subtitle={`Team points trajectory across the ${seasonYear} season`}
                    tooltipFullSeries
                  />
                </GlassPanel>
                <GlassPanel className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Telemetry lab</h3>
                    <p className="mt-1 text-sm text-zinc-500">Laps, speed traces, and inputs with the same neon treatment.</p>
                  </div>
                  <Link
                    href="/dashboard"
                    data-velocity-ripple
                    className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90"
                  >
                    Open telemetry
                    <ChevronRight className="size-4" />
                  </Link>
                </GlassPanel>
              </div>
            ) : null}
          </section>

          <section className="velocity-tab-panel-item" data-active={tab === 'calendar'} aria-hidden={tab !== 'calendar'}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {calendar.races.map((race) => (
                <CalendarCard key={race.sessionKey} race={race} onSelect={setSelectedRace} />
              ))}
            </div>
          </section>
        </div>

        {meta.source === 'mock' && meta.error && <p className="mt-6 text-center text-sm text-amber-200/85">{meta.error}</p>}

        <div
          className={cn(
            "mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border bg-white/[0.04] px-5 py-2.5 text-[11px] font-medium shadow-[0_18px_40px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] sm:gap-x-6",
            sessionVibe === "live" && "border-white/12 text-zinc-300",
            sessionVibe === "completed" && "border-white/[0.08] text-zinc-400",
            sessionVibe === "upcoming" && "border-white/[0.08] text-zinc-500",
          )}
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {sessionVibe === "live" ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-60" />
                  <span className="velocity-session-live-accent relative inline-flex size-2 rounded-full bg-emerald-400" />
                </>
              ) : (
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    sessionVibe === "upcoming" ? "bg-sky-500/85" : "bg-zinc-500",
                  )}
                />
              )}
            </span>
            {sessionVibe === "live" ? "Live updates" : sessionVibe === "upcoming" ? "Next session" : "Season snapshot"}
          </span>
          <span className="hidden text-white/15 sm:inline" aria-hidden>
            |
          </span>
          <span className="tabular-nums">Round {calendar.currentRound} / {calendar.totalRounds}</span>
          <span className="hidden text-white/15 sm:inline" aria-hidden>
            |
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5" /> After {session.circuit_short_name}
          </span>
          <span className="hidden text-white/15 sm:inline" aria-hidden>
            |
          </span>
          <span>{driverStandings.length} drivers</span>
        </div>
      </div>

      <DriverDetailModal open={detailDriver != null} onOpenChange={(o) => !o && setDetailDriver(null)} driver={detailDriver} seasonYear={seasonYear} sessionKey={session.session_key} />
      <TeamDetailModal open={selectedTeam != null} onOpenChange={(o) => !o && setSelectedTeam(null)} team={selectedTeam} seasonYear={seasonYear} sessionKey={session.session_key} />
      <RaceDetailModal open={selectedRace != null} onOpenChange={(o) => !o && setSelectedRace(null)} race={selectedRace} />
    </div>
  );
}
