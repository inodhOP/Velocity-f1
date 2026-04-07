import type {
  ChampionshipPayload,
  DriverBreakdownPayload,
  DriverRoundBreakdown,
  DriverStandingRow,
  OpenF1CarDatum,
  OpenF1Driver,
  OpenF1Lap,
  OpenF1Session,
  OpenF1Weather,
  ProgressionPayload,
  TeamBreakdownPayload,
  TeamRoundBreakdown,
} from './types';
import { formatDriverName, getTeamIdentity } from './team-meta';

/** Stable mock session when OpenF1 is unreachable. */
export const MOCK_SESSION: OpenF1Session = {
  session_key: 9472,
  session_type: 'Race',
  session_name: 'Race',
  date_start: '2024-03-02T15:00:00+00:00',
  date_end: '2024-03-02T17:00:00+00:00',
  meeting_key: 1229,
  circuit_key: 63,
  circuit_short_name: 'Sakhir',
  country_name: 'Bahrain',
  location: 'Sakhir',
  year: 2024,
};

export const MOCK_DRIVERS: OpenF1Driver[] = [
  {
    session_key: MOCK_SESSION.session_key,
    driver_number: 1,
    full_name: 'Max VERSTAPPEN',
    name_acronym: 'VER',
    team_name: 'Oracle Red Bull Racing',
    team_colour: '3671c6',
    broadcast_name: 'M VERSTAPPEN',
    country_code: 'NL',
  },
  {
    session_key: MOCK_SESSION.session_key,
    driver_number: 4,
    full_name: 'Lando NORRIS',
    name_acronym: 'NOR',
    team_name: 'McLaren Formula 1 Team',
    team_colour: 'ff8000',
    broadcast_name: 'L NORRIS',
    country_code: 'GB',
  },
  {
    session_key: MOCK_SESSION.session_key,
    driver_number: 16,
    full_name: 'Charles LECLERC',
    name_acronym: 'LEC',
    team_name: 'Scuderia Ferrari HP',
    team_colour: 'e8002d',
    broadcast_name: 'C LECLERC',
    country_code: 'MC',
  },
];

function mockLaps(driverNumber: number, base: number, spread: number): OpenF1Lap[] {
  const laps: OpenF1Lap[] = [];
  for (let lap = 1; lap <= 18; lap++) {
    const jitter = (Math.sin(lap * 0.7) + Math.random() * 0.4) * spread;
    const dur = base + jitter;
    const s1 = dur * 0.32;
    const s2 = dur * 0.41;
    const s3 = dur - s1 - s2;
    laps.push({
      session_key: MOCK_SESSION.session_key,
      driver_number: driverNumber,
      lap_number: lap,
      date_start: new Date(Date.now() - (18 - lap) * 100000).toISOString(),
      lap_duration: Math.round(dur * 1000) / 1000,
      duration_sector_1: Math.round(s1 * 1000) / 1000,
      duration_sector_2: Math.round(s2 * 1000) / 1000,
      duration_sector_3: Math.round(s3 * 1000) / 1000,
      is_pit_out_lap: lap === 1,
      st_speed: 310 + Math.round(Math.random() * 15),
    });
  }
  return laps;
}

export const MOCK_LAPS_BY_DRIVER: Record<number, OpenF1Lap[]> = {
  1: mockLaps(1, 96.2, 0.85),
  4: mockLaps(4, 96.9, 0.9),
  16: mockLaps(16, 97.1, 0.9),
};

export function getMockLaps(sessionKey: number, driverNumber: number): OpenF1Lap[] {
  if (sessionKey !== MOCK_SESSION.session_key) {
    return mockLaps(driverNumber, 97.0, 1.0);
  }
  return MOCK_LAPS_BY_DRIVER[driverNumber] ?? mockLaps(driverNumber, 97.5, 1.0);
}

export function mockCarSeries(sessionKey: number, driverNumber: number, points = 400): OpenF1CarDatum[] {
  const start = Date.now() - points * 50;
  const out: OpenF1CarDatum[] = [];
  for (let i = 0; i < points; i++) {
    const t = start + i * 50;
    const phase = i / 40;
    const speed = Math.max(0, 85 + Math.sin(phase) * 110 + Math.sin(phase * 3) * 25);
    const throttle = speed > 120 ? 85 + Math.sin(phase * 2) * 12 : speed * 0.85;
    const brake = speed < 45 && i % 20 < 8 ? 1 : 0;
    out.push({
      date: new Date(t).toISOString(),
      session_key: sessionKey,
      driver_number: driverNumber,
      speed: Math.round(speed),
      throttle: Math.min(100, Math.round(throttle)),
      brake,
      rpm: Math.min(15000, Math.round(8000 + speed * 35)),
      n_gear: Math.min(8, 2 + Math.round(speed / 45)),
    });
  }
  return out;
}

export const MOCK_WEATHER: OpenF1Weather = {
  date: MOCK_SESSION.date_start,
  session_key: MOCK_SESSION.session_key,
  air_temperature: 18.9,
  track_temperature: 26.5,
  humidity: 46,
  wind_speed: 0.9,
  rainfall: 0,
};

/** Fallback championship when OpenF1 is unavailable. */
export function getMockChampionshipPayload(): ChampionshipPayload {
  const driverStandings: DriverStandingRow[] = [
    {
      position: 1,
      driverNumber: 1,
      driverName: formatDriverName('Max VERSTAPPEN'),
      acronym: 'VER',
      countryCode: 'NL',
      team: 'Oracle Red Bull Racing',
      teamColour: '3671c6',
      points: 51,
      pointsDelta: 18,
      positionStart: 2,
    },
    {
      position: 2,
      driverNumber: 4,
      driverName: formatDriverName('Lando NORRIS'),
      acronym: 'NOR',
      countryCode: 'GB',
      team: 'McLaren Formula 1 Team',
      teamColour: 'ff8000',
      points: 49,
      pointsDelta: 25,
      positionStart: 1,
    },
    {
      position: 3,
      driverNumber: 16,
      driverName: formatDriverName('Charles LECLERC'),
      acronym: 'LEC',
      countryCode: 'MC',
      team: 'Scuderia Ferrari HP',
      teamColour: 'e8002d',
      points: 32,
      pointsDelta: 15,
      positionStart: 4,
    },
    {
      position: 4,
      driverNumber: 55,
      driverName: formatDriverName('Carlos SAINZ'),
      acronym: 'SAI',
      countryCode: 'ES',
      team: 'Scuderia Ferrari HP',
      teamColour: 'e8002d',
      points: 28,
      pointsDelta: 12,
      positionStart: 3,
    },
    {
      position: 5,
      driverNumber: 63,
      driverName: formatDriverName('George RUSSELL'),
      acronym: 'RUS',
      countryCode: 'GB',
      team: 'Mercedes-AMG PETRONAS Formula One Team',
      teamColour: '27f4d2',
      points: 24,
      pointsDelta: 10,
      positionStart: 5,
    },
  ];

  const constructors = [
    {
      position: 1,
      name: 'Oracle Red Bull Racing',
      shortName: 'Red Bull Racing',
      teamColour: '3671c6',
      points: 51,
      drivers: [{ driverNumber: 1, driverName: formatDriverName('Max VERSTAPPEN'), points: 51 }],
    },
    {
      position: 2,
      name: 'McLaren Formula 1 Team',
      shortName: 'McLaren',
      teamColour: 'ff8000',
      points: 49,
      drivers: [{ driverNumber: 4, driverName: formatDriverName('Lando NORRIS'), points: 49 }],
    },
    {
      position: 3,
      name: 'Scuderia Ferrari HP',
      shortName: 'Ferrari',
      teamColour: 'e8002d',
      points: 60,
      drivers: [
        { driverNumber: 16, driverName: formatDriverName('Charles LECLERC'), points: 32 },
        { driverNumber: 55, driverName: formatDriverName('Carlos SAINZ'), points: 28 },
      ],
    },
    {
      position: 4,
      name: 'Mercedes-AMG PETRONAS Formula One Team',
      shortName: 'Mercedes',
      teamColour: '27f4d2',
      points: 24,
      drivers: [{ driverNumber: 63, driverName: formatDriverName('George RUSSELL'), points: 24 }],
    },
  ];

  return {
    seasonYear: MOCK_SESSION.year,
    session: MOCK_SESSION,
    driverStandings,
    constructorStandings: constructors,
    meta: { source: 'mock', error: undefined },
  };
}

/** Demo driver detail modal when session_result / roster is unavailable. */
export function getMockDriverBreakdown(driverNumber: number): DriverBreakdownPayload {
  const identity = driverNumber === 16 ? getTeamIdentity('Ferrari') : getTeamIdentity('Mercedes');
  const rounds: DriverRoundBreakdown[] = [
    {
      index: 1,
      meetingKey: 101,
      sessionKey: 101,
      roundLabel: 'Bahrain Grand Prix',
      sessionType: 'Weekend',
      racePosition: 3,
      pointsScored: 15,
      cumulativePoints: 15,
    },
    {
      index: 2,
      meetingKey: 102,
      sessionKey: 102,
      roundLabel: 'Saudi Arabian Grand Prix',
      sessionType: 'Weekend',
      racePosition: 2,
      pointsScored: 18,
      cumulativePoints: 33,
    },
    {
      index: 3,
      meetingKey: 103,
      sessionKey: 103,
      roundLabel: 'Australian Grand Prix',
      sessionType: 'Weekend',
      racePosition: 1,
      pointsScored: 25,
      cumulativePoints: 58,
    },
  ];

  return {
    driverNumber,
    seasonYear: 2026,
    championshipPosition: 3,
    driverName: driverNumber === 16 ? 'Charles Leclerc' : 'George Russell',
    teamName: identity.fullName,
    countryCode: driverNumber === 16 ? 'MC' : 'GB',
    totalPoints: 58,
    rounds,
    trend: [{ label: 'Start', cumulative: 0 }, ...rounds.map((r) => ({ label: r.roundLabel, cumulative: r.cumulativePoints }))],
    meta: { source: 'mock' },
  };
}

export function getMockTeamBreakdown(teamName: string): TeamBreakdownPayload {
  const identity = getTeamIdentity(teamName);
  const rounds: TeamRoundBreakdown[] = [
    {
      index: 1,
      meetingKey: 201,
      roundLabel: 'Bahrain Grand Prix',
      pointsScored: 22,
      cumulativePoints: 22,
      contributions: [
        { driverNumber: 12, driverName: 'Kimi Antonelli', pointsScored: 12, racePosition: 4 },
        { driverNumber: 63, driverName: 'George Russell', pointsScored: 10, racePosition: 5 },
      ],
    },
    {
      index: 2,
      meetingKey: 202,
      roundLabel: 'Saudi Arabian Grand Prix',
      pointsScored: 24,
      cumulativePoints: 46,
      contributions: [
        { driverNumber: 12, driverName: 'Kimi Antonelli', pointsScored: 18, racePosition: 2 },
        { driverNumber: 63, driverName: 'George Russell', pointsScored: 6, racePosition: 7 },
      ],
    },
    {
      index: 3,
      meetingKey: 203,
      roundLabel: 'Australian Grand Prix',
      pointsScored: 26,
      cumulativePoints: 72,
      contributions: [
        { driverNumber: 12, driverName: 'Kimi Antonelli', pointsScored: 25, racePosition: 1 },
        { driverNumber: 63, driverName: 'George Russell', pointsScored: 1, racePosition: 10 },
      ],
    },
  ];

  return {
    teamName: identity.fullName,
    shortName: identity.shortName,
    teamColour: teamName.toLowerCase().includes('ferrari') ? 'e8002d' : '27f4d2',
    seasonYear: 2026,
    championshipPosition: 1,
    totalPoints: rounds.at(-1)?.cumulativePoints ?? 0,
    drivers: [
      { driverNumber: 12, driverName: 'Kimi Antonelli', points: 55 },
      { driverNumber: 63, driverName: 'George Russell', points: 17 },
    ],
    rounds,
    trend: [{ label: 'Start', cumulative: 0 }, ...rounds.map((r) => ({ label: r.roundLabel, cumulative: r.cumulativePoints }))],
    meta: { source: 'mock' },
  };
}

/** Demo cumulative points curve (matches reference aesthetic when API can’t build history). */
export function getMockProgressionPayload(): ProgressionPayload {
  const chartData: ProgressionPayload['chartData'] = [
    { round: 'Start', s0: 0, s1: 0, s2: 0 },
    { round: 'Bahrain GP', s0: 25, s1: 18, s2: 15 },
    { round: 'Saudi Arabian GP', s0: 43, s1: 27, s2: 30 },
    { round: 'Australian GP', s0: 58, s1: 36, s2: 40 },
  ];
  return {
    chartData,
    series: [
      { dataKey: 's0', label: 'VERSTAPPEN', color: '#3671c6' },
      { dataKey: 's1', label: 'NORRIS', color: '#ff8000' },
      { dataKey: 's2', label: 'LECLERC', color: '#e8002d' },
    ],
    completedRounds: 3,
    totalRounds: 24,
    meta: { source: 'mock' },
  };
}
