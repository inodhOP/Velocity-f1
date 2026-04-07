import type { OpenF1Session } from "@/lib/openf1/types";

export type SessionVibe = "live" | "completed" | "upcoming";

export function getSessionVibe(session: OpenF1Session): SessionVibe {
  const now = Date.now();
  const start = new Date(session.date_start).getTime();
  const end = new Date(session.date_end).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "live";
}
