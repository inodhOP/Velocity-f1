import 'server-only';

import { fetchOpenF1Json } from './server-fetch';
import { MOCK_SESSION } from './mock-data';
import { enrichCircuitProfiles } from '@/lib/enrichment/enrich-calendar';
import type { JolpicaRace } from '@/lib/data-sources/jolpica/types';
import type { CalendarRace, OpenF1Session, SeasonCalendarPayload } from './types';

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function fallbackFact(value?: string | null) {
  return value && value.trim().length > 0 ? value : "N/A";
}

function buildCircuitQuote(
  session: OpenF1Session,
  p: Awaited<ReturnType<typeof enrichCircuitProfiles>>[number] | undefined,
): string {
  if (!p) return `${session.country_name} Grand Prix — ${session.location}.`;

  const name = p.circuitName;
  const loc = [p.locality, p.country].filter(Boolean).join(", ");

  if (p.firstGrandPrix && p.laps && p.raceDistance) {
    return `${name} — on the calendar since ${p.firstGrandPrix}; ${p.laps} laps covering ${p.raceDistance}.`;
  }
  if (p.firstGrandPrix && p.laps && p.circuitLength) {
    return `${name} — first used in ${p.firstGrandPrix}; ${p.laps} laps at ${p.circuitLength}.`;
  }
  if (p.circuitLength && p.laps && p.raceDistance) {
    return `${name} — ${p.laps} laps at ${p.circuitLength} (${p.raceDistance}).`;
  }
  if (p.firstGrandPrix && loc) {
    return `${name} — introduced in ${p.firstGrandPrix}, ${loc}.`;
  }
  if (loc) {
    return `${name} — ${session.country_name} Grand Prix; ${loc}.`;
  }
  return `${name} — ${session.country_name} Grand Prix.`;
}

function buildRace(
  session: OpenF1Session,
  circuitProfile: Awaited<ReturnType<typeof enrichCircuitProfiles>>[number] | undefined,
  index: number,
  currentSessionDate: number,
): CalendarRace {
  const facts: CalendarRace['facts'] = {
    firstGrandPrix: fallbackFact(circuitProfile?.firstGrandPrix),
    firstWinner: fallbackFact(circuitProfile?.firstWinner),
    lastWinner: fallbackFact(circuitProfile?.lastWinner),
    laps: fallbackFact(circuitProfile?.laps),
    circuitLength: fallbackFact(circuitProfile?.circuitLength),
    raceDistance: fallbackFact(circuitProfile?.raceDistance),
    lapRecord: fallbackFact(circuitProfile?.lapRecord),
    lapRecordYear: circuitProfile?.lapRecordYear && circuitProfile.lapRecordYear.trim().length > 0
      ? circuitProfile.lapRecordYear
      : "—",
  };

  return {
    sessionKey: session.session_key,
    round: index + 1,
    name: circuitProfile?.circuitName ?? session.circuit_short_name,
    location: circuitProfile?.locality ?? session.location,
    grandPrixName: `${session.country_name} Grand Prix ${session.year}`,
    dateLabel: formatDateLabel(session.date_start),
    status: new Date(session.date_start).getTime() <= currentSessionDate ? 'completed' : 'upcoming',
    circuitShortName: session.circuit_short_name,
    quote: buildCircuitQuote(session, circuitProfile),
    facts,
  };
}

function dedupeByMeeting(sessions: OpenF1Session[]) {
  const byMeeting = new Map<number, OpenF1Session>();
  for (const session of sessions) {
    const existing = byMeeting.get(session.meeting_key);
    if (!existing || new Date(session.date_start).getTime() > new Date(existing.date_start).getTime()) {
      byMeeting.set(session.meeting_key, session);
    }
  }
  return [...byMeeting.values()];
}

export async function getSeasonCalendar(
  seasonYear: number,
  currentSession: OpenF1Session,
  jolpicaRaces: JolpicaRace[],
): Promise<SeasonCalendarPayload> {
  const racesRes = await fetchOpenF1Json<OpenF1Session[]>('/sessions', { year: seasonYear, session_type: 'Race' }, 1800);
  const source = racesRes.data.length ? 'live' : 'mock';
  const base = racesRes.data.length ? dedupeByMeeting(racesRes.data) : [{ ...MOCK_SESSION, year: seasonYear }];
  const enrichedCircuits = await enrichCircuitProfiles(base, jolpicaRaces);
  const byMeeting = new Map(enrichedCircuits.map((c) => [c.meetingKey, c]));
  const races = base
    .slice()
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .map((session, index) =>
      buildRace(
        session,
        byMeeting.get(session.meeting_key),
        index,
        new Date(currentSession.date_start).getTime(),
      ),
    );

  return {
    seasonYear,
    currentRound: Math.max(1, races.filter((race) => race.status === 'completed').length),
    totalRounds: races.length,
    races,
    meta: { source, error: racesRes.meta.error },
  };
}
