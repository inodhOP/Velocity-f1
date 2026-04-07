import { NextResponse } from "next/server";

import { getStandingsViewModel } from "@/lib/services/get-standings-view-model";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getStandingsViewModel();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Championship fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
