import { NextRequest } from 'next/server';
import { WasteTypesRequest, WasteTypesResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<Response> {
  let body: Partial<WasteTypesRequest>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid request body' }, { status: 400 });
  }

  if (
    typeof body.heavyWaste !== 'boolean' ||
    typeof body.plasterboard !== 'boolean'
  ) {
    return Response.json({ error: 'heavyWaste and plasterboard are required' }, { status: 400 });
  }

  if (body.plasterboard === true && !body.plasterboardOption) {
    return Response.json({ error: 'plasterboard option required' }, { status: 400 });
  }

  const payload: WasteTypesResponse = { ok: true };
  return Response.json(payload);
}
