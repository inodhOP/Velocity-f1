import { cache } from "react";

import { getJolpicaCalendar } from "@/lib/data-sources/jolpica/client";
import type { JolpicaRace } from "@/lib/data-sources/jolpica/types";

export const getCalendarViewModel = cache(async (year: number): Promise<{ races: JolpicaRace[] }> => {
  const jolpica = await getJolpicaCalendar(year);
  return {
    races: jolpica.data,
  };
});
