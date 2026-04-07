import { NextRequest, NextResponse } from "next/server";

import { MOCK_DRIVERS } from "@/lib/openf1/mock-data";
import { fetchOpenF1Json } from "@/lib/openf1/server-fetch";
import type { OpenF1Driver } from "@/lib/openf1/types";

export const revalidate = 600;

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("session_key");
  if (!sessionKey) {
    return NextResponse.json({ error: "session_key required" }, { status: 400 });
  }

  const sk = Number(sessionKey);
  const { data, meta } = await fetchOpenF1Json<OpenF1Driver[]>(
    "/drivers",
    { session_key: sk },
    600,
  );

  let drivers = data;
  let source = meta.source;
  const error = meta.error;

  if (!drivers.length) {
    source = "mock";
    drivers = MOCK_DRIVERS.map((d) => ({ ...d, session_key: sk }));
  }

  return NextResponse.json({
    drivers: drivers.sort((a, b) => a.driver_number - b.driver_number),
    meta: { source, error },
  });
}
