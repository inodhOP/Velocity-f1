import { NextRequest, NextResponse } from "next/server";

import { getMockLaps } from "@/lib/openf1/mock-data";
import { fetchOpenF1Json } from "@/lib/openf1/server-fetch";
import type { OpenF1Lap } from "@/lib/openf1/types";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("session_key");
  const driverNumber = req.nextUrl.searchParams.get("driver_number");

  if (!sessionKey || !driverNumber) {
    return NextResponse.json(
      { error: "session_key and driver_number required" },
      { status: 400 },
    );
  }

  const sk = Number(sessionKey);
  const dn = Number(driverNumber);

  const { data, meta } = await fetchOpenF1Json<OpenF1Lap[]>(
    "/laps",
    { session_key: sk, driver_number: dn },
    300,
  );

  const timed = data.filter(
    (l) => typeof l.lap_duration === "number" && l.lap_duration > 0,
  );
  const nonPit = timed.filter((l) => !l.is_pit_out_lap);
  let laps = nonPit.length ? nonPit : timed;
  let source = meta.source;
  const error = meta.error;

  if (!laps.length) {
    source = "mock";
    laps = getMockLaps(sk, dn);
  }

  laps = [...laps].sort((a, b) => a.lap_number - b.lap_number);

  return NextResponse.json({
    laps,
    meta: { source, error },
  });
}
