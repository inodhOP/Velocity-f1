import 'server-only';

import { getMockChampionshipPayload } from './mock-data';
import { fetchOpenF1Json } from './server-fetch';
import { formatDriverName, getTeamIdentity } from './team-meta';
import type {
  ChampionshipPayload,
  ConstructorStandingRow,
  DriverStandingRow,
  OpenF1ChampionshipRow,
  OpenF1ChampionshipTeamRow,
  OpenF1Driver,
  OpenF1Session,
} from './types';

const NOW_WITH_BUFFER = () => Date.now() + 1000 * 60 * 60 * 8;

async function completedRaceSessionsForYear(year: number): Promise<OpenF1Session[]> {
  const races = await fetchOpenF1Json<OpenF1Session[]>('/sessions', { year, session_type: 'Race' }, 1800);
  return races.data
    .filter((s) => new Date(s.date_start).getTime() <= NOW_WITH_BUFFER())
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
}

function buildConstructorsFromDrivers(drivers: DriverStandingRow[], seasonYear: number): ConstructorStandingRow[] {
  const teams = new Map<
    string,
    { shortName: string; points: number; colour: string; bestPos: number; bestStart: number | null; drivers: ConstructorStandingRow['drivers'] }
  >();

  for (const row of drivers) {
    const identity = getTeamIdentity(row.team, seasonYear);
    const key = identity.fullName;
    const existing = teams.get(key);
    const driverEntry = { driverNumber: row.driverNumber, driverName: row.driverName, points: row.points };

    if (!existing) {
      teams.set(key, {
        shortName: identity.shortName,
        points: row.points,
        colour: row.teamColour,
        bestPos: row.position,
        bestStart: row.positionStart,
        drivers: [driverEntry],
      });
      continue;
    }

    existing.points += row.points;
    existing.drivers.push(driverEntry);
    if (row.position < existing.bestPos) existing.bestPos = row.position;
    if ((existing.bestStart ?? Infinity) > (row.positionStart ?? Infinity)) existing.bestStart = row.positionStart;
  }

  return [...teams.entries()]
    .map(([name, value]) => ({
      name,
      shortName: value.shortName,
      teamColour: value.colour,
      points: Math.round(value.points * 10) / 10,
      position: value.bestPos,
      positionStart: value.bestStart,
      drivers: value.drivers.sort((a, b) => b.points - a.points),
    }))
    .sort((a, b) => a.position - b.position || b.points - a.points)
    .map((row, index) => ({ ...row, position: index + 1 }));
}

function mergeStandings(
  session: OpenF1Session,
  championshipDrivers: OpenF1ChampionshipRow[],
  roster: OpenF1Driver[],
  championshipTeams: OpenF1ChampionshipTeamRow[],
  fetchMeta: { source: 'live' | 'mock'; error?: string },
): ChampionshipPayload {
  const rosterMap = new Map(roster.map((d) => [d.driver_number, d]));

  const driverStandings: DriverStandingRow[] = championshipDrivers
    .map((row) => {
      const d = rosterMap.get(row.driver_number);
      const identity = getTeamIdentity(d?.team_name ?? 'Unknown Team', session.year);
      return {
        position: row.position_current,
        driverNumber: row.driver_number,
        driverName: formatDriverName(d?.full_name ?? `Driver ${row.driver_number}`),
        acronym: d?.name_acronym ?? String(row.driver_number),
        countryCode: d?.country_code ?? null,
        team: identity.fullName,
        teamColour: d?.team_colour ? d.team_colour.replace('#', '') : '71717a',
        points: Math.round(row.points_current * 10) / 10,
        pointsDelta: row.points_start != null ? Math.round((row.points_current - row.points_start) * 10) / 10 : null,
        positionStart: row.position_start,
      };
    })
    .sort((a, b) => a.position - b.position || b.points - a.points);

  let constructorStandings: ConstructorStandingRow[];
  if (championshipTeams.length) {
    const driverPointsByTeam = new Map<string, ConstructorStandingRow['drivers']>();
    for (const row of driverStandings) {
      const list = driverPointsByTeam.get(row.team) ?? [];
      list.push({ driverNumber: row.driverNumber, driverName: row.driverName, points: row.points });
      driverPointsByTeam.set(row.team, list);
    }

    constructorStandings = championshipTeams
      .map((row) => {
        const identity = getTeamIdentity(row.team_name, session.year);
        const matchingDriver = driverStandings.find((driver) => driver.team === identity.fullName);
        return {
          position: row.position_current,
          name: identity.fullName,
          shortName: identity.shortName,
          teamColour: matchingDriver?.teamColour ?? '71717a',
          points: Math.round(row.points_current * 10) / 10,
          pointsDelta: row.points_start != null ? Math.round((row.points_current - row.points_start) * 10) / 10 : null,
          positionStart: row.position_start,
          drivers: (driverPointsByTeam.get(identity.fullName) ?? []).sort((a, b) => b.points - a.points),
        };
      })
      .sort((a, b) => a.position - b.position || b.points - a.points);
  } else {
    constructorStandings = buildConstructorsFromDrivers(driverStandings, session.year);
  }

  return {
    seasonYear: session.year,
    session,
    driverStandings,
    constructorStandings,
    meta: fetchMeta,
  };
}

export async function getLatestChampionship(): Promise<ChampionshipPayload> {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const errors: string[] = [];

  for (const year of years) {
    const sessions = await completedRaceSessionsForYear(year);

    for (const session of sessions) {
      const [driverChampRes, teamChampRes, driversRes] = await Promise.all([
        fetchOpenF1Json<OpenF1ChampionshipRow[]>('/championship_drivers', { session_key: session.session_key }, 180),
        fetchOpenF1Json<OpenF1ChampionshipTeamRow[]>('/championship_teams', { session_key: session.session_key }, 180),
        fetchOpenF1Json<OpenF1Driver[]>('/drivers', { session_key: session.session_key }, 600),
      ]);

      if (driverChampRes.meta.error) errors.push(driverChampRes.meta.error);
      if (teamChampRes.meta.error) errors.push(teamChampRes.meta.error);
      if (driversRes.meta.error) errors.push(driversRes.meta.error);
      if (!driverChampRes.data.length || !driversRes.data.length) continue;

      return mergeStandings(session, driverChampRes.data, driversRes.data, teamChampRes.data, {
        source: 'live',
        error: errors.length ? [...new Set(errors.filter(Boolean))].join('; ') : undefined,
      });
    }
  }

  const mock = getMockChampionshipPayload();
  mock.meta = { ...mock.meta, error: errors.length ? [...new Set(errors)].join('; ') : mock.meta.error };
  return mock;
}
