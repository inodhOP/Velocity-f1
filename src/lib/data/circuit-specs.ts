/**
 * Official lap length (km) by Ergast/Jolpica circuitId — used when API omits length.
 * Values align with FIA circuit data commonly published for each venue.
 */
const LENGTH_KM: Record<string, number> = {
  albert_park: 5.278,
  americas: 5.513,
  bahrain: 5.412,
  baku: 6.003,
  catalunya: 4.657,
  hungaroring: 4.381,
  imola: 4.909,
  interlagos: 4.309,
  jeddah: 6.174,
  las_vegas: 6.12,
  marina_bay: 5.063,
  monaco: 3.337,
  monza: 5.793,
  miami: 5.412,
  monaco_circuit: 3.337,
  paul_ricard: 5.842,
  red_bull_ring: 4.318,
  rodriguez: 4.304,
  sepang: 5.543,
  shanghai: 5.451,
  silverstone: 5.891,
  sochi: 5.848,
  spa: 7.004,
  suzuka: 5.807,
  villeneuve: 4.361,
  yas_marina: 5.281,
  zandvoort: 4.259,
  losail: 5.418,
};

export function circuitLengthKmForId(circuitId: string | undefined | null): number | null {
  if (!circuitId) return null;
  return LENGTH_KM[circuitId] ?? null;
}

export function formatKm(value: number) {
  return `${value.toFixed(3)} km`;
}

export function formatRaceDistanceKm(laps: number, lengthKm: number) {
  return `${Math.round(laps * lengthKm)} km`;
}
