import { NextRequest } from 'next/server';
import {
  SW1A_1AA_ADDRESSES,
  BS1_4DJ_ADDRESSES,
  getBs14djResponse,
} from '@/fixtures/postcodes';
import { PostcodeLookupResponse } from '@/lib/types';

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i;

function normalise(postcode: string): string {
  return postcode.replace(/\s+/g, '').toUpperCase();
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: { postcode?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'postcode is required' }, { status: 400 });
  }

  if (!body.postcode || typeof body.postcode !== 'string' || body.postcode.trim() === '') {
    return Response.json({ error: 'postcode is required' }, { status: 400 });
  }

  const raw = body.postcode.trim();

  if (!UK_POSTCODE_REGEX.test(raw)) {
    return Response.json({ error: 'invalid UK postcode format' }, { status: 422 });
  }

  const norm = normalise(raw);

  // SW1A 1AA — 12 addresses, immediate
  if (norm === 'SW1A1AA') {
    const payload: PostcodeLookupResponse = { postcode: raw, addresses: SW1A_1AA_ADDRESSES };
    return Response.json(payload);
  }

  // EC1A 1BB — 0 addresses, immediate
  if (norm === 'EC1A1BB') {
    const payload: PostcodeLookupResponse = { postcode: raw, addresses: [] };
    return Response.json(payload);
  }

  // M1 1AE — 1500 ms delay then empty (no fixture addresses defined)
  if (norm === 'M11AE') {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const payload: PostcodeLookupResponse = { postcode: raw, addresses: [] };
    return Response.json(payload);
  }

  // BS1 4DJ — 500 on first call, 200 + addresses on retry
  if (norm === 'BS14DJ') {
    const { shouldFail } = getBs14djResponse();
    if (shouldFail) {
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
    const payload: PostcodeLookupResponse = { postcode: raw, addresses: BS1_4DJ_ADDRESSES };
    return Response.json(payload);
  }

  // Any other valid postcode — empty addresses
  const payload: PostcodeLookupResponse = { postcode: raw, addresses: [] };
  return Response.json(payload);
}
