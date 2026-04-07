import { normalizeName } from "@/lib/domain/normalize/shared";
import type { DriverProfile } from "@/lib/domain/types";
import type { DriverStandingRow } from "@/lib/openf1/types";

function matchStandingDriver(row: DriverStandingRow, profiles: DriverProfile[]) {
  const byNumber = profiles.find(
    (p) => p.permanentNumber != null && p.permanentNumber === row.driverNumber,
  );
  if (byNumber) return byNumber;
  const byName = profiles.find((p) => normalizeName(p.fullName) === normalizeName(row.driverName));
  if (byName) return byName;
  return profiles.find((p) => (p.acronym ?? "").toUpperCase() === row.acronym.toUpperCase());
}

function toCountryCode(nationality: string | null | undefined) {
  if (!nationality) return null;
  return nationality.slice(0, 3).toUpperCase();
}

export function enrichStandingsNationality(
  standings: DriverStandingRow[],
  profiles: DriverProfile[],
) {
  return standings.map((row) => {
    const matched = matchStandingDriver(row, profiles);
    const countryCode =
      row.countryCode ??
      matched?.countryCode ??
      toCountryCode(matched?.nationality) ??
      null;
    return { ...row, countryCode };
  });
}
