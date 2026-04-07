import 'server-only';

import { getMockDriverBreakdown } from './mock-data';
import { fetchOpenF1Json } from './server-fetch';
import { sessionsChronological } from './session-timeline';
import { formatDriverName, getTeamIdentity } from './team-meta';
import type {
  DriverBreakdownPayload,
  DriverRoundBreakdown,
  OpenF1ChampionshipRow,
  OpenF1Driver,
  OpenF1SessionResult,
} from './types';

/**
 * Per-weekend points and finishing position from `session_result`, cumulative trend for charts.
 * Sprint + Race sessions are rolled up into one weekend row so the modal does not show duplicate circuits.
 */
export async function getDriverPointsBreakdown(
  seasonYear: number,
  driverNumber: number,
  snapshotSessionKey: number,
): Promise<DriverBreakdownPayload> {
  const [champRes, driversRes] = await Promise.all([
    fetchOpenF1Json<OpenF1ChampionshipRow[]>('/championship_drivers', { session_key: snapshotSessionKey }, 120),
    fetchOpenF1Json<OpenF1Driver[]>('/drivers', { session_key: snapshotSessionKey }, 600),
  ]);

  const champRow = champRes.data.find((r) => r.driver_number === driverNumber);
  const driverMeta = driversRes.data.find((d) => d.driver_number === driverNumber);

  if (!champRow || !driverMeta) {
    return getMockDriverBreakdown(driverNumber);
  }

  const sessionsAsc = await sessionsChronological(seasonYear);
  const endIdx = sessionsAsc.findIndex((s) => s.session_key === snapshotSessionKey);
  const safeEnd = endIdx >= 0 ? endIdx : sessionsAsc.length - 1;

  if (safeEnd < 0) {
    return getMockDriverBreakdown(driverNumber);
  }

  const timeline = sessionsAsc.slice(0, safeEnd + 1);
  const results = await Promise.all(
    timeline.map((s) => fetchOpenF1Json<OpenF1SessionResult[]>('/session_result', { session_key: s.session_key }, 600)),
  );

  if (results.every((r) => !r.data.length)) {
    return getMockDriverBreakdown(driverNumber);
  }

  const byMeeting = new Map<number, Omit<DriverRoundBreakdown, 'index' | 'cumulativePoints'>>();

  for (let i = 0; i < timeline.length; i++) {
    const session = timeline[i]!;
    const rows = results[i]?.data ?? [];
    const row = rows.find((x) => x.driver_number === driverNumber);
    const pts = row ? Math.round(row.points * 10) / 10 : 0;
    const existing = byMeeting.get(session.meeting_key);

    if (!existing) {
      byMeeting.set(session.meeting_key, {
        meetingKey: session.meeting_key,
        sessionKey: session.session_key,
        roundLabel: `${session.circuit_short_name} Grand Prix`,
        sessionType: 'Weekend',
        racePosition: row?.position ?? null,
        pointsScored: pts,
      });
      continue;
    }

    existing.pointsScored = Math.round((existing.pointsScored + pts) * 10) / 10;
    if (session.session_type === 'Race') {
      existing.sessionKey = session.session_key;
      existing.racePosition = row?.position ?? existing.racePosition;
    }
  }

  let cumulative = 0;
  const rounds: DriverRoundBreakdown[] = [...byMeeting.values()].map((round, idx) => {
    cumulative = Math.round((cumulative + round.pointsScored) * 10) / 10;
    return {
      ...round,
      index: idx + 1,
      cumulativePoints: cumulative,
    };
  });

  const trend: DriverBreakdownPayload['trend'] = [
    { label: 'Start', cumulative: 0 },
    ...rounds.map((r) => ({ label: r.roundLabel, cumulative: r.cumulativePoints })),
  ];

  const totalPoints = Math.round(champRow.points_current * 10) / 10;

  return {
    driverNumber,
    seasonYear,
    championshipPosition: champRow.position_current,
    driverName: formatDriverName(driverMeta.full_name),
    teamName: getTeamIdentity(driverMeta.team_name, seasonYear).fullName,
    countryCode: driverMeta.country_code ?? null,
    totalPoints,
    rounds,
    trend,
    meta: {
      source: 'live',
      error:
        champRes.meta.error || driversRes.meta.error
          ? [champRes.meta.error, driversRes.meta.error].filter(Boolean).join('; ')
          : undefined,
    },
  };
}
