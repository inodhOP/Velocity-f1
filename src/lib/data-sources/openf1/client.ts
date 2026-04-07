import { fetchOpenF1Json } from "@/lib/openf1/server-fetch";

import type { OpenF1DataSourceResponse } from "./types";

export async function fetchFromOpenF1<T>(
  pathWithLeadingSlash: string,
  searchParams?: Record<string, string | number | undefined>,
  revalidateSeconds = 120,
): Promise<OpenF1DataSourceResponse<T>> {
  return fetchOpenF1Json<T>(pathWithLeadingSlash, searchParams, revalidateSeconds);
}
