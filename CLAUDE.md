# CLAUDE.md — REM Waste Booking Flow Platform

> **This file is the authoritative specification for Claude Code.**
> Read it completely before writing any code.
> Every decision documented here has a rationale in the project docs (see `/docs/`).
> When in doubt — ask. Do not invent requirements.

---

## 1. Project Overview

You are building a **full-stack web application** implementing a multi-step skip hire booking flow for REM Waste, a UK waste management company. This is simultaneously:

1. A QA Engineering Assessment submission (functional requirements are non-negotiable)
2. A public portfolio artefact demonstrating AI-augmented solo engineering delivery

**Author / Engineer:** Evgenii Subbotin  
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Playwright · GitHub Actions · Vercel  
**Timeline:** 5-day sprint  
**Assessment PDF requirements:** See Section 6 (Richness Gates) of this file

---

## 2. Absolute Rules — Read Before Every Task

```
NEVER invent API endpoints not in the spec
NEVER use a database — all data is in-memory TypeScript fixtures
NEVER skip TypeScript types — every function, prop, and API response must be typed
NEVER hardcode strings in test files — all test data from fixtures/testData.ts
NEVER commit directly to main — all work via feature branches
ALWAYS add data-testid attributes to every interactive element
ALWAYS run tsc --noEmit after implementing a feature — fix all errors before proceeding
ALWAYS write the Playwright test immediately after implementing the feature (same session)
ALWAYS keep components small — if a component exceeds 150 lines, split it
```

---

## 3. Tech Stack

| Layer | Technology | Version | Why |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.x | Monorepo — FE + API in one repo, one Vercel deploy |
| Language | TypeScript | 5.x | Compile-time API contract validation |
| Styling | Tailwind CSS | 3.x | Utility-first, responsive without custom CSS |
| Runtime | Node.js | 20 LTS | Stable, required by Next.js 14 |
| Deployment | Vercel | current | Native Next.js, auto preview URLs, instant rollback |
| VCS + CI/CD | GitHub + GitHub Actions | current | Public portfolio visibility, native Vercel integration |
| Testing | Playwright | 1.44+ | Single tool: UI + API + A11y + Visual regression |
| AI Engine | Claude Code | current | Primary engineering accelerator — you, reading this |

**No database. No authentication. No payment processing. No external API calls.**
All data is deterministic TypeScript in-memory fixtures.

---

## 4. Repository Structure

```
rem-waste-qa/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home → redirects to /booking
│   ├── booking/
│   │   └── page.tsx              # Main booking wizard (client component)
│   └── api/
│       ├── postcode/
│       │   └── lookup/
│       │       └── route.ts      # POST /api/postcode/lookup
│       ├── waste-types/
│       │   └── route.ts          # POST /api/waste-types
│       ├── skips/
│       │   └── route.ts          # GET /api/skips
│       └── booking/
│           └── confirm/
│               └── route.ts      # POST /api/booking/confirm
├── components/
│   ├── steps/
│   │   ├── Step1Postcode.tsx     # US-001–007
│   │   ├── Step2WasteType.tsx    # US-008–010
│   │   ├── Step3SkipSelect.tsx   # US-011–013
│   │   └── Step4Review.tsx      # US-014–017
│   ├── ui/
│   │   ├── StepIndicator.tsx    # US-019
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorState.tsx
│   │   └── SkipCard.tsx
│   └── BookingWizard.tsx        # Orchestrates steps + state
├── fixtures/
│   ├── postcodes.ts             # All 4 postcode fixtures
│   ├── skips.ts                 # Skip options with disabled logic
│   └── testData.ts              # Playwright test data (DO NOT import in app code)
├── lib/
│   ├── types.ts                 # All TypeScript interfaces
│   └── utils.ts                 # Shared utilities (postcode normalisation etc)
├── page-objects/
│   ├── BasePage.ts
│   ├── Step1PostcodePage.ts
│   ├── Step2WasteTypePage.ts
│   ├── Step3SkipSelectPage.ts
│   └── Step4ReviewPage.ts
├── tests/
│   ├── e2e/
│   │   ├── general-waste-flow.spec.ts   # @smoke E2E flow 1
│   │   ├── heavy-waste-flow.spec.ts     # @smoke E2E flow 2
│   │   └── edge-cases.spec.ts           # @regression
│   ├── api/
│   │   └── all-endpoints.spec.ts        # @regression API tests
│   └── helpers/
│       └── ApiClient.ts
├── docs/                        # All DOC-XXX artefacts (already committed)
├── ui/                          # Screenshots (populated on Day 4)
├── automation/                  # Playwright suite (symlink or copy of tests/)
├── .github/
│   └── workflows/
│       └── playwright.yml
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── manual-tests.md              # Day 5
├── bug-reports.md               # Day 5
└── README.md                    # Day 5

```

---

## 5. TypeScript Types — Define First

Create `lib/types.ts` as the **first file** before any API routes or components.

```typescript
// lib/types.ts

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

// ─── UI State ────────────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

---

## 6. API Fixtures — Exact Implementation

### `fixtures/postcodes.ts`

```typescript
import { Address } from '@/lib/types';

// Per-request counter for BS1 4DJ retry simulation
// Must reset between test runs — use Map keyed by request ID or simple module-level counter
const bs1CallCount = new Map<string, number>();

export const SW1A_1AA_ADDRESSES: Address[] = [
  { id: 'addr_1',  line1: '10 Downing Street',          city: 'London' },
  { id: 'addr_2',  line1: '11 Downing Street',          city: 'London' },
  { id: 'addr_3',  line1: '12 Downing Street',          city: 'London' },
  { id: 'addr_4',  line1: '70 Whitehall',               city: 'London' },
  { id: 'addr_5',  line1: '1 Horse Guards Road',        city: 'London' },
  { id: 'addr_6',  line1: '2 Horse Guards Road',        city: 'London' },
  { id: 'addr_7',  line1: 'Cabinet Office, 70 Whitehall', city: 'London' },
  { id: 'addr_8',  line1: 'HM Treasury, 1 Horse Guards', city: 'London' },
  { id: 'addr_9',  line1: 'Foreign Office, King Charles Street', city: 'London' },
  { id: 'addr_10', line1: 'Admiralty Arch, The Mall',   city: 'London' },
  { id: 'addr_11', line1: 'St James Park Gate',         city: 'London' },
  { id: 'addr_12', line1: 'Birdcage Walk',              city: 'London' },
];

// Simple module-level counter for BS1 4DJ
let bs14djCallCount = 0;

export function resetBs14djCounter() {
  bs14djCallCount = 0;
}

export function getBs14djResponse(): { shouldFail: boolean } {
  bs14djCallCount++;
  return { shouldFail: bs14djCallCount === 1 };
}

export const BS1_4DJ_ADDRESSES: Address[] = [
  { id: 'bs_addr_1', line1: '1 Harbourside', city: 'Bristol' },
  { id: 'bs_addr_2', line1: '2 Harbourside', city: 'Bristol' },
  { id: 'bs_addr_3', line1: 'Watershed Media Centre', city: 'Bristol' },
];
```

### `fixtures/skips.ts`

```typescript
import { Skip } from '@/lib/types';

const ALL_SKIPS: Skip[] = [
  { size: '2-yard',  price: 80,  disabled: false },
  { size: '4-yard',  price: 120, disabled: false },
  { size: '6-yard',  price: 160, disabled: false },
  { size: '8-yard',  price: 200, disabled: false },
  { size: '10-yard', price: 240, disabled: false },
  { size: '12-yard', price: 280, disabled: false },
  { size: '14-yard', price: 320, disabled: false },
  { size: '16-yard', price: 380, disabled: false },
];

const HEAVY_WASTE_DISABLED_SIZES = ['12-yard', '14-yard', '16-yard'];

export function getSkips(heavyWaste: boolean): Skip[] {
  return ALL_SKIPS.map(skip => ({
    ...skip,
    disabled: heavyWaste && HEAVY_WASTE_DISABLED_SIZES.includes(skip.size),
    disabledReason: heavyWaste && HEAVY_WASTE_DISABLED_SIZES.includes(skip.size)
      ? 'Not suitable for heavy waste — weight limit exceeded'
      : undefined,
  }));
}
```

---

## 7. API Routes — Exact Contract

All routes must match this contract exactly. No deviations.

### `POST /api/postcode/lookup`

```typescript
// Request:  { postcode: "SW1A 1AA" }
// Response: { postcode: "SW1A 1AA", addresses: [...] }
// Behaviours:
//   SW1A 1AA  → 200 + 12 addresses (immediate)
//   EC1A 1BB  → 200 + empty addresses array (immediate)
//   M1 1AE    → 200 + addresses after 1500ms delay
//   BS1 4DJ   → 500 on first call, 200 + addresses on retry
//   anything else → 200 + empty addresses array
//
// Validation:
//   missing postcode → 400 { error: "postcode is required" }
//   invalid format   → 422 { error: "invalid UK postcode format" }
```

UK postcode regex: `/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i`

### `POST /api/waste-types`

```typescript
// Request:  { heavyWaste: boolean, plasterboard: boolean, plasterboardOption: string|null }
// Response: { ok: true }
// Validation:
//   plasterboard:true + plasterboardOption:null → 400 { error: "plasterboard option required" }
//   missing required fields → 400
```

### `GET /api/skips?postcode=SW1A1AA&heavyWaste=true`

```typescript
// Note: postcode param has no space (normalised by client before sending)
// Response: { skips: [...] }
// heavyWaste=true → 12-yard, 14-yard, 16-yard have disabled:true
// heavyWaste=false → all 8 skips enabled
```

### `POST /api/booking/confirm`

```typescript
// Request: { postcode, addressId, heavyWaste, plasterboard, plasterboardOption, skipSize, price }
// Response: { status: "success", bookingId: "BK-12345" }
// bookingId format: "BK-" + 5 random digits
// Validation: all fields required → 400 if missing
```

---

## 8. UI Requirements — Step by Step

### Global UI Rules
- All interactive elements **must** have `data-testid` attribute
- Naming convention: `data-testid="[component]-[element]"` e.g. `data-testid="postcode-input"`, `data-testid="skip-card-6-yard"`
- Loading state: show spinner + disable all inputs
- Error state: show error message + show retry button
- Mobile first: design at 375px, enhance for desktop

### Step 1 — Postcode & Address (US-001–007)

```
Layout: centered card, max-width 600px
Elements:
  [data-testid="postcode-input"]     — text input, UK postcode
  [data-testid="postcode-submit"]    — button "Find Address"
  [data-testid="loading-spinner"]    — visible during API call
  [data-testid="address-list"]       — dropdown/list of addresses
  [data-testid="address-option-{id}"]— individual address option
  [data-testid="manual-entry-toggle"]— "Enter address manually" link
  [data-testid="manual-line1"]       — manual entry: line 1
  [data-testid="manual-line2"]       — manual entry: line 2 (optional)
  [data-testid="manual-city"]        — manual entry: city
  [data-testid="error-message"]      — error text
  [data-testid="retry-button"]       — retry on error
  [data-testid="step1-continue"]     — "Continue" button (active when address selected)

Validation messages (inline, below input):
  empty postcode    → "Please enter a postcode"
  invalid format    → "Please enter a valid UK postcode (e.g. SW1A 1AA)"
  XSS/injection     → reject, show validation error (same as invalid format)
```

### Step 2 — Waste Type (US-008–010)

```
Elements:
  [data-testid="waste-type-general"]      — card/radio: General Waste
  [data-testid="waste-type-heavy"]        — card/radio: Heavy Waste
  [data-testid="waste-type-plasterboard"] — card/radio: Plasterboard

  // Shown only when plasterboard selected:
  [data-testid="plasterboard-separate-bag"]   — option 1
  [data-testid="plasterboard-dedicated-skip"] — option 2
  [data-testid="plasterboard-licensed-carrier"]— option 3

  [data-testid="step2-continue"] — disabled until selection complete

Each waste type card must show:
  - Icon or visual indicator
  - Title
  - Brief description (1 line)

Plasterboard options must show:
  - Title
  - Brief description
  - Why this matters (1 line)
```

### Step 3 — Skip Selection (US-011–013)

```
Elements:
  [data-testid="skip-card-{size}"]         — e.g. "skip-card-6-yard"
  [data-testid="skip-card-{size}-price"]   — price display
  [data-testid="skip-card-{size}-disabled"]— disabled badge/overlay
  [data-testid="skip-selected-summary"]    — shows selected skip + price
  [data-testid="step3-continue"]           — disabled until skip selected

Disabled skip UX:
  - Greyed out (opacity-50 or similar)
  - Not clickable
  - Shows reason: "Not suitable for heavy waste"
  - Visual distinction must be obvious (assessment requires screenshot evidence)

Layout: responsive grid
  - Mobile (375px): 1 column
  - Tablet (768px+): 2 columns
  - Desktop (1024px+): 3-4 columns
```

### Step 4 — Review & Confirm (US-014–017)

```
Elements:
  [data-testid="review-postcode"]      — displays postcode
  [data-testid="review-address"]       — displays selected/manual address
  [data-testid="review-waste-type"]    — displays waste type
  [data-testid="review-plasterboard-option"] — displays if applicable
  [data-testid="review-skip-size"]     — displays skip size
  [data-testid="review-price-base"]    — base skip hire cost
  [data-testid="review-price-total"]   — total amount
  [data-testid="confirm-button"]       — "Confirm Booking"
  [data-testid="confirm-loading"]      — spinner during API call
  [data-testid="booking-success"]      — success state container
  [data-testid="booking-id"]           — displays bookingId

Price Breakdown (mandatory per assessment):
  Skip hire: £XXX
  ─────────────
  Total: £XXX

Double-submit prevention:
  - On click: button disabled immediately
  - Loading spinner shown
  - Only ONE POST fires
  - On success: button remains disabled, success state shown
```

### Step Indicator (US-019)

```
[data-testid="step-indicator"]
[data-testid="step-indicator-{n}"]   — n = 1,2,3,4

Shows: 1 → 2 → 3 → 4
Current step: highlighted
Completed step: checkmark or filled
Future step: inactive
```

---

## 9. State Management

Use React `useState` in `BookingWizard.tsx`. No Redux, no Zustand, no Context needed for this scope.

```typescript
// BookingWizard.tsx — state shape
const [currentStep, setCurrentStep] = useState<BookingStep>(1);
const [booking, setBooking] = useState<BookingState>({
  postcode: '',
  selectedAddressId: null,
  manualAddress: null,
  wasteType: null,
  plasterboardOption: null,
  selectedSkip: null,
  bookingId: null,
});

// Update pattern — always spread:
setBooking(prev => ({ ...prev, postcode: value }));

// Navigation:
const goToStep = (step: BookingStep) => setCurrentStep(step);
const goBack = () => setCurrentStep(prev => (prev - 1) as BookingStep);
```

**Back navigation rule:** going back preserves state. User's selections are NOT cleared when going back.
**Exception:** if user changes waste type from Heavy to General, clear the skip selection (it may have been chosen based on heavy waste availability).

---

## 10. Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,        // sequential for deterministic fixture state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,                  // single worker — fixture counter state

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: '**/edge-cases.spec.ts',
    },
  ],
});
```

**Important:** `workers: 1` because the BS1 4DJ fixture uses a module-level counter. Parallel workers would corrupt the counter state.

---

## 11. Test Data

```typescript
// fixtures/testData.ts — ONLY used by Playwright tests, never imported in app code

export const POSTCODES = {
  valid: {
    sw1a: 'SW1A 1AA',    // 12 addresses
    ec1a: 'EC1A 1BB',    // 0 addresses — empty state
    m1:   'M1 1AE',      // latency simulation
    bs1:  'BS1 4DJ',     // 500 → retry
  },
  invalid: {
    tooShort:     'NG1',
    wrongFormat:  '12345',
    empty:        '',
    xss:          '<script>alert(1)</script>',
    sqlInjection: "' OR 1=1 --",
  },
};

export const SKIP_SIZES = {
  mini:       '2-yard',
  small:      '4-yard',
  medium:     '6-yard',
  large:      '8-yard',
  extraLarge: '10-yard',
  disabledHeavy1: '12-yard',  // disabled when heavyWaste:true
  disabledHeavy2: '14-yard',  // disabled when heavyWaste:true
  disabledHeavy3: '16-yard',  // disabled when heavyWaste:true
};

export const PLASTERBOARD_OPTIONS = {
  separateBag:      'separate-bag',
  dedicatedSkip:    'dedicated-skip',
  licensedCarrier:  'licensed-carrier',
};

export const VALID_ADDRESS_ID = 'addr_1';  // from SW1A 1AA fixture
```

---

## 12. Page Object Model

### BasePage.ts

```typescript
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '') { await this.page.goto(path); }

  async assertVisible(locator: Locator, msg?: string) {
    await expect(locator, msg).toBeVisible();
  }

  async assertText(locator: Locator, expected: string) {
    await expect(locator).toContainText(expected);
  }

  async assertUrl(pattern: string | RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  abstract isLoaded(): Promise<void>;
}
```

### Example: Step1PostcodePage.ts

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step1PostcodePage extends BasePage {
  readonly postcodeInput   = this.page.getByTestId('postcode-input');
  readonly submitButton    = this.page.getByTestId('postcode-submit');
  readonly loadingSpinner  = this.page.getByTestId('loading-spinner');
  readonly errorMessage    = this.page.getByTestId('error-message');
  readonly retryButton     = this.page.getByTestId('retry-button');
  readonly continueButton  = this.page.getByTestId('step1-continue');
  readonly manualToggle    = this.page.getByTestId('manual-entry-toggle');

  addressOption = (id: string) => this.page.getByTestId(`address-option-${id}`);

  async isLoaded() {
    await this.assertVisible(this.postcodeInput);
  }

  async lookupPostcode(postcode: string) {
    await this.postcodeInput.fill(postcode);
    await this.submitButton.click();
  }

  async selectAddress(id: string) {
    await this.addressOption(id).click();
  }
}
```

Create equivalent page objects for steps 2, 3, and 4. Follow the same pattern — locators as class properties using `getByTestId`.

---

## 13. E2E Tests — Minimum Required

### Flow 1: General Waste (MUST — tagged @smoke)

```typescript
test('@smoke — complete general waste booking flow', async ({ page }) => {
  // Step 1: Postcode
  // Step 2: General waste (no branching)
  // Step 3: Select 6-yard skip
  // Step 4: Review shows correct data + price breakdown
  // Confirm: bookingId appears on success screen
  // Assert: POST /api/booking/confirm fires exactly once
});
```

### Flow 2: Heavy Waste with Disabled Skips (MUST — tagged @smoke)

```typescript
test('@smoke — heavy waste booking with disabled skip verification', async ({ page }) => {
  // Step 1: SW1A 1AA
  // Step 2: Heavy waste
  // Step 3: Assert 12-yard and 14-yard are disabled and not clickable
  // Step 3: Select 8-yard (enabled)
  // Step 4: Confirm
  // Assert: heavyWaste:true in POST payload
});
```

### API Tests (MUST — tagged @regression)

Cover all 4 endpoints:
- Happy path (200/201)
- Missing required fields (400)
- Invalid values (422)
- BS1 4DJ retry sequence
- Schema validation (response body has expected fields)
- Double-submit: two rapid POSTs to /api/booking/confirm return consistent results

---

## 14. GitHub Actions Workflow

```yaml
# .github/workflows/playwright.yml
name: QA Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality-gate:
    name: TypeScript + Playwright
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run smoke tests (PR gate)
        if: github.event_name == 'pull_request'
        run: npx playwright test --grep @smoke --project=chromium
        env:
          BASE_URL: ${{ secrets.BASE_URL || 'http://localhost:3000' }}

      - name: Run full regression (merge to main)
        if: github.event_name == 'push'
        run: npx playwright test --project=chromium
        env:
          BASE_URL: ${{ secrets.BASE_URL || 'http://localhost:3000' }}

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload JUnit results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/results.xml
          retention-days: 14
```

**Note on BASE_URL for CI:** The workflow runs tests against localhost, but on merge to main you want to test the Vercel preview. Add `BASE_URL` as a GitHub Actions secret pointing to your Vercel production URL once it's stable.

---

## 15. Styling Guidelines

```typescript
// Tailwind class conventions for this project

// Primary button (active)
"bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"

// Primary button (disabled)
"bg-gray-300 text-gray-500 font-semibold py-3 px-6 rounded-lg cursor-not-allowed"

// Card (selectable)
"border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 transition-colors"

// Card (selected)
"border-2 border-blue-600 bg-blue-50 rounded-xl p-4 cursor-pointer"

// Card (disabled)
"border-2 border-gray-100 rounded-xl p-4 opacity-50 cursor-not-allowed bg-gray-50"

// Error message
"text-red-600 text-sm mt-1"

// Success badge
"bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-full text-sm"

// Container
"min-h-screen bg-gray-50"

// Card container
"max-w-2xl mx-auto px-4 py-8"

// Step card
"bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
```

Color palette:
- Primary: `blue-600` / `blue-700`
- Success: `green-600` / `green-100`
- Error: `red-600` / `red-100`
- Disabled: `gray-300` / `gray-500`
- Background: `gray-50`
- Card: `white`

---

## 16. Definition of Done — Per User Story

Before marking any US as Done:

```
□ Feature works correctly in browser at localhost:3000
□ Feature works on Vercel preview URL
□ tsc --noEmit passes with zero errors
□ data-testid attributes on ALL new interactive elements
□ At least one Playwright test covering happy path — passes locally
□ Negative case covered (test or manual TC-XXX)
□ No new console errors in browser DevTools
□ Mobile layout verified at 375px (if UI change)
□ US status updated to "Done" in DOC-003 Backlog
□ Commit message follows convention: feat(US-XXX): description
```

---

## 17. Day-by-Day Prompts for Claude Code

Use these prompts in order. Complete each day's work before moving to the next.

---

### DAY 1 PROMPT

```
Read CLAUDE.md completely before starting.

Today's goal: Working API layer + project infrastructure.

Implement in this order:
1. Create lib/types.ts with all TypeScript interfaces (Section 5 of CLAUDE.md)
2. Create fixtures/postcodes.ts (Section 6)
3. Create fixtures/skips.ts (Section 6)
4. Create app/api/postcode/lookup/route.ts — POST handler (Section 7)
5. Create app/api/waste-types/route.ts — POST handler (Section 7)
6. Create app/api/skips/route.ts — GET handler (Section 7)
7. Create app/api/booking/confirm/route.ts — POST handler (Section 7)
8. Create playwright.config.ts (Section 10)
9. Create fixtures/testData.ts (Section 11)
10. Create page-objects/BasePage.ts (Section 12)
11. Create .github/workflows/playwright.yml (Section 14)

After each file: run tsc --noEmit and fix any errors before proceeding.

After all API routes: test each with curl:
  curl -X POST http://localhost:3000/api/postcode/lookup \
    -H "Content-Type: application/json" \
    -d '{"postcode":"SW1A 1AA"}'

Expected: 12 addresses returned.

Do NOT build any UI today. API only.
```

---

### DAY 2 PROMPT

```
Read CLAUDE.md Section 8 (UI Requirements) before starting.

Today's goal: Steps 1 and 2 fully functional in browser.

Implement in this order:
1. Create lib/utils.ts with postcode normalisation function
2. Create components/ui/LoadingSpinner.tsx
3. Create components/ui/ErrorState.tsx (with retry button)
4. Create components/ui/StepIndicator.tsx (US-019)
5. Create components/steps/Step1Postcode.tsx (US-001–007)
   - Postcode input + validation
   - API call to /api/postcode/lookup
   - Address list display
   - Empty state (EC1A 1BB)
   - Loading state (M1 1AE)
   - Error + retry state (BS1 4DJ)
   - Manual entry fallback
   - ALL data-testid attributes per Section 8
6. Create components/steps/Step2WasteType.tsx (US-008–010)
   - Three waste type cards
   - Plasterboard branching (3 sub-options appear)
   - API call to /api/waste-types on continue
   - ALL data-testid attributes
7. Create components/BookingWizard.tsx (state management per Section 9)
8. Create app/booking/page.tsx (renders BookingWizard)
9. Update app/page.tsx to redirect to /booking

After Step1 is done: manually test all 4 postcode fixtures in browser.
After Step2 is done: test plasterboard branching — select Plasterboard, verify 3 options appear.
Run tsc --noEmit after each component.

Do NOT implement Steps 3 and 4 today.
```

---

### DAY 3 PROMPT

```
Read CLAUDE.md Section 8 (Steps 3 and 4) before starting.

Today's goal: Complete booking flow works end-to-end.

Implement in this order:
1. Create components/ui/SkipCard.tsx (individual skip display — enabled + disabled states)
2. Create components/steps/Step3SkipSelect.tsx (US-011–013)
   - Fetch skips from /api/skips on mount
   - Responsive grid layout
   - Disabled skip visual treatment
   - Selection state
   - ALL data-testid attributes
3. Create components/steps/Step4Review.tsx (US-014–017)
   - Full booking summary
   - Price breakdown section (mandatory)
   - Confirm button with double-submit prevention
   - Loading state during API call
   - Success screen with bookingId
   - ALL data-testid attributes
4. Wire Step3 and Step4 into BookingWizard.tsx
5. Test complete flow: SW1A 1AA → General → 6-yard → Review → Confirm
6. Test heavy waste flow: SW1A 1AA → Heavy → verify 12/14-yard disabled → 8-yard → Confirm
7. Test back navigation: verify state preserved when going back

Run tsc --noEmit. Fix all errors.
Test at 375px viewport in DevTools — verify no horizontal overflow.
```

---

### DAY 4 PROMPT

```
Read CLAUDE.md Sections 12 and 13 before starting.

Today's goal: Automated test suite + CI/CD + Lighthouse.

Implement in this order:
1. Create page-objects/Step1PostcodePage.ts (pattern from Section 12)
2. Create page-objects/Step2WasteTypePage.ts
3. Create page-objects/Step3SkipSelectPage.ts
4. Create page-objects/Step4ReviewPage.ts
5. Create tests/helpers/ApiClient.ts (same pattern as existing qa-framework)
6. Create tests/e2e/general-waste-flow.spec.ts (@smoke — Flow 1 from Section 13)
7. Create tests/e2e/heavy-waste-flow.spec.ts (@smoke — Flow 2 from Section 13)
8. Create tests/api/all-endpoints.spec.ts (@regression — all 4 endpoints)
9. Create tests/e2e/edge-cases.spec.ts (@regression — negative + state transitions)
   Include: XSS input, SQL injection, empty postcode, plasterboard without option,
            double-submit prevention, browser back button, mobile viewport assertions
10. Run full test suite locally: npx playwright test
    Fix all failures before proceeding.

Screenshots to capture (save to ui/ directory):
  - Desktop: each of the 4 steps (SW1A 1AA flow)
  - Desktop: disabled skip cards (heavy waste)
  - Desktop: price breakdown on Step 4
  - Desktop: success screen with bookingId
  - Mobile (375px): Step 1, Step 3 (skip grid), Step 4

Run Lighthouse in Chrome DevTools on localhost:3000:
  Performance ≥ 85, Accessibility ≥ 90.
  Screenshot the results → save to ui/lighthouse-report.png

Push to GitHub → verify CI pipeline is green.
```

---

### DAY 5 PROMPT

```
Today's goal: All documentation + submission package.

Tasks:
1. Write manual-tests.md in repo root
   - Strict markdown table format (see assessment PDF)
   - Minimum 35 test cases
   - Include: TC-ID, Title, Preconditions, Steps, Expected, Actual, Status, Priority
   - Coverage: 10+ negative, 6+ edge case, 4+ API failure, 4+ state transition
   - Reference existing TC-XXX IDs from DOC-003

2. Write bug-reports.md in repo root
   - Minimum 3 bugs
   - Required fields: ID, Title, Severity, Priority, Environment, Steps, Expected, Actual, Evidence
   - At least 1 bug must involve plasterboard branching or state transition
   - If no bugs found during development: create a deliberate regression in a branch,
     document it, then fix it. This is honest and professional.

3. Write README.md
   Required sections:
   a) Project Overview (2 sentences)
   b) Live Demo: [Vercel URL]
   c) GitHub Repository: [URL]
   d) Project Library (Documentation): [Portfolio site URL]
   e) How to run locally:
      npm install
      npx playwright install chromium
      npm run dev
      npm test
   f) Test Data Strategy:
      Explain the in-memory fixture approach.
      Explain the 4 deterministic postcode fixtures.
      Explain the BS1 4DJ retry counter mechanism.
   g) AI Engineering Approach:
      Explain that Claude Code was used as the primary engineering accelerator.
      Link to DOC-008 (AI Engineering Log) if complete.
   h) Documentation Library: link to each DOC-XXX file in /docs

4. Verify complete submission checklist (from DOC-006 §5):
   □ Public Vercel URL works in incognito browser
   □ All @regression tests pass on production URL
   □ manual-tests.md has 35+ TCs in correct format
   □ bug-reports.md has 3+ bugs with all fields
   □ ui/ has all required screenshots
   □ Flow video recorded (60–120 seconds)
   □ README has all 3 submission links
   □ Lighthouse ≥ 85 performance, ≥ 90 accessibility

5. Final git push:
   git add .
   git commit -m "feat: complete assessment submission — all requirements met"
   git push
```

---

## 18. Common Errors and How to Fix Them

**`Cannot find module '@/lib/types'`**
→ Check `tsconfig.json` has `"paths": { "@/*": ["./*"] }`. If missing, add it.

**`React Hook "useState" cannot be called in a Server Component`**
→ Add `'use client';` as first line of the component file.

**Playwright `getByTestId` returns nothing**
→ Verify `data-testid` attribute is on the DOM element, not a wrapper. Check spelling exactly matches.

**BS1 4DJ always returns 500 (retry not working)**
→ The module-level counter persists between Next.js hot reloads in dev. Restart `npm run dev` to reset.

**CI fails: `tsc` errors but local passes**
→ CI uses `npm ci` (clean install). Check `package.json` includes all deps in `dependencies` or `devDependencies`, not just installed locally.

**Mobile viewport test fails: horizontal overflow**
→ Check for fixed-width elements. Add `overflow-x-hidden` to the root layout. Check Tailwind classes with fixed pixel widths.

**Double-submit test flaky**
→ Use `page.route()` to intercept the API call and add artificial delay. This makes the double-click window reliable.

---

## 19. Assessment Submission Checklist

Copy this into a separate file `SUBMISSION_CHECKLIST.md` and tick items as you complete them:

```markdown
# Submission Checklist

## Richness Gates (Mandatory)
- [ ] Multi-path flow: General, Heavy, Plasterboard (with 3 handling options)
- [ ] 12+ addresses for SW1A 1AA
- [ ] 0 addresses for EC1A 1BB
- [ ] 8 skip options with mixed enabled/disabled
- [ ] Loading state (M1 1AE)
- [ ] Empty state (EC1A 1BB)  
- [ ] Error state + retry (BS1 4DJ)
- [ ] Price breakdown in review step

## API Contract
- [ ] POST /api/postcode/lookup — exact response shape
- [ ] POST /api/waste-types — exact response shape
- [ ] GET /api/skips — exact response shape
- [ ] POST /api/booking/confirm — exact response shape

## Functional Requirements
- [ ] UK postcode validation
- [ ] Address lookup + selection + manual entry
- [ ] Waste type selection with plasterboard branching
- [ ] Skip selection with disabled logic
- [ ] Review summary + price breakdown
- [ ] Confirm booking + prevent double submit

## Manual Tests
- [ ] 35+ test cases
- [ ] 10+ negative tests
- [ ] 6+ edge cases
- [ ] 4+ API failure tests
- [ ] 4+ state transition tests
- [ ] Strict markdown table format

## Bug Reports
- [ ] 3+ bugs with all required fields
- [ ] 1+ branching or state transition bug

## Automation
- [ ] E2E Flow 1: General waste
- [ ] E2E Flow 2: Heavy waste
- [ ] Assertions at each step
- [ ] Stable data-testid selectors
- [ ] Mocking strategy documented in README

## UI/UX Evidence
- [ ] Mobile screenshots (375px)
- [ ] Desktop screenshots
- [ ] Error state screenshot
- [ ] Disabled skip screenshot
- [ ] Price breakdown screenshot
- [ ] Flow video (60–120 seconds)
- [ ] Lighthouse report

## Submission Links
- [ ] Public demo URL (no login, no VPN, no expiry)
- [ ] GitHub repository URL (public)
- [ ] Project documentation library URL
```

---

*End of CLAUDE.md*
*Version: 1.0 | Author: Evgenii Subbotin | Project: REM Waste Booking Flow Platform*
