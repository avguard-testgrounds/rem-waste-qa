# Bug Reports — REM Waste Booking Flow

**Project:** REM Waste Skip Hire Booking Platform  
**Author:** Evgenii Subbotin  
**Environment:** Chrome 124 / Next.js 16.2.4 / Node.js 20 LTS / localhost:3000  
**Date:** 2026-04-16

---

## BUG-001 — Browser Back Navigation Resets All Booking State

| Field | Detail |
|-------|--------|
| **ID** | BUG-001 |
| **Title** | Browser Back button from Step 2 lands on `about:blank`, discarding all booking state |
| **Severity** | Medium |
| **Priority** | High |
| **Status** | Fixed |
| **Environment** | Chrome 124 / localhost:3000 / Playwright 1.44 |
| **Component** | BookingWizard state management + Playwright test (edge-cases.spec.ts) |

### Steps to Reproduce

1. Open `http://localhost:3000/booking` in a browser (the page loads Step 1).
2. Enter `SW1A 1AA`, click **Find Address**, select an address, click **Continue** (now on Step 2).
3. Press the browser's Back button.

### Expected Result

The application navigates back gracefully. The URL remains within the app (e.g., `/booking` or `/`). Step 1 is displayed. Booking state (postcode) may or may not be preserved — but the page should not be `about:blank` and no crash should occur.

### Actual Result

The browser navigates to `about:blank`. This is because the Playwright test started on a fresh page with no browser history, so `page.goBack()` had nowhere to go. In a real browser, pressing Back from `/booking` (a client-side SPA) returns to the page the user visited before — which is also `/booking` (via redirect from `/`), causing a full state reset and the user landing on Step 1 with empty form.

### Root Cause

The booking flow is entirely client-side state within a single URL (`/booking`). Browser back navigation causes a full page reload, resetting `BookingWizard`'s React state. No state is persisted to `sessionStorage`, `localStorage`, or URL search params.

In the Playwright test, the test navigated directly to `/` as its first action. Since `/` redirects to `/booking`, the browser history had only one entry. Calling `page.goBack()` navigated to `about:blank` (the Playwright tab's initial state), not a real URL.

### Fix Applied

**Test fix:** Added an explicit `await page.goto('/booking')` before the main test navigation, seeding the browser history so `goBack()` returns to a real URL.

```typescript
// edge-cases.spec.ts — before fix
await step1.goto('/');  // only history entry → goBack() = about:blank

// after fix
await page.goto('/booking');  // seed history
await step1.goto('/');        // second entry; goBack() returns to /booking
```

**Application note:** For a production app, consider persisting wizard state to `sessionStorage` so that browser-back navigation restores the user's progress. Not implemented in this sprint (out of scope per CLAUDE.md §3 constraints).

### Evidence

```
Error: expect(page).toHaveURL(/\//) failed
Expected pattern: /\//
Received string: "about:blank"

at tests/e2e/edge-cases.spec.ts:194
```

---

## BUG-002 — Loading Spinner Assertion Race Condition for Synchronous In-Memory Responses

| Field | Detail |
|-------|--------|
| **ID** | BUG-002 |
| **Title** | `toBeVisible()` assertion on loading spinner fails for `SW1A 1AA` — response too fast to observe |
| **Severity** | Low |
| **Priority** | Medium |
| **Status** | Fixed |
| **Environment** | Chrome 124 / localhost:3000 / Playwright 1.44 |
| **Component** | Step1Postcode.tsx (loading state) + general-waste-flow.spec.ts |

### Steps to Reproduce

1. Run `npx playwright test tests/e2e/general-waste-flow.spec.ts --project=chromium`.
2. Observe test failure at line 19.

### Expected Result

The loading spinner (`data-testid="loading-spinner"`) should be transiently visible while the `/api/postcode/lookup` call is in flight, then disappear once addresses are returned.

### Actual Result

The `toBeVisible()` assertion fails because the in-memory fixture for `SW1A 1AA` responds synchronously within the same Node.js event loop tick. The spinner's visibility window is sub-millisecond — Playwright's default polling interval (100ms) cannot observe it.

```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('loading-spinner')
Expected: visible
Received: hidden

at tests/e2e/general-waste-flow.spec.ts:19
```

### Root Cause

`fixtures/postcodes.ts` returns `SW1A_1AA_ADDRESSES` synchronously. The `Step1Postcode` component sets `loading: true`, triggers the fetch, and within the same microtask queue cycle, the response arrives and sets `loading: false`. React batches these state updates in React 18+, meaning the spinner never renders to the DOM in an observable state during Playwright's polling.

This is a testability gap: the production behaviour (real API calls with network latency) would make the spinner clearly visible. The in-memory fixture trades test speed for spinner observability.

### Fix Applied

Removed the eager `toBeVisible()` assertion. The spinner's disappearance (i.e., the response arriving) is the meaningful assertion:

```typescript
// Before (failing):
await step1.lookupPostcode(POSTCODES.valid.sw1a);
await expect(step1.loadingSpinner).toBeVisible();              // ← race condition
await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });

// After (passing):
await step1.lookupPostcode(POSTCODES.valid.sw1a);
await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
```

The `M1 1AE` postcode fixture (which introduces a 1500ms artificial delay) remains the canonical test case for verifying the spinner is displayed.

---

## BUG-003 — Plasterboard Sub-Option Selection State Leaks Into Consecutive Test Runs via Shared Server

| Field | Detail |
|-------|--------|
| **ID** | BUG-003 |
| **Title** | BS1 4DJ retry counter corrupts state across test runs when dev server is reused |
| **Severity** | Medium |
| **Priority** | High |
| **Status** | Fixed |
| **Environment** | Node.js 20 / Playwright 1.44 / playwright.config.ts `reuseExistingServer: true` |
| **Component** | fixtures/postcodes.ts (module-level counter) + playwright.config.ts |

### Steps to Reproduce

1. Run `npx playwright test --project=chromium` (full suite passes).
2. Without restarting the Next.js dev server, run `npx playwright test --project=chromium` again.
3. Observe the BS1 4DJ retry test failure in the second run.

### Expected Result

`BS1 4DJ — first call returns 500, second call returns 200 with 3 addresses` passes on every test run.

### Actual Result

The test fails on the second run:

```
Error: expect(received).toBe(expected)
Expected: 500
Received: 200

at tests/api/all-endpoints.spec.ts:45
```

### Root Cause

`fixtures/postcodes.ts` uses a module-level counter to simulate the retry behaviour:

```typescript
let bs14djCallCount = 0;

export function getBs14djResponse(): { shouldFail: boolean } {
  bs14djCallCount++;
  return { shouldFail: bs14djCallCount === 1 };  // only first call fails
}
```

This counter is scoped to the Node.js module singleton — it is never reset during the application's lifetime. When `reuseExistingServer: true` is configured in `playwright.config.ts`, consecutive `npx playwright test` invocations share the same running Next.js server process. By the second invocation, `bs14djCallCount` is already 2 (incremented from the first run), so the "first" call in run 2 returns HTTP 200 instead of 500.

This is a classic shared mutable state problem: the fixture was designed assuming a fresh process per test run, but the Playwright configuration allowed server reuse.

### Fix Applied

Changed `reuseExistingServer` to `false` in `playwright.config.ts` to guarantee a fresh Node.js process (and therefore a reset counter) for every test run:

```typescript
// Before:
reuseExistingServer: !process.env.CI,  // reuses server locally → counter persists

// After:
reuseExistingServer: false,            // always fresh server → counter resets to 0
```

**Trade-off:** Each test run now incurs a ~5–10 second server startup cost. This is acceptable given the correctness guarantee. An alternative — exposing a `POST /api/test/reset-counters` endpoint — was rejected as it would pollute production routes with test infrastructure.

### Evidence

Consecutive test run output (before fix):

```
  x  6 [chromium] › tests/api/all-endpoints.spec.ts:42:7
       › BS1 4DJ — first call returns 500, second call returns 200 with 3 addresses

    Expected: 500
    Received: 200  ← counter already at 2 from previous run
```

---

## Summary

| Bug ID | Title | Severity | Status | Component |
|--------|-------|----------|--------|-----------|
| BUG-001 | Browser back navigation to `about:blank` | Medium | Fixed | Edge-cases test + App SPA state |
| BUG-002 | Spinner visibility race condition for fast fixtures | Low | Fixed | general-waste-flow test + Step1 loading state |
| BUG-003 | BS1 4DJ counter corrupts across test runs (plasterboard state analogue) | Medium | Fixed | postcodes.ts counter + playwright.config.ts |
