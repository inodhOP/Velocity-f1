import 'server-only';

import { getMockTeamBreakdown } from './mock-data';
import { fetchOpenF1Json } from './server-fetch';
import { sessionsChronological } from './session-timeline';
import { formatDriverName, getTeamIdentity } from './team-meta';
import type {
  OpenF1ChampionshipRow,
  OpenF1ChampionshipTeamRow,
  OpenF1Driver,
  OpenF1SessionResult,
  TeamBreakdownPayload,
  TeamRoundBreakdown,
} from './types';

export async function getTeamPointsBreakdown(
  seasonYear: number,
  teamName: string,
  snapshotSessionKey: number,
): Promise<TeamBreakdownPayload> {
  const identity = getTeamIdentity(teamName, seasonYear);
  const [teamChampRes, driverChampRes, driversRes] = await Promise.all([
    fetchOpenF1Json<OpenF1ChampionshipTeamRow[]>('/championship_teams', { session_key: snapshotSessionKey }, 120),
    fetchOpenF1Json<OpenF1ChampionshipRow[]>('/championship_drivers', { session_key: snapshotSessionKey }, 120),
    fetchOpenF1Json<OpenF1Driver[]>('/drivers', { session_key: snapshotSessionKey }, 600),
  ]);

  const teamDrivers = driversRes.data.filter((driver) => getTeamIdentity(driver.team_name).fullName === identity.fullName);
  if (!teamDrivers.length) return getMockTeamBreakdown(teamName);

  const driverIds = new Set(teamDrivers.map((driver) => driver.driver_number));
  const driverPoints = driverChampRes.data.filter((row) => driverIds.has(row.driver_number));
  const teamChampRow = teamChampRes.data.find(
    (row) => getTeamIdentity(row.team_name, seasonYear).fullName === identity.fullName,
  );

  const sessionsAsc = await sessionsChronological(seasonYear);
  const endIdx = sessionsAsc.findIndex((s) => s.session_key === snapshotSessionKey);
  const timeline = sessionsAsc.slice(0, endIdx >= 0 ? endIdx + 1 : sessionsAsc.length);
  if (!timeline.length) return getMockTeamBreakdown(teamName);

  const results = await Promise.all(
    timeline.map((session) => fetchOpenF1Json<OpenF1SessionResult[]>('/session_result', { session_key: session.session_key }, 600)),
  );

  const byMeeting = new Map<number, TeamRoundBreakdown>();
  const driverMetaMap = new Map(teamDrivers.map((driver) => [driver.driver_number, driver]));
  let cumulative = 0;

  for (let index = 0; index < timeline.length; index++) {
    const session = timeline[index]!;
    const sessionRows = (results[index]?.data ?? []).filter((row) => driverIds.has(row.driver_number));
    if (!byMeeting.has(session.meeting_key)) {
      byMeeting.set(session.meeting_key, {
        index: byMeeting.size + 1,
        meetingKey: session.meeting_key,
        roundLabel: `${session.circuit_short_name} Grand Prix`,
        pointsScored: 0,
        cumulativePoints: cumulative,
        contributions: [],
      });
    }

    const round = byMeeting.get(session.meeting_key)!;
    for (const row of sessionRows) {
      const meta = driverMetaMap.get(row.driver_number);
      const points = Math.round(row.points * 10) / 10;
      round.pointsScored = Math.round((round.pointsScored + points) * 10) / 10;

      const existingContribution = round.contributions.find((item) => item.driverNumber === row.driver_number);
      if (existingContribution) {
        existingContribution.pointsScored = Math.round((existingContribution.pointsScored + points) * 10) / 10;
        if (session.session_type === 'Race' || existingContribution.racePosition == null) {
          existingContribution.racePosition = row.position ?? existingContribution.racePosition;
        }
      } else {
        round.contributions.push({
          driverNumber: row.driver_number,
          driverName: formatDriverName(meta?.full_name ?? `Driver ${row.driver_number}`),
          pointsScored: points,
          racePosition: row.position ?? null,
        });
      }
    }
  }

  const rounds = [...byMeeting.values()].map((round) => {
    cumulative = Math.round((cumulative + round.pointsScored) * 10) / 10;
    return {
      ...round,
      cumulativePoints: cumulative,
      contributions: round.contributions.sort((a, b) => b.pointsScored - a.pointsScored),
    };
  });

  return {
    teamName: identity.fullName,
    shortName: identity.shortName,
    teamColour: teamDrivers.find((driver) => driver.team_colour)?.team_colour?.replace('#', '') ?? '71717a',
    seasonYear,
    championshipPosition: teamChampRow?.position_current ?? 1,
    totalPoints: Math.round((teamChampRow?.points_current ?? driverPoints.reduce((sum, row) => sum + row.points_current, 0)) * 10) / 10,
    drivers: teamDrivers
      .map((driver) => ({
        driverNumber: driver.driver_number,
        driverName: formatDriverName(driver.full_name),
        points: Math.round((driverPoints.find((row) => row.driver_number === driver.driver_number)?.points_current ?? 0) * 10) / 10,
      }))
      .sort((a, b) => b.points - a.points),
    rounds,
    trend: [{ label: 'Start', cumulative: 0 }, ...rounds.map((round) => ({ label: round.roundLabel, cumulative: round.cumulativePoints }))],
    meta: {
      source: 'live',
      error: [teamChampRes.meta.error, driverChampRes.meta.error, driversRes.meta.error].filter(Boolean).join('; ') || undefined,
    },
  };
}
