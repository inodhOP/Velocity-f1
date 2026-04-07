import { getChampionshipProgression, getConstructorsProgression } from "@/lib/openf1/championship-progression";

export async function getAnalyticsViewModel(year: number, sessionKey: number) {
  const [drivers, constructors] = await Promise.all([
    getChampionshipProgression(year, sessionKey),
    getConstructorsProgression(year, sessionKey),
  ]);

  return {
    drivers,
    constructors,
  };
}
