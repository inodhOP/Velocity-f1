"use client";

import { useMemo } from "react";

import { useOpenF1SharedState } from "@/components/openf1/openf1-shared-provider";
import { cn } from "@/lib/utils";

function getDriverSessionStats(driverNumber: number, sessionKey: number) {
  return `${sessionKey}-${driverNumber}`;
}

export default function DriversPage() {
  const { activeSession, drivers, driverA, driverB, setDriverA, setDriverB, status } =
    useOpenF1SharedState();

  const sortedDrivers = useMemo(
    () => [...drivers].sort((a, b) => a.driver_number - b.driver_number),
    [drivers],
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Drivers</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Roster for {activeSession?.session_name ?? "selected session"} from OpenF1.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedDrivers.map((driver) => {
          const isA = driver.driver_number === driverA;
          const isB = driver.driver_number === driverB;
          const driverKey =
            activeSession != null
              ? getDriverSessionStats(driver.driver_number, activeSession.session_key)
              : String(driver.driver_number);
          return (
            <article
              key={driver.driver_number}
              className={cn(
                "velocity-panel-pattern rounded-[1.5rem] border bg-[rgba(18,18,24,0.58)] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl",
                isA || isB ? "border-primary/50 ring-1 ring-primary/25" : "border-white/10",
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight text-white">{driver.full_name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{driver.team_name}</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm font-semibold tabular-nums text-zinc-200">
                  #{driver.driver_number}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Code</p>
                  <p className="mt-1 font-medium text-zinc-200">{driver.name_acronym}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Country</p>
                  <p className="mt-1 font-medium text-zinc-200">{driver.country_code ?? "—"}</p>
                </div>
                <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">OpenF1 key</p>
                  <p className="mt-1 font-medium tabular-nums text-zinc-200">{driverKey}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDriverA(driver.driver_number)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                    isA
                      ? "border-primary/60 bg-primary/20 text-primary-foreground"
                      : "border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]",
                  )}
                >
                  Set Driver A
                </button>
                <button
                  type="button"
                  onClick={() => setDriverB(driver.driver_number)}
                  className={cn(
                    "cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                    isB
                      ? "border-primary/60 bg-primary/20 text-primary-foreground"
                      : "border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.08]",
                  )}
                >
                  Set Driver B
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {status.drivers === "loading" && (
        <p className="mt-6 text-sm text-zinc-400">Loading driver roster from OpenF1…</p>
      )}
      {status.drivers === "error" && (
        <p className="mt-6 text-sm text-amber-200/90">Unable to refresh drivers right now.</p>
      )}
    </main>
  );
}
