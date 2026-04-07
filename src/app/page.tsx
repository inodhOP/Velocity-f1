import { ChampionshipExperience } from "@/components/championship/championship-experience";
import { getSeasonCalendar } from "@/lib/openf1/calendar";
import { getChampionshipProgression } from "@/lib/openf1/championship-progression";
import { getLatestChampionship } from "@/lib/openf1/championship";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getLatestChampionship();
  const [progression, calendar] = await Promise.all([
    getChampionshipProgression(data.seasonYear, data.session.session_key),
    getSeasonCalendar(data.seasonYear, data.session),
  ]);

  return (
    <ChampionshipExperience
      data={data}
      progression={progression}
      calendar={calendar}
    />
  );
}
