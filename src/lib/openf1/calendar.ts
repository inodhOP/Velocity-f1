import 'server-only';

import { fetchOpenF1Json } from './server-fetch';
import { MOCK_SESSION } from './mock-data';
import type { CalendarRace, OpenF1Session, SeasonCalendarPayload } from './types';

const FACTS: Record<string, CalendarRace['facts']> = {
  melbourne: { firstGrandPrix: '1996', firstWinner: 'Damon Hill', lastWinner: 'Carlos Sainz', laps: '58', circuitLength: '5.278 km', raceDistance: '306.124 km', lapRecord: '1:19.813', lapRecordYear: '2024' },
  shanghai: { firstGrandPrix: '2004', firstWinner: 'Rubens Barrichello', lastWinner: 'Max Verstappen', laps: '56', circuitLength: '5.451 km', raceDistance: '305.066 km', lapRecord: '1:32.238', lapRecordYear: '2024' },
  suzuka: { firstGrandPrix: '1987', firstWinner: 'Gerhard Berger', lastWinner: 'Max Verstappen', laps: '53', circuitLength: '5.807 km', raceDistance: '307.471 km', lapRecord: '1:30.983', lapRecordYear: '2019' },
  sakhir: { firstGrandPrix: '2004', firstWinner: 'Michael Schumacher', lastWinner: 'Max Verstappen', laps: '57', circuitLength: '5.412 km', raceDistance: '308.238 km', lapRecord: '1:31.447', lapRecordYear: '2005' },
  jeddah: { firstGrandPrix: '2021', firstWinner: 'Lewis Hamilton', lastWinner: 'Max Verstappen', laps: '50', circuitLength: '6.174 km', raceDistance: '308.450 km', lapRecord: '1:30.734', lapRecordYear: '2021' },
  miami: { firstGrandPrix: '2022', firstWinner: 'Max Verstappen', lastWinner: 'Lando Norris', laps: '57', circuitLength: '5.412 km', raceDistance: '308.326 km', lapRecord: '1:29.708', lapRecordYear: '2023' },
};

const QUOTES: Record<string, string> = {
  melbourne: 'Fast walls, low grip, and a street-circuit rhythm that punishes tiny mistakes.',
  shanghai: 'A front-limited layout with a signature opening spiral and one of the longest back straights.',
  suzuka: 'High commitment through the esses and relentless flow from sector one to Spoon.',
  sakhir: 'Brake energy, rear traction, and tire management define the race under the lights.',
  jeddah: 'Precision at very high speed — one of the fastest street circuits in the world.',
  miami: 'Low-speed traction and cooling management matter as much as outright top speed.',
};

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function buildRace(session: OpenF1Session, index: number, currentSessionDate: number): CalendarRace {
  const key = session.circuit_short_name.toLowerCase();
  const facts = FACTS[key] ?? {
    firstGrandPrix: 'TBD', firstWinner: 'TBD', lastWinner: 'TBD', laps: 'TBD', circuitLength: 'TBD', raceDistance: 'TBD', lapRecord: 'TBD', lapRecordYear: '—',
  };

  return {
    sessionKey: session.session_key,
    round: index + 1,
    name: session.circuit_short_name,
    location: session.location,
    grandPrixName: `${session.country_name} Grand Prix ${session.year}`,
    dateLabel: formatDateLabel(session.date_start),
    status: new Date(session.date_start).getTime() <= currentSessionDate ? 'completed' : 'upcoming',
    circuitShortName: session.circuit_short_name,
    quote: QUOTES[key] ?? 'Historic circuit data is still loading for this round.',
    facts,
  };
}

export async function getSeasonCalendar(seasonYear: number, currentSession: OpenF1Session): Promise<SeasonCalendarPayload> {
  const racesRes = await fetchOpenF1Json<OpenF1Session[]>('/sessions', { year: seasonYear, session_type: 'Race' }, 1800);
  const source = racesRes.data.length ? 'live' : 'mock';
  const base = racesRes.data.length ? racesRes.data : [{ ...MOCK_SESSION, year: seasonYear }];
  const races = base
    .slice()
    .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())
    .map((session, index) => buildRace(session, index, new Date(currentSession.date_start).getTime()));

  return {
    seasonYear,
    currentRound: Math.max(1, races.filter((race) => race.status === 'completed').length),
    totalRounds: races.length,
    races,
    meta: { source, error: racesRes.meta.error },
  };
}
