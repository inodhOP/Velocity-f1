/** Shared neon / glass chart styling (Recharts + CSS filters). */

export const NEON_AXIS_TICK = {
  fill: "rgba(161,161,170,0.88)",
  fontSize: 11,
};

export const NEON_GRID = "rgba(255,255,255,0.055)";

export const NEON_TOOLTIP = {
  backgroundColor: "rgba(15,15,18,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 12px 40px rgba(0,0,0,0.55), 0 0 1px rgba(255,255,255,0.2)",
};

/** SVG drop-shadow for stroke glow (inline style). */
export function neonStrokeGlow(hex: string, blur = 8) {
  const c = hex.replace("#", "");
  if (c.length !== 6) {
    return undefined;
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `drop-shadow(0 0 ${blur}px rgba(${r},${g},${b},0.85))`;
}
