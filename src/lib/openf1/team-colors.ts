export const TEAM_COLOR_MAP: Record<string, string> = {
  ferrari: "#DC0000",
  scuderiaferrari: "#DC0000",
  mclaren: "#FF8700",
  mercedes: "#00D2BE",
  mercedesamgf1team: "#00D2BE",

  oracleredbullracing: "#1E41FF",
  scuderiaferrarihp: "#DC0000",
  mclarenformula1team: "#FF8700",
  mercedesamgpetronasformulaoneteam: "#00D2BE",
  astonmartinaramcoformulaoneteam: "#006F62",
  bwtalpineformulaoneteam: "#0090FF",
  atlassianwilliamsracing: "#005AFF",
  moneygramhaasf1team: "#B6BABD",
  visacashappracingbullsformulaoneteam: "#6692FF",
  redbullracing: "#1E41FF",
  redbull: "#1E41FF",
  redbullracinghonda: "#1E41FF",
  astonmartin: "#006F62",
  astonmartinaramcof1team: "#006F62",
  alpine: "#0090FF",
  williams: "#005AFF",
  haas: "#B6BABD",
  haasf1team: "#B6BABD",
  rb: "#6692FF",
  racingbulls: "#6692FF",
  visacashapprb: "#6692FF",
  alphatauri: "#6692FF",
  sauber: "#52E252",
  kicksauber: "#52E252",
  stakef1teamkicksauber: "#52E252",
};

function normalizeTeam(team: string) {
  return team.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function resolveTeamColor(team: string | null | undefined, fallback?: string) {
  if (team) {
    const mapped = TEAM_COLOR_MAP[normalizeTeam(team)];
    if (mapped) return mapped;
  }
  if (fallback) {
    return fallback.startsWith("#") ? fallback : `#${fallback}`;
  }
  return "#A1A1AA";
}

export function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "255,255,255";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
