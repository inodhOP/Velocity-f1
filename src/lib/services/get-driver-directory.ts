import { cache } from "react";

import { getJolpicaDriverStandings } from "@/lib/data-sources/jolpica/client";
import { mapJolpicaDriverToProfile } from "@/lib/data-sources/jolpica/mappers";
import type { DriverProfile } from "@/lib/domain/types";

export const getDriverDirectory = cache(async (year: number): Promise<DriverProfile[]> => {
  const jolpica = await getJolpicaDriverStandings(year);
  return jolpica.data.map(mapJolpicaDriverToProfile);
});
