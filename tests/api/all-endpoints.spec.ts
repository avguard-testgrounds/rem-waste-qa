import { test, expect } from '@playwright/test';
import { ApiClient } from '../helpers/ApiClient';
import { POSTCODES } from '../../fixtures/testData';

// ── /api/postcode/lookup ──────────────────────────────────────────────────────

test.describe('@regression API — /api/postcode/lookup', () => {
  test('SW1A 1AA returns 200 with 12 addresses', async ({ request }) => {
    const client = new ApiClient(request);
    const res = await client.postcodeLookup(POSTCODES.valid.sw1a);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.postcode).toBe(POSTCODES.valid.sw1a);
    expect(body.addresses).toHaveLength(12);
    expect(body.addresses[0]).toMatchObject({ id: expect.any(String), line1: expect.any(String), city: expect.any(String) });
  });

  test('EC1A 1BB returns 200 with 0 addresses', async ({ request }) => {
    const res = await new ApiClient(request).postcodeLookup(POSTCODES.valid.ec1a);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.addresses).toHaveLength(0);
  });

  test('missing postcode returns 400', async ({ request }) => {
    const res = await request.post('/api/postcode/lookup', { data: {} });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('postcode is required');
  });

  test('invalid postcode format returns 422', async ({ request }) => {
    const res = await new ApiClient(request).postcodeLookup(POSTCODES.invalid.wrongFormat);
    expect(res.status()).toBe(422);
    expect((await res.json()).error).toBe('invalid UK postcode format');
  });

  test('XSS input returns 422', async ({ request }) => {
    const res = await new ApiClient(request).postcodeLookup(POSTCODES.invalid.xss);
    expect(res.status()).toBe(422);
  });

  test('BS1 4DJ — first call returns 500, second call returns 200 with 3 addresses', async ({ request }) => {
    const client = new ApiClient(request);
    const first = await client.postcodeLookup(POSTCODES.valid.bs1);
    expect(first.status()).toBe(500);

    const second = await client.postcodeLookup(POSTCODES.valid.bs1);
    expect(second.status()).toBe(200);
    const body = await second.json();
    expect(body.addresses).toHaveLength(3);
  });
});

// ── /api/waste-types ─────────────────────────────────────────────────────────

test.describe('@regression API — /api/waste-types', () => {
  test('general waste returns { ok: true }', async ({ request }) => {
    const res = await new ApiClient(request).wasteTypes({ heavyWaste: false, plasterboard: false, plasterboardOption: null });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test('plasterboard with option returns { ok: true }', async ({ request }) => {
    const res = await new ApiClient(request).wasteTypes({ heavyWaste: false, plasterboard: true, plasterboardOption: 'separate-bag' });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  test('plasterboard without option returns 400', async ({ request }) => {
    const res = await new ApiClient(request).wasteTypes({ heavyWaste: false, plasterboard: true, plasterboardOption: null });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe('plasterboard option required');
  });

  test('missing required fields returns 400', async ({ request }) => {
    const res = await request.post('/api/waste-types', { data: {} });
    expect(res.status()).toBe(400);
  });
});

// ── /api/skips ────────────────────────────────────────────────────────────────

test.describe('@regression API — /api/skips', () => {
  test('heavyWaste=false returns 8 enabled skips', async ({ request }) => {
    const res = await new ApiClient(request).getSkips('SW1A1AA', false);
    expect(res.status()).toBe(200);
    const { skips } = await res.json();
    expect(skips).toHaveLength(8);
    expect(skips.every((s: { disabled: boolean }) => !s.disabled)).toBe(true);
  });

  test('heavyWaste=true returns 3 disabled skips (12/14/16-yard)', async ({ request }) => {
    const res = await new ApiClient(request).getSkips('SW1A1AA', true);
    expect(res.status()).toBe(200);
    const { skips } = await res.json();
    const disabled = skips.filter((s: { disabled: boolean }) => s.disabled);
    expect(disabled).toHaveLength(3);
    expect(disabled.map((s: { size: string }) => s.size)).toEqual(['12-yard', '14-yard', '16-yard']);
    disabled.forEach((s: { disabledReason: string }) => {
      expect(s.disabledReason).toBeTruthy();
    });
  });

  test('skip schema has required fields', async ({ request }) => {
    const res = await new ApiClient(request).getSkips('SW1A1AA', false);
    const { skips } = await res.json();
    expect(skips[0]).toMatchObject({ size: expect.any(String), price: expect.any(Number), disabled: expect.any(Boolean) });
  });

  test('missing heavyWaste param returns 400', async ({ request }) => {
    const res = await request.get('/api/skips?postcode=SW1A1AA');
    expect(res.status()).toBe(400);
  });
});

// ── /api/booking/confirm ──────────────────────────────────────────────────────

test.describe('@regression API — /api/booking/confirm', () => {
  const validBody = {
    postcode: 'SW1A 1AA', addressId: 'addr_1',
    heavyWaste: false, plasterboard: false, plasterboardOption: null,
    skipSize: '6-yard', price: 160,
  };

  test('valid request returns success with BK- bookingId', async ({ request }) => {
    const res = await new ApiClient(request).confirmBooking(validBody);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.bookingId).toMatch(/^BK-\d{5}$/);
  });

  test('missing required field returns 400', async ({ request }) => {
    const { postcode: _, ...noPostcode } = validBody;
    const res = await new ApiClient(request).confirmBookingRaw(noPostcode);
    expect(res.status()).toBe(400);
  });

  test('two rapid POSTs both return unique bookingIds', async ({ request }) => {
    const client = new ApiClient(request);
    const [r1, r2] = await Promise.all([
      client.confirmBooking(validBody),
      client.confirmBooking(validBody),
    ]);
    expect(r1.status()).toBe(200);
    expect(r2.status()).toBe(200);
    const [b1, b2] = await Promise.all([r1.json(), r2.json()]);
    expect(b1.status).toBe('success');
    expect(b2.status).toBe('success');
    expect(b1.bookingId).not.toBe(b2.bookingId);
  });
});
