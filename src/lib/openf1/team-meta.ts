const TEAM_NAME_MAP: Record<string, { short: string; full: string }> = {
  ferrari: {
    short: 'Ferrari',
    full: 'Scuderia Ferrari HP',
  },
  scuderiaferrari: {
    short: 'Ferrari',
    full: 'Scuderia Ferrari HP',
  },
  mclaren: {
    short: 'McLaren',
    full: 'McLaren Formula 1 Team',
  },
  mercedes: {
    short: 'Mercedes',
    full: 'Mercedes-AMG PETRONAS Formula One Team',
  },
  mercedesamgf1team: {
    short: 'Mercedes',
    full: 'Mercedes-AMG PETRONAS Formula One Team',
  },
  redbullracing: {
    short: 'Red Bull Racing',
    full: 'Oracle Red Bull Racing',
  },
  redbull: {
    short: 'Red Bull Racing',
    full: 'Oracle Red Bull Racing',
  },
  astonmartin: {
    short: 'Aston Martin',
    full: 'Aston Martin Aramco Formula One Team',
  },
  astonmartinaramcof1team: {
    short: 'Aston Martin',
    full: 'Aston Martin Aramco Formula One Team',
  },
  alpine: {
    short: 'Alpine',
    full: 'BWT Alpine Formula One Team',
  },
  williams: {
    short: 'Williams',
    full: 'Atlassian Williams Racing',
  },
  haas: {
    short: 'Haas',
    full: 'MoneyGram Haas F1 Team',
  },
  haasf1team: {
    short: 'Haas',
    full: 'MoneyGram Haas F1 Team',
  },
  rb: {
    short: 'Racing Bulls',
    full: 'Visa Cash App Racing Bulls Formula One Team',
  },
  racingbulls: {
    short: 'Racing Bulls',
    full: 'Visa Cash App Racing Bulls Formula One Team',
  },
  visacashapprb: {
    short: 'Racing Bulls',
    full: 'Visa Cash App Racing Bulls Formula One Team',
  },
  sauber: {
    short: 'Sauber',
    full: 'Stake F1 Team Kick Sauber',
  },
  kicksauber: {
    short: 'Sauber',
    full: 'Stake F1 Team Kick Sauber',
  },
  stakef1teamkicksauber: {
    short: 'Sauber',
    full: 'Stake F1 Team Kick Sauber',
  },
};

export function normalizeTeamName(team: string) {
  return team.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getTeamIdentity(team: string | null | undefined) {
  if (!team) {
    return { shortName: 'Unknown Team', fullName: 'Unknown Team' };
  }

  const mapped = TEAM_NAME_MAP[normalizeTeamName(team)];
  if (mapped) {
    return { shortName: mapped.short, fullName: mapped.full };
  }

  return { shortName: team, fullName: team };
}

export function formatDriverName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}
