import { OPENF1_BASE } from "./constants";

export type FetchMeta = { source: "live" | "mock"; error?: string };

export async function fetchOpenF1Json<T>(
  pathWithLeadingSlash: string,
  searchParams?: Record<string, string | number | undefined>,
  revalidateSeconds = 120,
): Promise<{ data: T; meta: FetchMeta }> {
  const url = new URL(`${OPENF1_BASE}${pathWithLeadingSlash}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: revalidateSeconds },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`OpenF1 ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as T;
    return { data, meta: { source: "live" } };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      data: [] as unknown as T,
      meta: { source: "mock", error: message },
    };
  }
}
