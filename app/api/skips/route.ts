import { NextRequest } from 'next/server';
import { getSkips } from '@/fixtures/skips';
import { SkipsResponse } from '@/lib/types';

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const heavyWasteParam = searchParams.get('heavyWaste');

  if (heavyWasteParam === null) {
    return Response.json({ error: 'heavyWaste query parameter is required' }, { status: 400 });
  }

  const heavyWaste = heavyWasteParam === 'true';

  const payload: SkipsResponse = { skips: getSkips(heavyWaste) };
  return Response.json(payload);
}
