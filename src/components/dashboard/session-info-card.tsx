import { Calendar, Cloud, MapPin, Thermometer } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OpenF1Session, OpenF1Weather } from "@/lib/openf1/types";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SessionInfoCard({
  session,
  weather,
  meta,
}: {
  session: OpenF1Session | null;
  weather: OpenF1Weather | null;
  meta?: { source?: string };
}) {
  if (!session) {
    return (
      <Card className="border-white/[0.06] bg-card/80 ring-white/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Session</CardTitle>
          <CardDescription>Select a session to load telemetry.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const rain = weather && weather.rainfall > 0;

  return (
    <Card className="border-white/[0.06] bg-card/80 ring-white/[0.06] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              {session.circuit_short_name}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {session.location}, {session.country_name}
            </CardDescription>
          </div>
          {meta?.source === "mock" && (
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/90">
              Demo data
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-zinc-300">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-zinc-500" />
          <span>{formatDate(session.date_start)}</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">{session.session_type}</span>
        </div>
        {weather && (
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
              <Thermometer className="size-4 text-cyan-400/90" />
              <div className="leading-tight">
                <div className="text-xs text-zinc-500">Air / track</div>
                <div className="font-medium tabular-nums text-zinc-100">
                  {weather.air_temperature.toFixed(1)}°C ·{" "}
                  {weather.track_temperature.toFixed(1)}°C
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
              <Cloud className="size-4 text-violet-300/90" />
              <div className="leading-tight">
                <div className="text-xs text-zinc-500">Conditions</div>
                <div className="font-medium text-zinc-100">
                  {rain ? "Rain reported" : "Dry"} · wind{" "}
                  {weather.wind_speed.toFixed(1)} m/s
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
