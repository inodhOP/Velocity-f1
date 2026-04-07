import { NextRequest, NextResponse } from "next/server";

import { MOCK_WEATHER } from "@/lib/openf1/mock-data";
import { fetchOpenF1Json } from "@/lib/openf1/server-fetch";
import type { OpenF1Weather } from "@/lib/openf1/types";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const sessionKey = req.nextUrl.searchParams.get("session_key");
  if (!sessionKey) {
    return NextResponse.json({ error: "session_key required" }, { status: 400 });
  }

  const sk = Number(sessionKey);
  const { data, meta } = await fetchOpenF1Json<OpenF1Weather[]>(
    "/weather",
    { session_key: sk },
    300,
  );

  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  let weather = sorted[0];
  let source = meta.source;
  const error = meta.error;

  if (!weather) {
    source = "mock";
    weather = { ...MOCK_WEATHER, session_key: sk };
  }

  return NextResponse.json({
    weather,
    meta: { source, error },
  });
}
