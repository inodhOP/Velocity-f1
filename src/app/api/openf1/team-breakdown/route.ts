import { NextRequest, NextResponse } from 'next/server';

import { getTeamPointsBreakdown } from '@/lib/openf1/team-breakdown';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get('year');
  const teamName = req.nextUrl.searchParams.get('team_name');
  const sessionKey = req.nextUrl.searchParams.get('session_key');

  if (!year || !teamName || !sessionKey) {
    return NextResponse.json({ error: 'year, team_name, and session_key required' }, { status: 400 });
  }

  try {
    const payload = await getTeamPointsBreakdown(Number(year), teamName, Number(sessionKey));
    return NextResponse.json(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Team breakdown failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
