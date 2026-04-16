import { APIRequestContext } from '@playwright/test';

interface WasteTypesBody {
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: string | null;
}

interface ConfirmBody {
  postcode: string;
  addressId: string;
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: string | null;
  skipSize: string;
  price: number;
}

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  postcodeLookup(postcode: string) {
    return this.request.post('/api/postcode/lookup', { data: { postcode } });
  }

  wasteTypes(body: WasteTypesBody) {
    return this.request.post('/api/waste-types', { data: body });
  }

  getSkips(postcode: string, heavyWaste: boolean) {
    return this.request.get(`/api/skips?postcode=${postcode}&heavyWaste=${heavyWaste}`);
  }

  confirmBooking(body: ConfirmBody) {
    return this.request.post('/api/booking/confirm', { data: body });
  }

  confirmBookingRaw(body: Record<string, unknown>) {
    return this.request.post('/api/booking/confirm', { data: body });
  }
}
