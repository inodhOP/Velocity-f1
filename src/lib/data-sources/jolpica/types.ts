export type JolpicaMeta = {
  source: "live" | "empty";
  error?: string;
};

export type JolpicaResponse<T> = {
  data: T;
  meta: JolpicaMeta;
};

export type JolpicaDriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    url?: string;
    givenName: string;
    familyName: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  Constructors: Array<{
    constructorId: string;
    name: string;
    nationality?: string;
  }>;
};

export type JolpicaConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  Constructor: {
    constructorId: string;
    name: string;
    nationality?: string;
  };
};

export type JolpicaRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
  Results?: Array<{
    position: string;
    laps?: string;
    Driver?: {
      givenName: string;
      familyName: string;
    };
    FastestLap?: {
      rank?: string;
      Time?: { time?: string };
    };
  }>;
};
