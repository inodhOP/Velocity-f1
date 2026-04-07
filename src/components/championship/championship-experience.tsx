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
import { GlassPanel } from '@/components/ui/glass-panel';
import { cn } from '@/lib/utils';
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

function DriverCard({ row, onSelect }: { row: DriverStandingRow; onSelect: (row: DriverStandingRow) => void }) {
  const color = resolveTeamColor(row.team, row.teamColour);
  const rgb = hexToRgb(color);
  const teamIdentity = getTeamIdentity(row.team);
  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      className="velocity-panel-pattern group relative block w-full cursor-pointer overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(16,16,20,0.58)] p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[26px] transition-all duration-300 ease-out outline-none hover:-translate-y-1 hover:border-white/18 focus-visible:ring-2"
      style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px rgba(${rgb},0.08)` }}
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

function TeamCard({ row, onSelect }: { row: ConstructorStandingRow; onSelect: (row: ConstructorStandingRow) => void }) {
  const color = resolveTeamColor(row.name, row.teamColour);
  const rgb = hexToRgb(color);
  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      className="velocity-panel-pattern group relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(16,16,20,0.58)] p-5 text-left shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[26px] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/18"
      style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px rgba(${rgb},0.08)` }}
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
          <span className="mt-1 size-3 shrink-0 rounded-sm ring-1 ring-white/20" style={{ backgroundColor: color }} />
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
      className="velocity-panel-pattern group relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[rgba(18,18,22,0.56)] p-6 text-left shadow-[0_22px_60px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[26px] transition-all duration-300 hover:-translate-y-1 hover:border-white/18"
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
            <p className="mt-2 text-xl text-zinc-500">{race.location}</p>
            <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-600">{race.grandPrixName}</p>
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

export function ChampionshipExperience({ data, progression, calendar }: { data: ChampionshipPayload; progression: ProgressionPayload; calendar: SeasonCalendarPayload }) {
  const [tab, setTab] = useState<TabId>('drivers');
  const [detailDriver, setDetailDriver] = useState<DriverStandingRow | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<ConstructorStandingRow | null>(null);
  const [selectedRace, setSelectedRace] = useState<CalendarRace | null>(null);
  const { session, driverStandings, constructorStandings, meta, seasonYear } = data;

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col overflow-hidden bg-[#050507]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(33,90,180,0.18),transparent_22%),radial-gradient(circle_at_78%_14%,rgba(255,255,255,0.03),transparent_18%),radial-gradient(circle_at_82%_82%,rgba(34,197,94,0.14),transparent_18%),radial-gradient(circle_at_55%_38%,rgba(255,255,255,0.02),transparent_20%),linear-gradient(180deg,#040406_0%,#050507_48%,#030305_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background:linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:120px_120px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />

      <div className="mx-auto w-full max-w-[1380px] flex-1 px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <header className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Formula 1 World Championship</p>
            <h1 className="velocity-title text-6xl font-semibold tracking-tight text-transparent sm:text-7xl md:text-8xl xl:text-[9rem]">Velocity</h1>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center xl:pt-10">
            <nav className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_18px_40px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px]" aria-label="Section">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn('flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 sm:px-6', active ? 'bg-white text-zinc-900 shadow-md' : 'text-zinc-500 hover:text-zinc-200')}
                  >
                    <Icon className="size-4 opacity-80" aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <RefreshStandingsButton />
          </div>
        </header>

        <div className="mt-10">
          {tab === 'drivers' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{driverStandings.map((row) => <DriverCard key={row.driverNumber} row={row} onSelect={setDetailDriver} />)}</div>}

          {tab === 'teams' && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{constructorStandings.map((row) => <TeamCard key={row.name} row={row} onSelect={setSelectedTeam} />)}</div>}

          {tab === 'analytics' && (
            <div className="space-y-8">
              <GlassPanel className="p-5 sm:p-8">
                <ChampionshipProgressionChart payload={progression} subtitle={`Cumulative points across the ${seasonYear} season`} />
              </GlassPanel>
              <GlassPanel className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Telemetry lab</h3>
                  <p className="mt-1 text-sm text-zinc-500">Laps, speed traces, and inputs with the same neon treatment.</p>
                </div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90">
                  Open telemetry
                  <ChevronRight className="size-4" />
                </Link>
              </GlassPanel>
            </div>
          )}

          {tab === 'calendar' && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{calendar.races.map((race) => <CalendarCard key={race.sessionKey} race={race} onSelect={setSelectedRace} />)}</div>}
        </div>

        {meta.source === 'mock' && meta.error && <p className="mt-6 text-center text-sm text-amber-200/85">{meta.error}</p>}

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[11px] font-medium text-zinc-400 shadow-[0_18px_40px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] sm:gap-x-6">
          <span className="flex items-center gap-2 text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Live updates
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
