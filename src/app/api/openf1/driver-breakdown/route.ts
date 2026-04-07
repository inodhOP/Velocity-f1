import { NextRequest, NextResponse } from "next/server";

import { getDriverPointsBreakdown } from "@/lib/openf1/driver-breakdown";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");
  const driverNumber = req.nextUrl.searchParams.get("driver_number");
  const sessionKey = req.nextUrl.searchParams.get("session_key");

  if (!year || !driverNumber || !sessionKey) {
    return NextResponse.json(
      { error: "year, driver_number, and session_key required" },
      { status: 400 },
    );
  }

  try {
    const payload = await getDriverPointsBreakdown(
      Number(year),
      Number(driverNumber),
      Number(sessionKey),
    );
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Breakdown failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
