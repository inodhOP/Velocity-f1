export type SourceCoverage = {
  openf1: boolean;
  jolpica: boolean;
};

export type DriverProfile = {
  driverId: string;
  fullName: string;
  givenName?: string | null;
  familyName?: string | null;
  acronym?: string | null;
  permanentNumber?: number | null;
  teamName?: string | null;
  teamId?: string | null;
  nationality?: string | null;
  countryCode?: string | null;
  dateOfBirth?: string | null;
  sourceCoverage: SourceCoverage;
};

export type ConstructorProfile = {
  constructorId: string;
  name: string;
  displayName: string;
  nationality?: string | null;
  normalizedColor?: string | null;
  sourceCoverage: SourceCoverage;
};

export type CircuitProfile = {
  circuitId: string;
  meetingKey?: number | null;
  circuitName: string;
  circuitShortName?: string | null;
  locality?: string | null;
  country?: string | null;
  date?: string | null;
  firstGrandPrix?: string | null;
  laps?: string | null;
  circuitLength?: string | null;
  raceDistance?: string | null;
  lapRecord?: string | null;
  lapRecordYear?: string | null;
  firstWinner?: string | null;
  lastWinner?: string | null;
  sourceCoverage: SourceCoverage;
};
