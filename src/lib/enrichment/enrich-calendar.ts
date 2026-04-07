import { cache } from "react";

import {
  circuitLengthKmForId,
  formatKm,
  formatRaceDistanceKm,
} from "@/lib/data/circuit-specs";
import { getJolpicaCircuitHistory, getJolpicaRaceResults } from "@/lib/data-sources/jolpica/client";
import type { JolpicaRace } from "@/lib/data-sources/jolpica/types";
import { normalizeCircuitName, normalizeName } from "@/lib/domain/normalize/shared";
import type { CircuitProfile } from "@/lib/domain/types";
import type { OpenF1Session } from "@/lib/openf1/types";

function matchJolpicaRace(session: OpenF1Session, races: JolpicaRace[], round: number) {
  const byRound = races.find((r) => Number(r.round) === round);
  if (byRound) return byRound;

  const byCircuit = races.find(
    (r) =>
      normalizeCircuitName(r.Circuit.circuitName) === normalizeCircuitName(session.circuit_short_name),
  );
  if (byCircuit) return byCircuit;

  const dateTs = new Date(session.date_start).getTime();
  const byDate = races.find((r) => Math.abs(new Date(r.date).getTime() - dateTs) < 1000 * 60 * 60 * 24 * 4);
  if (byDate) return byDate;

  const byGpName = races.find(
    (r) =>
      normalizeName(r.raceName).includes(normalizeName(session.country_name)) ||
      normalizeName(session.country_name).includes(normalizeName(r.raceName)) ||
      normalizeName(r.raceName).includes(normalizeName(session.location)),
  );
  if (byGpName) return byGpName;

  return undefined;
}

function fastestLapFromRace(race: JolpicaRace | null | undefined): { time: string; year: string } | null {
  if (!race?.Results?.length) return null;
  for (const row of race.Results) {
    const rank = row.FastestLap?.rank;
    const time = row.FastestLap?.Time?.time;
    if (time && (rank === "1" || Number(rank) === 1)) {
      return { time, year: String(race.season) };
    }
  }
  for (const row of race.Results) {
    const time = row.FastestLap?.Time?.time;
    if (time) return { time, year: String(race.season) };
  }
  return null;
}

const loadCircuitHistory = cache(async (circuitId: string) => getJolpicaCircuitHistory(circuitId));
const loadRaceResults = cache(async (year: number, round: number) =>
  getJolpicaRaceResults(year, round),
);

export async function enrichCircuitProfiles(
  sessions: OpenF1Session[],
  races: JolpicaRace[],
): Promise<CircuitProfile[]> {
  const profiles = await Promise.all(
    sessions.map(async (session, index) => {
      const matched = matchJolpicaRace(session, races, index + 1);
      const circuitId = matched?.Circuit.circuitId;
      const historyRes = circuitId ? await loadCircuitHistory(circuitId) : { data: [] as JolpicaRace[] };
      const history = historyRes.data
        .slice()
        .sort((a, b) => Number(a.season) - Number(b.season) || Number(a.round) - Number(b.round));
      const firstRace = history[0];
      const lastRace = history[history.length - 1];

      const firstWinner = firstRace?.Results?.[0]?.Driver
        ? `${firstRace.Results[0].Driver.givenName} ${firstRace.Results[0].Driver.familyName}`
        : null;
      const lastWinner = lastRace?.Results?.[0]?.Driver
        ? `${lastRace.Results[0].Driver.givenName} ${lastRace.Results[0].Driver.familyName}`
        : null;

      const roundResult =
        matched != null
          ? await loadRaceResults(Number(matched.season), Number(matched.round))
          : { data: null as JolpicaRace | null };
      const topResult = roundResult.data?.Results?.[0];

      const lengthKm = circuitLengthKmForId(circuitId);
      const lapsStr = topResult?.laps ?? lastRace?.Results?.[0]?.laps ?? null;
      const lapsNum = lapsStr != null && lapsStr !== "" ? Number(lapsStr) : NaN;

      const circuitLength = lengthKm != null ? formatKm(lengthKm) : null;
      const raceDistance =
        lengthKm != null && Number.isFinite(lapsNum) ? formatRaceDistanceKm(lapsNum, lengthKm) : null;

      const flCurrent = fastestLapFromRace(roundResult.data ?? null);
      const flHistoric = fastestLapFromRace(lastRace ?? null);
      const lapRecord = flCurrent?.time ?? flHistoric?.time ?? topResult?.FastestLap?.Time?.time ?? null;
      const lapRecordYear = flCurrent?.year ?? flHistoric?.year ?? null;

      return {
        circuitId: circuitId ?? String(session.circuit_key),
        meetingKey: session.meeting_key,
        circuitName: matched?.Circuit.circuitName ?? session.circuit_short_name,
        circuitShortName: session.circuit_short_name,
        locality: matched?.Circuit.Location.locality ?? session.location,
        country: matched?.Circuit.Location.country ?? session.country_name,
        date: session.date_start,
        firstGrandPrix: firstRace?.season ?? null,
        laps: lapsStr,
        circuitLength,
        raceDistance,
        lapRecord,
        lapRecordYear,
        firstWinner,
        lastWinner,
        sourceCoverage: {
          openf1: true,
          jolpica: Boolean(matched),
        },
      } satisfies CircuitProfile;
    }),
  );

  return profiles.map((profile) => ({
    ...profile,
    circuitName:
      profile.circuitName && profile.circuitName.trim().length > 0
        ? profile.circuitName
        : profile.locality ?? "Unknown circuit",
  }));
}
