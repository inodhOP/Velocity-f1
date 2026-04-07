import { normalizeName, normalizeTeamName } from "@/lib/domain/normalize/shared";
import type { DriverProfile } from "@/lib/domain/types";
import type { OpenF1Driver } from "@/lib/openf1/types";

function toCountryCode(nationality: string | null | undefined) {
  if (!nationality) return null;
  return nationality.slice(0, 3).toUpperCase();
}

function bestDriverMatch(openf1: OpenF1Driver, catalog: DriverProfile[]) {
  const byNumber = catalog.find(
    (d) => d.permanentNumber != null && d.permanentNumber === openf1.driver_number,
  );
  if (byNumber) return byNumber;

  const openF1Name = normalizeName(openf1.full_name);
  const byName = catalog.find((d) => normalizeName(d.fullName) === openF1Name);
  if (byName) return byName;

  return catalog.find(
    (d) =>
      (d.acronym ?? "").toUpperCase() === (openf1.name_acronym ?? "").toUpperCase() &&
      normalizeTeamName(d.teamName) === normalizeTeamName(openf1.team_name),
  );
}

export function enrichOpenF1Drivers(openf1Drivers: OpenF1Driver[], jolpicaProfiles: DriverProfile[]) {
  return openf1Drivers.map((driver) => {
    const matched = bestDriverMatch(driver, jolpicaProfiles);
    const countryCode =
      driver.country_code ??
      matched?.countryCode ??
      toCountryCode(matched?.nationality) ??
      null;
    return {
      ...driver,
      country_code: countryCode ?? undefined,
    };
  });
}
