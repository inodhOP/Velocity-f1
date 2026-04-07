import type { JolpicaConstructorStanding, JolpicaDriverStanding, JolpicaRace, JolpicaResponse } from "./types";

const JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1";

type JolpicaEnvelope = {
  MRData?: {
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: JolpicaDriverStanding[];
        ConstructorStandings?: JolpicaConstructorStanding[];
      }>;
    };
    RaceTable?: {
      Races?: JolpicaRace[];
    };
  };
};

async function fetchJolpica<T>(
  path: string,
  revalidateSeconds = 60 * 60 * 6,
): Promise<JolpicaResponse<T | null>> {
  try {
    const res = await fetch(`${JOLPICA_BASE}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: revalidateSeconds },
    });
    if (!res.ok) throw new Error(`Jolpica ${res.status}`);
    const json = (await res.json()) as T;
    return { data: json, meta: { source: "live" } };
  } catch (error) {
    return {
      data: null,
      meta: { source: "empty", error: error instanceof Error ? error.message : "Jolpica fetch failed" },
    };
  }
}

export async function getJolpicaDriverStandings(year: number): Promise<JolpicaResponse<JolpicaDriverStanding[]>> {
  const result = await fetchJolpica<JolpicaEnvelope>(`/${year}/driverStandings.json?limit=100`);
  const standings = result.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  return { data: standings, meta: result.meta.source === "live" ? { source: "live" } : result.meta };
}

export async function getJolpicaConstructorStandings(
  year: number,
): Promise<JolpicaResponse<JolpicaConstructorStanding[]>> {
  const result = await fetchJolpica<JolpicaEnvelope>(
    `/${year}/constructorStandings.json?limit=100`,
  );
  const standings =
    result.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  return { data: standings, meta: result.meta.source === "live" ? { source: "live" } : result.meta };
}

/** Constructor standings after a specific round (cumulative points to that round). */
export async function getJolpicaConstructorStandingsAfterRound(
  year: number,
  round: number,
): Promise<JolpicaResponse<JolpicaConstructorStanding[]>> {
  const result = await fetchJolpica<JolpicaEnvelope>(
    `/${year}/${round}/constructorStandings.json?limit=100`,
    60 * 30,
  );
  const standings =
    result.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  return { data: standings, meta: result.meta.source === "live" ? { source: "live" } : result.meta };
}

export async function getJolpicaCalendar(year: number): Promise<JolpicaResponse<JolpicaRace[]>> {
  const result = await fetchJolpica<JolpicaEnvelope>(`/${year}.json?limit=100`);
  const races = result.data?.MRData?.RaceTable?.Races ?? [];
  return { data: races, meta: result.meta.source === "live" ? { source: "live" } : result.meta };
}

export async function getJolpicaCircuitHistory(
  circuitId: string,
): Promise<JolpicaResponse<JolpicaRace[]>> {
  const result = await fetchJolpica<JolpicaEnvelope>(
    `/circuits/${circuitId}/results/1.json?limit=2000`,
    60 * 60 * 24,
  );
  const races = result.data?.MRData?.RaceTable?.Races ?? [];
  return {
    data: races,
    meta: result.meta.source === "live" ? { source: "live" } : result.meta,
  };
}

export async function getJolpicaRaceResults(
  year: number,
  round: number,
): Promise<JolpicaResponse<JolpicaRace | null>> {
  const result = await fetchJolpica<JolpicaEnvelope>(`/${year}/${round}/results.json`, 60 * 60 * 24);
  const race = result.data?.MRData?.RaceTable?.Races?.[0] ?? null;
  return {
    data: race,
    meta: result.meta.source === "live" ? { source: "live" } : result.meta,
  };
}
