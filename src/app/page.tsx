import { ChampionshipExperience } from "@/components/championship/championship-experience";
import { getSeasonCalendar } from "@/lib/openf1/calendar";
import { getAnalyticsViewModel } from "@/lib/services/get-analytics-view-model";
import { getCalendarViewModel } from "@/lib/services/get-calendar-view-model";
import { getStandingsViewModel } from "@/lib/services/get-standings-view-model";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getStandingsViewModel();
  const [analytics, calendarDirectory] = await Promise.all([
    getAnalyticsViewModel(data.seasonYear, data.session.session_key),
    getCalendarViewModel(data.seasonYear),
  ]);
  const calendar = await getSeasonCalendar(
    data.seasonYear,
    data.session,
    calendarDirectory.races,
  );

  return (
    <ChampionshipExperience
      data={data}
      progression={analytics.drivers}
      constructorsProgression={analytics.constructors}
      calendar={calendar}
    />
  );
}
