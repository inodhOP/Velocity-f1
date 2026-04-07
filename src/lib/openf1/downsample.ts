/** Evenly reduce telemetry points for smooth charts without melting the browser. */
export function downsampleEven<T>(rows: T[], maxPoints: number): T[] {
  if (rows.length <= maxPoints || maxPoints < 2) return rows;
  const step = (rows.length - 1) / (maxPoints - 1);
  const out: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    out.push(rows[Math.round(i * step)]);
  }
  return out;
}
