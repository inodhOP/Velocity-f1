import { NextRequest, NextResponse } from "next/server";

import { downsampleEven } from "@/lib/openf1/downsample";
import { mockCarSeries } from "@/lib/openf1/mock-data";
import { fetchOpenF1Json } from "@/lib/openf1/server-fetch";
import type { OpenF1CarDatum } from "@/lib/openf1/types";

export const revalidate = 60;

const DEFAULT_MAX = 520;

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("session_key");
  const driverNumber = req.nextUrl.searchParams.get("driver_number");
  const maxRaw = req.nextUrl.searchParams.get("max_points");

  if (!sessionKey || !driverNumber) {
    return NextResponse.json(
      { error: "session_key and driver_number required" },
      { status: 400 },
    );
  }

  const sk = Number(sessionKey);
  const dn = Number(driverNumber);
  const maxPoints = Math.min(
    2000,
    Math.max(120, Number(maxRaw) || DEFAULT_MAX),
  );

  const { data, meta } = await fetchOpenF1Json<OpenF1CarDatum[]>(
    "/car_data",
    { session_key: sk, driver_number: dn },
    60,
  );

  let rows = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let source = meta.source;
  const error = meta.error;

  if (!rows.length) {
    source = "mock";
    rows = mockCarSeries(sk, dn, maxPoints);
  } else {
    rows = downsampleEven(rows, maxPoints);
  }

  const t0 = rows.length ? new Date(rows[0].date).getTime() : 0;
  const series = rows.map((r) => ({
    tSec: Math.round((new Date(r.date).getTime() - t0) / 100) / 10,
    speed: r.speed,
    throttle: r.throttle,
    brake: r.brake > 1 ? r.brake : r.brake * 100,
    rpm: r.rpm,
    gear: r.n_gear,
  }));

  return NextResponse.json({
    series,
    meta: { source, error, points: series.length },
  });
}
