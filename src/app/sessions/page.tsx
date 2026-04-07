"use client";

import { CalendarDays, MapPin, Timer } from "lucide-react";

import { useOpenF1SharedState } from "@/components/openf1/openf1-shared-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getSessionStatus(dateStart: string, dateEnd: string) {
  const now = Date.now();
  const start = new Date(dateStart).getTime();
  const end = new Date(dateEnd).getTime();
  if (Number.isFinite(start) && now < start) return "upcoming";
  if (Number.isFinite(end) && now > end) return "completed";
  return "live";
}

export default function SessionsPage() {
  const { sessions, sessionKey, setSessionKey, status, reloadSessions } = useOpenF1SharedState();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Sessions</h1>
          <p className="mt-1 text-sm text-zinc-400">OpenF1 race and sprint sessions synchronized with telemetry.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => void reloadSessions()}
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.08]"
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((session) => {
          const selected = session.session_key === sessionKey;
          const sessionStatus = getSessionStatus(session.date_start, session.date_end);
          return (
            <button
              key={session.session_key}
              type="button"
              onClick={() => setSessionKey(session.session_key)}
              className={cn(
                "velocity-panel-pattern group relative w-full overflow-hidden rounded-[1.5rem] border bg-[rgba(18,18,24,0.58)] p-5 text-left shadow-[0_18px_46px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl transition-all duration-200 hover:-translate-y-0.5",
                selected
                  ? "border-primary/55 ring-1 ring-primary/30"
                  : "border-white/10 hover:border-white/20",
              )}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {session.session_type}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                    sessionStatus === "completed" && "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
                    sessionStatus === "upcoming" && "border-sky-500/30 bg-sky-500/15 text-sky-300",
                    sessionStatus === "live" && "border-rose-500/30 bg-rose-500/15 text-rose-300",
                  )}
                >
                  {sessionStatus}
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-white">{session.session_name}</h2>
              <p className="mt-1.5 text-sm text-zinc-400">{session.circuit_short_name}</p>
              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-zinc-500" />
                  <span>{session.location}, {session.country_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-zinc-500" />
                  <span>{formatDate(session.date_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="size-4 text-zinc-500" />
                  <span>Session #{session.session_key}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {status.sessions === "loading" && (
        <p className="mt-6 text-sm text-zinc-400">Loading sessions from OpenF1…</p>
      )}
      {status.sessions === "error" && (
        <p className="mt-6 text-sm text-amber-200/90">Unable to refresh sessions right now.</p>
      )}
    </main>
  );
}
