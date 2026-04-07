import { normalizeName } from "@/lib/domain/normalize/shared";
import type { DriverProfile } from "@/lib/domain/types";

import type { JolpicaDriverStanding } from "./types";

export function mapJolpicaDriverToProfile(row: JolpicaDriverStanding): DriverProfile {
  const fullName = `${row.Driver.givenName} ${row.Driver.familyName}`.trim();
  return {
    driverId: row.Driver.driverId || normalizeName(fullName),
    fullName,
    givenName: row.Driver.givenName,
    familyName: row.Driver.familyName,
    acronym: row.Driver.code ?? null,
    permanentNumber: row.Driver.permanentNumber ? Number(row.Driver.permanentNumber) : null,
    teamName: row.Constructors[0]?.name ?? null,
    teamId: row.Constructors[0]?.constructorId ?? null,
    nationality: row.Driver.nationality ?? null,
    countryCode: null,
    dateOfBirth: row.Driver.dateOfBirth ?? null,
    sourceCoverage: { openf1: false, jolpica: true },
  };
}
