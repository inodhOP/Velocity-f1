export function normalizeName(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const TEAM_ALIASES: Record<string, string> = {
  redbullracing: "oracleredbullracing",
  redbull: "oracleredbullracing",
  ferrari: "scuderiaferrarihp",
  scuderiaferrari: "scuderiaferrarihp",
  mclaren: "mclarenformula1team",
  mercedes: "mercedesamgpetronasformulaoneteam",
  mercedesamgf1team: "mercedesamgpetronasformulaoneteam",
  astonmartin: "astonmartinaramcoformulaoneteam",
  alpine: "bwtalpineformulaoneteam",
  williams: "atlassianwilliamsracing",
  haas: "moneygramhaasf1team",
  rb: "visacashappracingbullsformulaoneteam",
  racingbulls: "visacashappracingbullsformulaoneteam",
  sauber: "stakef1teamkicksauber",
  kicksauber: "stakef1teamkicksauber",
};

export function normalizeTeamName(value: string | null | undefined) {
  const normalized = normalizeName(value);
  return TEAM_ALIASES[normalized] ?? normalized;
}

const CIRCUIT_ALIASES: Record<string, string> = {
  shanghaigp: "shanghaiinternationalcircuit",
  bahrainingrandprix: "bahraininternationalcircuit",
  sahkir: "bahraininternationalcircuit",
};

export function normalizeCircuitName(value: string | null | undefined) {
  const normalized = normalizeName(value);
  return CIRCUIT_ALIASES[normalized] ?? normalized;
}
