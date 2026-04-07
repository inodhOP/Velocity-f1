import "server-only";

import { fetchOpenF1Json } from "./server-fetch";
import type { OpenF1Session } from "./types";

/** Race + sprint sessions for a season, oldest first. */
export async function sessionsChronological(
  year: number,
): Promise<OpenF1Session[]> {
  const [races, sprints] = await Promise.all([
    fetchOpenF1Json<OpenF1Session[]>(
      "/sessions",
      { year, session_type: "Race" },
      1800,
    ),
    fetchOpenF1Json<OpenF1Session[]>(
      "/sessions",
      { year, session_type: "Sprint" },
      1800,
    ),
  ]);
  const map = new Map<number, OpenF1Session>();
  for (const s of [...races.data, ...sprints.data]) {
    map.set(s.session_key, s);
  }
  return [...map.values()].sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}

/** Completed race sessions only, one per meeting, chronological (grand prix order). */
export async function raceSessionsOrdered(year: number): Promise<OpenF1Session[]> {
  const all = await sessionsChronological(year);
  const races = all.filter((s) => s.session_type === "Race");
  const byMeeting = new Map<number, OpenF1Session>();
  for (const s of races) {
    const existing = byMeeting.get(s.meeting_key);
    if (
      !existing ||
      new Date(s.date_start).getTime() > new Date(existing.date_start).getTime()
    ) {
      byMeeting.set(s.meeting_key, s);
    }
  }
  return [...byMeeting.values()].sort(
    (a, b) =>
      new Date(a.date_start).getTime() - new Date(b.date_start).getTime(),
  );
}
