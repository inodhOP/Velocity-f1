'use client';

import { CalendarDays, Flag, MapPin, Trophy } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { CalendarRace } from '@/lib/openf1/types';

export function RaceDetailModal({
  open,
  onOpenChange,
  race,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  race: CalendarRace | null;
}) {
  if (!race) return null;

  const compactFact = (value: string) =>
    value.toLowerCase().includes("not available") ? "N/A" : value;

  const statItems = [
    ['First GP', compactFact(race.facts.firstGrandPrix)],
    ['First winner', compactFact(race.facts.firstWinner)],
    ['Last winner', compactFact(race.facts.lastWinner)],
    ['Laps', compactFact(race.facts.laps)],
    ['Length', compactFact(race.facts.circuitLength)],
    ['Distance', compactFact(race.facts.raceDistance)],
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="w-[min(94vw,1140px)]! max-w-none! overflow-hidden rounded-[2rem]! border-white/12! bg-[rgba(10,10,14,0.78)]! p-0! text-zinc-100 shadow-[0_30px_90px_rgba(0,0,0,0.72)] backdrop-blur-[30px]!"
      >
        <DialogTitle className="sr-only">{race.name} race details</DialogTitle>
        <DialogDescription className="sr-only">Grand Prix summary and circuit facts.</DialogDescription>

        <div className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-4 sm:p-5 lg:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.08),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.04),transparent_38%)]" />

          <div className="relative">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1">Round {race.round}</span>
              <span className={race.status === 'completed' ? 'rounded-full border border-emerald-500/30 bg-emerald-500/14 px-2.5 py-1 text-emerald-300' : 'rounded-full border border-sky-500/30 bg-sky-500/14 px-2.5 py-1 text-sky-300'}>
                {race.status}
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0">
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl xl:text-[2.6rem]">{race.name}</h2>
                <p className="mt-1.5 text-sm text-zinc-400 sm:text-base xl:text-lg">{race.grandPrixName}</p>

                <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="size-4" />
                  <span>{race.location}</span>
                </div>

                <div className="mt-4 max-w-3xl border-l border-cyan-400/30 pl-3 text-sm leading-relaxed text-zinc-300 italic sm:text-base xl:text-lg">
                  “{race.quote}”
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 xl:grid-cols-3">
                  {statItems.map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
                      <p className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl xl:text-2xl">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex min-w-0 flex-col justify-between gap-4">
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    <CalendarDays className="size-4" />
                    Lap record
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {compactFact(race.facts.lapRecord)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">{race.facts.lapRecordYear}</p>
                </div>
                <div className="hidden items-end justify-end pr-3 text-zinc-600 lg:flex">
                  <Flag className="size-8" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4" /> {race.dateLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <Trophy className="size-4" /> Historic circuit summary
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
