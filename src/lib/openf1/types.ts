/** OpenF1 API response shapes (subset used by Velocity F1). */

export type OpenF1Session = {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  country_name: string;
  location: string;
  year: number;
};

export type OpenF1Driver = {
  session_key: number;
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  broadcast_name: string;
  country_code?: string;
  first_name?: string;
  last_name?: string;
};

export type OpenF1Lap = {
  session_key: number;
  driver_number: number;
  lap_number: number;
  date_start: string;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  is_pit_out_lap: boolean;
  st_speed?: number | null;
};

export type OpenF1CarDatum = {
  date: string;
  session_key: number;
  driver_number: number;
  speed: number;
  throttle: number;
  brake: number;
  rpm: number;
  n_gear: number;
};

export type OpenF1Weather = {
  date: string;
  session_key: number;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  wind_speed: number;
  rainfall: number;
};

export type OpenF1ChampionshipRow = {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
};

export type OpenF1ChampionshipTeamRow = {
  meeting_key: number;
  session_key: number;
  team_name: string;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
};

export type DriverStandingRow = {
  position: number;
  driverNumber: number;
  driverName: string;
  acronym: string;
  team: string;
  teamColour: string;
  points: number;
  pointsDelta: number | null;
  positionStart: number | null;
};

export type ConstructorStandingRow = {
  position: number;
  name: string;
  shortName: string;
  teamColour: string;
  points: number;
  pointsDelta?: number | null;
  positionStart?: number | null;
  drivers: { driverNumber: number; driverName: string; points: number }[];
};

export type CalendarRace = {
  sessionKey: number;
  round: number;
  name: string;
  location: string;
  grandPrixName: string;
  dateLabel: string;
  status: 'completed' | 'upcoming';
  circuitShortName: string;
  quote: string;
  facts: {
    firstGrandPrix: string;
    firstWinner: string;
    lastWinner: string;
    laps: string;
    circuitLength: string;
    raceDistance: string;
    lapRecord: string;
    lapRecordYear: string;
  };
};

export type SeasonCalendarPayload = {
  seasonYear: number;
  currentRound: number;
  totalRounds: number;
  races: CalendarRace[];
  meta: { source: 'live' | 'mock'; error?: string };
};

export type ChampionshipPayload = {
  seasonYear: number;
  session: OpenF1Session;
  driverStandings: DriverStandingRow[];
  constructorStandings: ConstructorStandingRow[];
  meta: { source: 'live' | 'mock'; error?: string };
};

export type ProgressionChartRow = Record<string, string | number>;

export type ProgressionSeriesMeta = {
  dataKey: string;
  label: string;
  color: string;
};

export type ProgressionPayload = {
  chartData: ProgressionChartRow[];
  series: ProgressionSeriesMeta[];
  completedRounds: number;
  totalRounds: number;
  meta: { source: 'live' | 'mock'; error?: string };
};

export type OpenF1SessionResult = {
  position: number | null;
  driver_number: number;
  points: number;
  dnf: boolean;
  dns: boolean;
  session_key: number;
};

export type DriverRoundBreakdown = {
  index: number;
  meetingKey: number;
  sessionKey: number;
  roundLabel: string;
  sessionType: string;
  racePosition: number | null;
  pointsScored: number;
  cumulativePoints: number;
};

export type DriverBreakdownPayload = {
  driverNumber: number;
  seasonYear: number;
  championshipPosition: number;
  driverName: string;
  teamName: string;
  countryCode: string | null;
  totalPoints: number;
  rounds: DriverRoundBreakdown[];
  trend: { label: string; cumulative: number }[];
  meta: { source: 'live' | 'mock'; error?: string };
};

export type TeamRoundContribution = {
  driverNumber: number;
  driverName: string;
  pointsScored: number;
  racePosition: number | null;
};

export type TeamRoundBreakdown = {
  index: number;
  meetingKey: number;
  roundLabel: string;
  pointsScored: number;
  cumulativePoints: number;
  contributions: TeamRoundContribution[];
};

export type TeamBreakdownPayload = {
  teamName: string;
  shortName: string;
  teamColour: string;
  seasonYear: number;
  championshipPosition: number;
  totalPoints: number;
  drivers: { driverNumber: number; driverName: string; points: number }[];
  rounds: TeamRoundBreakdown[];
  trend: { label: string; cumulative: number }[];
  meta: { source: 'live' | 'mock'; error?: string };
};
