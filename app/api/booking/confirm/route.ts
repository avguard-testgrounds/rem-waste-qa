import { NextRequest } from 'next/server';
import { BookingConfirmRequest, BookingConfirmResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<Response> {
  let body: Partial<BookingConfirmRequest>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid request body' }, { status: 400 });
  }

  const requiredFields: (keyof BookingConfirmRequest)[] = [
    'postcode', 'addressId', 'heavyWaste', 'plasterboard',
    'plasterboardOption', 'skipSize', 'price',
  ];

  for (const field of requiredFields) {
    // plasterboardOption is allowed to be null, but must be present as a key
    if (!(field in body)) {
      return Response.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const bookingId = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
  const payload: BookingConfirmResponse = { status: 'success', bookingId };
  return Response.json(payload);
}
