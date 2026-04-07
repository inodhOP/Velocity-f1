import 'server-only';

import { getMockProgressionPayload } from './mock-data';
import { fetchOpenF1Json } from './server-fetch';
import { resolveTeamColor } from './team-colors';
import { sessionsChronological } from './session-timeline';
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
  const sessionsAsc = (await sessionsChronological(seasonYear)).filter((s) => s.session_type === 'Race');
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
  const topDrivers = [...lastRows]
    .sort((a, b) => a.position_current - b.position_current || b.points_current - a.points_current)
    .slice(0, 3);
  if (!topDrivers.length) return getMockProgressionPayload();

  const rosterRes = await fetchOpenF1Json<OpenF1Driver[]>('/drivers', { session_key: afterSessionKey }, 600);
  const roster = new Map(rosterRes.data.map((driver) => [driver.driver_number, driver]));

  const palette = ['#3b82f6', '#ef4444', '#f59e0b'];
  const series: ProgressionSeriesMeta[] = topDrivers.map((row, index) => {
    const meta = roster.get(row.driver_number);
    return {
      dataKey: `p${index}`,
      label: (meta?.name_acronym ?? `D${row.driver_number}`).toUpperCase(),
      color: resolveTeamColor(meta?.team_name, meta?.team_colour) || palette[index],
    };
  });

  const chartData: ProgressionChartRow[] = [{ round: 'Start', ...Object.fromEntries(series.map((s) => [s.dataKey, 0])) }];

  for (const entry of usable) {
    const pointsMap = new Map(entry.rows.map((row) => [row.driver_number, row.points_current]));
    const row: ProgressionChartRow = {
      round: roundLabel(`${entry.session.circuit_short_name} Grand Prix`),
    };
    for (let index = 0; index < topDrivers.length; index++) {
      row[series[index]!.dataKey] = pointsMap.get(topDrivers[index]!.driver_number) ?? 0;
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
