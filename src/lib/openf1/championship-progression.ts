import 'server-only';

import { getJolpicaCalendar, getJolpicaConstructorStandingsAfterRound } from '@/lib/data-sources/jolpica/client';
import { getMockProgressionPayload } from './mock-data';
import { fetchOpenF1Json } from './server-fetch';
import { resolveTeamColor } from './team-colors';
import { getTeamIdentity } from './team-meta';
import { raceSessionsOrdered } from './session-timeline';
import type {
  OpenF1ChampionshipRow,
  OpenF1Driver,
  ProgressionChartRow,
  ProgressionPayload,
  ProgressionSeriesMeta,
} from './types';

function roundLabel(label: string) {
  return label.replace(' Grand Prix', ' GP');
}

export async function getChampionshipProgression(
  seasonYear: number,
  afterSessionKey: number,
): Promise<ProgressionPayload> {
  const sessionsAsc = await raceSessionsOrdered(seasonYear);
  const endIdx = sessionsAsc.findIndex((s) => s.session_key === afterSessionKey);
  const timeline = sessionsAsc.slice(0, endIdx >= 0 ? endIdx + 1 : sessionsAsc.length);

  if (!timeline.length) return getMockProgressionPayload();

  const champResults = await Promise.all(
    timeline.map((session) => fetchOpenF1Json<OpenF1ChampionshipRow[]>('/championship_drivers', { session_key: session.session_key }, 900)),
  );

  const usable = timeline
    .map((session, index) => ({ session, rows: champResults[index]?.data ?? [], meta: champResults[index]?.meta }))
    .filter((entry) => entry.rows.length > 0);

  if (!usable.length) return getMockProgressionPayload();

  const lastRows = usable[usable.length - 1]!.rows;
  const orderedDrivers = [...lastRows]
    .sort((a, b) => a.position_current - b.position_current || b.points_current - a.points_current)
    .map((row) => row.driver_number);
  if (!orderedDrivers.length) return getMockProgressionPayload();

  const rosterRes = await fetchOpenF1Json<OpenF1Driver[]>('/drivers', { session_key: afterSessionKey }, 600);
  const roster = new Map(rosterRes.data.map((driver) => [driver.driver_number, driver]));

  const series: ProgressionSeriesMeta[] = orderedDrivers.map((driverNumber, index) => {
    const meta = roster.get(driverNumber);
    return {
      dataKey: `d${index}`,
      label: (meta?.name_acronym ?? `D${driverNumber}`).toUpperCase(),
      color: resolveTeamColor(meta?.team_name, meta?.team_colour, seasonYear),
    };
  });

  const chartData: ProgressionChartRow[] = [{ round: 'Start', ...Object.fromEntries(series.map((s) => [s.dataKey, 0])) }];

  for (const entry of usable) {
    const pointsMap = new Map(entry.rows.map((row) => [row.driver_number, row.points_current]));
    const row: ProgressionChartRow = {
      round: roundLabel(`${entry.session.circuit_short_name} Grand Prix`),
    };
    for (let index = 0; index < orderedDrivers.length; index++) {
      row[series[index]!.dataKey] = pointsMap.get(orderedDrivers[index]!) ?? 0;
    }
    chartData.push(row);
  }

  return {
    chartData,
    series,
    completedRounds: usable.length,
    totalRounds: sessionsAsc.length,
    meta: {
      source: 'live',
      error: [rosterRes.meta.error, ...usable.map((u) => u.meta?.error).filter(Boolean)].filter(Boolean).join('; ') || undefined,
    },
  };
}

export async function getConstructorsProgression(
  seasonYear: number,
  afterSessionKey: number,
): Promise<ProgressionPayload> {
  const sessionsAsc = await raceSessionsOrdered(seasonYear);
  const endIdx = sessionsAsc.findIndex((s) => s.session_key === afterSessionKey);
  const lastRound =
    endIdx >= 0 ? endIdx + 1 : sessionsAsc.length > 0 ? sessionsAsc.length : 0;

  if (lastRound < 1) return getMockProgressionPayload();

  const calendarRes = await getJolpicaCalendar(seasonYear);
  const races = calendarRes.data;
  const errors: string[] = [];
  if (calendarRes.meta.error) errors.push(calendarRes.meta.error);

  const roundResults = await Promise.all(
    Array.from({ length: lastRound }, (_, i) =>
      getJolpicaConstructorStandingsAfterRound(seasonYear, i + 1),
    ),
  );

  for (const res of roundResults) {
    if (res.meta.error) errors.push(res.meta.error);
  }

  const usable = roundResults
    .map((res, i) => ({
      round: i + 1,
      rows: res.data,
      raceName: races[i]?.raceName,
    }))
    .filter((entry) => entry.rows.length > 0);

  if (!usable.length) return getMockProgressionPayload();

  const lastStanding = usable[usable.length - 1]!;
  const sortedLast = [...lastStanding.rows].sort(
    (a, b) => Number(a.position) - Number(b.position),
  );

  const orderedConstructorIds: string[] = [];
  const seenIds = new Set<string>();
  const labelByConstructorId = new Map<string, string>();
  for (const row of sortedLast) {
    const id = row.Constructor.constructorId;
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    orderedConstructorIds.push(id);
    labelByConstructorId.set(
      id,
      getTeamIdentity(row.Constructor.name, seasonYear).fullName,
    );
  }

  if (!orderedConstructorIds.length) return getMockProgressionPayload();

  const series: ProgressionSeriesMeta[] = orderedConstructorIds.map((constructorId, index) => {
    const label = labelByConstructorId.get(constructorId)!;
    return {
      dataKey: `t${index}`,
      label,
      color: resolveTeamColor(label, undefined, seasonYear),
    };
  });

  const chartData: ProgressionChartRow[] = [
    { round: 'Start', ...Object.fromEntries(series.map((s) => [s.dataKey, 0])) },
  ];

  for (const entry of usable) {
    const pointsMap = new Map<string, number>();
    for (const row of entry.rows) {
      pointsMap.set(row.Constructor.constructorId, Number.parseFloat(row.points));
    }
    const raceName = entry.raceName ?? `Round ${entry.round}`;
    const row: ProgressionChartRow = {
      round: roundLabel(raceName),
    };
    for (let index = 0; index < orderedConstructorIds.length; index++) {
      row[series[index]!.dataKey] = pointsMap.get(orderedConstructorIds[index]!) ?? 0;
    }
    chartData.push(row);
  }

  const totalRounds = races.length > 0 ? races.length : sessionsAsc.length;

  return {
    chartData,
    series,
    completedRounds: usable.length,
    totalRounds,
    meta: {
      source: 'live',
      error: errors.length ? [...new Set(errors)].join('; ') : undefined,
    },
  };
}
