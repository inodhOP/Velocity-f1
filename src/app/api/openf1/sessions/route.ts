import { NextResponse } from 'next/server';

import type { OpenF1Session } from '@/lib/openf1/types';
import { MOCK_SESSION } from '@/lib/openf1/mock-data';
import { fetchOpenF1Json } from '@/lib/openf1/server-fetch';

export const revalidate = 3600;

function mergeSessions(results: Awaited<ReturnType<typeof fetchOpenF1Json<OpenF1Session[]>>>[]): OpenF1Session[] {
  const map = new Map<number, OpenF1Session>();
  for (const result of results) {
    for (const session of result.data) map.set(session.session_key, session);
  }
  return [...map.values()].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
}

export async function GET() {
  const year = new Date().getFullYear();
  const years = [year, year - 1, year - 2];
  const types = ['Race', 'Sprint'];

  const results = await Promise.all(
    years.flatMap((seasonYear) => types.map((session_type) => fetchOpenF1Json<OpenF1Session[]>('/sessions', { year: seasonYear, session_type }, 3600))),
  );

  let sessions = mergeSessions(results).slice(0, 150);
  let source: 'live' | 'mock' = results.some((result) => result.meta.source === 'live' && result.data.length > 0) ? 'live' : 'mock';
  let error = results.map((result) => result.meta.error).filter(Boolean)[0];

  if (!sessions.length) {
    source = 'mock';
    sessions = [MOCK_SESSION];
  }

  return NextResponse.json({ sessions, meta: { source, error } });
}
