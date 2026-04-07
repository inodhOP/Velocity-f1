import { getDriverDirectory } from "@/lib/services/get-driver-directory";
import { enrichStandingsNationality } from "@/lib/enrichment/enrich-standings";
import { getLatestChampionship } from "@/lib/openf1/championship";

export async function getStandingsViewModel() {
  const data = await getLatestChampionship();
  const directory = await getDriverDirectory(data.seasonYear);
  return {
    ...data,
    driverStandings: enrichStandingsNationality(data.driverStandings, directory),
  };
}
