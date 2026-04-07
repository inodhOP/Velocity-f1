import { NextResponse } from "next/server";

import { getLatestChampionship } from "@/lib/openf1/championship";

export const revalidate = 300;

export async function GET() {
  try {
    const data = await getLatestChampionship();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Championship fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
