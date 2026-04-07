/** Format seconds (e.g. 97.173) as F1-style lap time. */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  const body = s.toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${body}` : body;
}
