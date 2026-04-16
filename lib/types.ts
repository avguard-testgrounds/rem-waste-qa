// ─── API Request Types ────────────────────────────────────────────────────────

export interface PostcodeLookupRequest {
  postcode: string;
}

export interface WasteTypesRequest {
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: PlasterboardOption | null;
}

export interface SkipsRequest {
  postcode: string;      // normalised: no spaces, uppercase
  heavyWaste: boolean;
}

export interface BookingConfirmRequest {
  postcode: string;
  addressId: string;
  heavyWaste: boolean;
  plasterboard: boolean;
  plasterboardOption: PlasterboardOption | null;
  skipSize: string;
  price: number;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface Address {
  id: string;
  line1: string;
  city: string;
}

export interface PostcodeLookupResponse {
  postcode: string;
  addresses: Address[];
}

export interface WasteTypesResponse {
  ok: boolean;
}

export interface Skip {
  size: string;         // e.g. "4-yard"
  price: number;        // in GBP
  disabled: boolean;
  disabledReason?: string;
}

export interface SkipsResponse {
  skips: Skip[];
}

export interface BookingConfirmResponse {
  status: 'success' | 'error';
  bookingId: string;
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type PlasterboardOption = 'separate-bag' | 'dedicated-skip' | 'licensed-carrier';

export type WasteType = 'general' | 'heavy' | 'plasterboard';

export type BookingStep = 1 | 2 | 3 | 4 | 5; // 5 = success

// ─── Application State ────────────────────────────────────────────────────────

export interface BookingState {
  // Step 1
  postcode: string;
  selectedAddressId: string | null;
  manualAddress: ManualAddress | null;
  // Step 2
  wasteType: WasteType | null;
  plasterboardOption: PlasterboardOption | null;
  // Step 3
  selectedSkip: Skip | null;
  // Step 4
  bookingId: string | null;
}

export interface ManualAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
