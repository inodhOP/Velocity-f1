"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ChartSkeleton } from "@/components/dashboard/chart-skeleton";
import { DriverComparisonPanel } from "@/components/dashboard/driver-comparison";
import { LapTimeChart } from "@/components/dashboard/lap-time-chart";
import { SessionInfoCard } from "@/components/dashboard/session-info-card";
import { SpeedChart } from "@/components/dashboard/speed-chart";
import { ThrottleBrakeChart } from "@/components/dashboard/throttle-brake-chart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPENF1_PROXY_PREFIX } from "@/lib/openf1/constants";
import type {
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Session,
  OpenF1Weather,
} from "@/lib/openf1/types";

type ApiMeta = { source?: string; error?: string };

type TelemetryPoint = {
  tSec: number;
  speed: number;
  throttle: number;
  brake: number;
};

function sessionLabel(s: OpenF1Session) {
  const d = new Date(s.date_start);
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s.circuit_short_name} · ${s.session_type} · ${date}`;
}

export function DashboardClient() {
  const [sessions, setSessions] = useState<OpenF1Session[]>([]);
  const [sessionKey, setSessionKey] = useState<number | null>(null);
  const [drivers, setDrivers] = useState<OpenF1Driver[]>([]);
  const [driverA, setDriverA] = useState<number | null>(null);
  const [driverB, setDriverB] = useState<number | null>(null);

  const [lapsA, setLapsA] = useState<OpenF1Lap[]>([]);
  const [lapsB, setLapsB] = useState<OpenF1Lap[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [weather, setWeather] = useState<OpenF1Weather | null>(null);

  const [loadMeta, setLoadMeta] = useState<{
    sessions?: ApiMeta;
    drivers?: ApiMeta;
  }>({});

  const [status, setStatus] = useState<{
    sessions: "idle" | "loading" | "done" | "error";
    drivers: "idle" | "loading" | "done" | "error";
    laps: "idle" | "loading" | "done" | "error";
    telemetry: "idle" | "loading" | "done" | "error";
    weather: "idle" | "loading" | "done" | "error";
  }>({
    sessions: "loading",
    drivers: "idle",
    laps: "idle",
    telemetry: "idle",
    weather: "idle",
  });

  const activeSession = useMemo(
    () => sessions.find((s) => s.session_key === sessionKey) ?? null,
    [sessions, sessionKey],
  );

  const driverObjA = useMemo(
    () => drivers.find((d) => d.driver_number === driverA) ?? null,
    [drivers, driverA],
  );
  const driverObjB = useMemo(
    () => drivers.find((d) => d.driver_number === driverB) ?? null,
    [drivers, driverB],
  );

  const loadSessions = useCallback(async () => {
    setStatus((s) => ({ ...s, sessions: "loading" }));
    try {
      const res = await fetch(`${OPENF1_PROXY_PREFIX}/sessions`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Sessions ${res.status}`);
      const json = await res.json();
      const list: OpenF1Session[] = json.sessions ?? [];
      setSessions(list);
      setLoadMeta((m) => ({ ...m, sessions: json.meta }));
      const first = list[0]?.session_key ?? null;
      setSessionKey((prev) => prev ?? first);
      setStatus((s) => ({ ...s, sessions: "done" }));
    } catch {
      setStatus((s) => ({ ...s, sessions: "error" }));
    }
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (sessionKey == null) return;
    let cancelled = false;
    (async () => {
      setStatus((s) => ({ ...s, drivers: "loading" }));
      try {
        const res = await fetch(
          `${OPENF1_PROXY_PREFIX}/drivers?session_key=${sessionKey}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(`Drivers ${res.status}`);
        const json = await res.json();
        const list: OpenF1Driver[] = json.drivers ?? [];
        if (cancelled) return;
        setDrivers(list);
        setLoadMeta((m) => ({ ...m, drivers: json.meta }));
        setDriverA((prev) => {
          if (prev != null && list.some((d) => d.driver_number === prev))
            return prev;
          return list[0]?.driver_number ?? null;
        });
        setDriverB((prev) => {
          if (prev != null && list.some((d) => d.driver_number === prev))
            return prev;
          return list[1]?.driver_number ?? list[0]?.driver_number ?? null;
        });
        setStatus((s) => ({ ...s, drivers: "done" }));
      } catch {
        if (!cancelled) setStatus((s) => ({ ...s, drivers: "error" }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  useEffect(() => {
    if (sessionKey == null || driverA == null || driverB == null) return;
    let cancelled = false;
    (async () => {
      setStatus((s) => ({ ...s, laps: "loading", telemetry: "loading" }));
      try {
        const [la, lb, tel, wx] = await Promise.all([
          fetch(
            `${OPENF1_PROXY_PREFIX}/laps?session_key=${sessionKey}&driver_number=${driverA}`,
            { cache: "no-store" },
          ).then((r) => r.json()),
          fetch(
            `${OPENF1_PROXY_PREFIX}/laps?session_key=${sessionKey}&driver_number=${driverB}`,
            { cache: "no-store" },
          ).then((r) => r.json()),
          fetch(
            `${OPENF1_PROXY_PREFIX}/car-data?session_key=${sessionKey}&driver_number=${driverA}`,
            { cache: "no-store" },
          ).then((r) => r.json()),
          fetch(
            `${OPENF1_PROXY_PREFIX}/weather?session_key=${sessionKey}`,
            { cache: "no-store" },
          ).then((r) => r.json()),
        ]);
        if (cancelled) return;
        setLapsA(la.laps ?? []);
        setLapsB(lb.laps ?? []);
        setTelemetry(tel.series ?? []);
        setWeather(wx.weather ?? null);
        setStatus((s) => ({
          ...s,
          laps: "done",
          telemetry: "done",
          weather: "done",
        }));
      } catch {
        if (!cancelled) {
          setStatus((s) => ({
            ...s,
            laps: "error",
            telemetry: "error",
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionKey, driverA, driverB]);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Telemetry dashboard
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Session-accurate laps, speed traces, and driver inputs from OpenF1—engineered
          for clarity under pressure.
        </p>
      </header>

      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-[#12121A]/80 p-4 ring-1 ring-white/[0.04] backdrop-blur-sm transition-shadow duration-300 hover:ring-white/[0.07] sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Session
            </div>
            <Select
              value={sessionKey != null ? String(sessionKey) : ""}
              onValueChange={(v) => setSessionKey(Number(v))}
              disabled={!sessions.length || status.sessions === "loading"}
            >
              <SelectTrigger className="h-10 w-full border-white/10 bg-white/[0.04]">
                <SelectValue placeholder="Load sessions…" />
              </SelectTrigger>
              <SelectContent className="max-h-72 border-white/10 bg-[#12121A]">
                {sessions.map((s) => (
                  <SelectItem
                    key={s.session_key}
                    value={String(s.session_key)}
                    className="text-sm"
                  >
                    {sessionLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:col-span-1 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Driver A
              </div>
              <Select
                value={driverA != null ? String(driverA) : ""}
                onValueChange={(v) => setDriverA(Number(v))}
                disabled={!drivers.length || status.drivers === "loading"}
              >
                <SelectTrigger className="h-10 w-full border-white/10 bg-white/[0.04]">
                  <SelectValue placeholder="Driver" />
                </SelectTrigger>
                <SelectContent className="max-h-64 border-white/10 bg-[#12121A]">
                  {drivers.map((d) => (
                    <SelectItem
                      key={d.driver_number}
                      value={String(d.driver_number)}
                      className="text-sm"
                    >
                      {d.driver_number} · {d.name_acronym}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Driver B
              </div>
              <Select
                value={driverB != null ? String(driverB) : ""}
                onValueChange={(v) => setDriverB(Number(v))}
                disabled={!drivers.length || status.drivers === "loading"}
              >
                <SelectTrigger className="h-10 w-full border-white/10 bg-white/[0.04]">
                  <SelectValue placeholder="Driver" />
                </SelectTrigger>
                <SelectContent className="max-h-64 border-white/10 bg-[#12121A]">
                  {drivers.map((d) => (
                    <SelectItem
                      key={`b-${d.driver_number}`}
                      value={String(d.driver_number)}
                      className="text-sm"
                    >
                      {d.driver_number} · {d.name_acronym}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-10 shrink-0 border-white/15 bg-transparent text-zinc-200 hover:bg-white/[0.06]"
          onClick={() => void loadSessions()}
        >
          Refresh sessions
        </Button>
      </div>

      {(status.sessions === "error" || status.drivers === "error") && (
        <div className="mb-6 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
          Connection issue while reaching OpenF1. Showing cached or demo telemetry where
          needed.{loadMeta.sessions?.error ? ` (${loadMeta.sessions.error})` : ""}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SessionInfoCard
            session={activeSession}
            weather={weather}
            meta={loadMeta.sessions}
          />
        </div>
        <div className="lg:col-span-2">
          <DriverComparisonPanel
            driverA={driverObjA}
            driverB={driverObjB}
            lapsA={lapsA}
            lapsB={lapsB}
            isLoading={status.laps === "loading"}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-white/10 bg-[rgba(18,18,24,0.5)] shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] ring-0 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/15 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lap time trace</CardTitle>
            <CardDescription>Fastest lap marked · dashed reference</CardDescription>
          </CardHeader>
          <CardContent>
            {status.laps === "loading" ? (
              <ChartSkeleton />
            ) : (
              <LapTimeChart laps={lapsA} />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[rgba(18,18,24,0.5)] shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] ring-0 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/15 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Speed trace</CardTitle>
            <CardDescription>Downsampled car data · Driver A</CardDescription>
          </CardHeader>
          <CardContent>
            {status.telemetry === "loading" ? (
              <ChartSkeleton />
            ) : (
              <SpeedChart
                data={telemetry.map((p) => ({ tSec: p.tSec, speed: p.speed }))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[rgba(18,18,24,0.5)] shadow-[0_16px_48px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] ring-0 backdrop-blur-2xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-white/15 xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Throttle & brake</CardTitle>
            <CardDescription>Driver A inputs (0–100%)</CardDescription>
          </CardHeader>
          <CardContent>
            {status.telemetry === "loading" ? (
              <ChartSkeleton />
            ) : (
              <ThrottleBrakeChart data={telemetry} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
