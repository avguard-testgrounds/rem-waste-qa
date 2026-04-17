# Manual Test Cases — REM Waste Booking Flow

**Project:** REM Waste Skip Hire Booking Platform  
**Author:** Evgenii Subbotin  
**Environment:** Chrome 124 / localhost:3000  
**Date:** 2026-04-16  
**Total Test Cases:** 39

---

## TC-001 to TC-007 — Happy Path Flows

| TC-ID | Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|-------|-------|---------------|-------|-----------------|---------------|--------|----------|
| TC-001 | Complete general waste booking flow end-to-end | App running at localhost:3000 | 1. Navigate to `/`<br>2. Enter `SW1A 1AA`, click Find Address<br>3. Select `10 Downing Street`<br>4. Click Continue<br>5. Select General Waste<br>6. Click Continue<br>7. Select 6-yard skip<br>8. Click Continue<br>9. Verify review summary<br>10. Click Confirm Booking | Booking success screen shown with `BK-XXXXX` ID; POST to `/api/booking/confirm` fires exactly once | As expected | Pass | Critical |
| TC-002 | Complete heavy waste booking flow with 8-yard skip | App running at localhost:3000 | 1. Navigate to `/`<br>2. Enter `SW1A 1AA`, click Find Address<br>3. Select first address<br>4. Click Continue<br>5. Select Heavy Waste<br>6. Click Continue<br>7. Verify 12-yard, 14-yard, 16-yard are disabled<br>8. Select 8-yard<br>9. Click Continue<br>10. Click Confirm Booking | Step 4 POST includes `heavyWaste: true`; disabled skips show greyed overlay with reason; booking success shown | As expected | Pass | Critical |
| TC-003 | Complete plasterboard booking — Separate Bag option | App running at localhost:3000 | 1. Navigate to `/`<br>2. SW1A 1AA → select address → Continue<br>3. Select Plasterboard<br>4. Three sub-options appear<br>5. Select `Separate Bag`<br>6. Click Continue<br>7. Select any enabled skip<br>8. Click Continue<br>9. Click Confirm Booking | Booking succeeds; POST includes `plasterboard: true, plasterboardOption: 'separate-bag'`; Step 4 shows waste type | As expected | Pass | Critical |
| TC-004 | Complete plasterboard booking — Dedicated Skip option | App running at localhost:3000 | 1–4. Same as TC-003<br>5. Select `Dedicated Skip`<br>6–9. Continue through flow | Booking succeeds with `plasterboardOption: 'dedicated-skip'` in payload | As expected | Pass | High |
| TC-005 | Complete plasterboard booking — Licensed Carrier option | App running at localhost:3000 | 1–4. Same as TC-003<br>5. Select `Licensed Carrier`<br>6–9. Continue through flow | Booking succeeds with `plasterboardOption: 'licensed-carrier'` in payload | As expected | Pass | High |
| TC-006 | Manual address entry bypass — enter address manually | App running at localhost:3000 | 1. Navigate to `/`<br>2. Enter `SW1A 1AA`, click Find Address<br>3. Click `Enter address manually`<br>4. Fill Line 1, City fields<br>5. Click Continue | Step 2 loads with manual address; booking can be completed | As expected | Pass | Medium |
| TC-007 | Step 4 price breakdown displays correctly | Steps 1–3 completed with 6-yard skip (£160) | 1. Reach Step 4 Review<br>2. Inspect price breakdown section | Base price shows `£160`, Total shows `£160`; both `review-price-base` and `review-price-total` testids present | As expected | Pass | High |

---

## TC-008 to TC-019 — Input Validation (Negative Tests)

| TC-ID | Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|-------|-------|---------------|-------|-----------------|---------------|--------|----------|
| TC-008 | Empty postcode — validation error shown | Step 1 loaded | 1. Leave postcode input empty<br>2. Click Find Address | Error message `Please enter a postcode` appears below input; no API call made | As expected | Pass | Critical |
| TC-009 | Invalid postcode format (all digits) — 422 validation | Step 1 loaded | 1. Enter `12345`<br>2. Click Find Address | Error message `Please enter a valid UK postcode` shown; address list not shown | As expected | Pass | High |
| TC-010 | Postcode too short — validation error | Step 1 loaded | 1. Enter `NG1`<br>2. Click Find Address | Validation error shown; no API call made | As expected | Pass | High |
| TC-011 | XSS script tag in postcode field — rejected | Step 1 loaded | 1. Enter `<script>alert(1)</script>`<br>2. Click Find Address | Validation error shown; script NOT executed; page title unchanged | As expected | Pass | Critical |
| TC-012 | SQL injection in postcode field — rejected | Step 1 loaded | 1. Enter `' OR 1=1 --`<br>2. Click Find Address | Validation error shown; no database error or unexpected data returned | As expected | Pass | Critical |
| TC-013 | Postcode with special characters — rejected | Step 1 loaded | 1. Enter `SW1A!1AA`<br>2. Click Find Address | Validation error shown; API returns 422 | As expected | Pass | Medium |
| TC-014 | Continue button disabled on Step 2 with no waste type selected | Step 2 loaded | 1. Reach Step 2<br>2. Do NOT select any waste type<br>3. Inspect Continue button | Continue button (`step2-continue`) is disabled and cannot be clicked | As expected | Pass | High |
| TC-015 | Continue disabled on Step 2 when plasterboard selected but no sub-option chosen | Step 2 loaded | 1. Select Plasterboard<br>2. Verify three sub-options appear<br>3. Do NOT select any sub-option<br>4. Inspect Continue button | Continue button remains disabled until a sub-option is selected | As expected | Pass | High |
| TC-016 | Continue disabled on Step 3 with no skip selected | Step 3 loaded | 1. Reach Step 3 (any waste type)<br>2. Do NOT select any skip<br>3. Inspect Continue button | `step3-continue` is disabled; `skip-selected-summary` not visible | As expected | Pass | High |
| TC-017 | Clicking disabled heavy-waste skip does NOT select it | Step 3 loaded with heavy waste | 1. Reach Step 3 via heavy waste flow<br>2. Click 12-yard skip (force click)<br>3. Inspect summary and Continue button | Selected summary not shown; Continue remains disabled; 12-yard not highlighted as selected | As expected | Pass | High |
| TC-018 | API `/api/postcode/lookup` — missing postcode field returns 400 | App running | 1. POST to `/api/postcode/lookup` with empty body `{}`<br>2. Check response | HTTP 400; body: `{ error: "postcode is required" }` | As expected | Pass | High |
| TC-019 | API `/api/postcode/lookup` — invalid format returns 422 | App running | 1. POST `{ postcode: "12345" }` to `/api/postcode/lookup` | HTTP 422; body: `{ error: "invalid UK postcode format" }` | As expected | Pass | High |

---

## TC-020 to TC-027 — Edge Cases

| TC-ID | Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|-------|-------|---------------|-------|-----------------|---------------|--------|----------|
| TC-020 | EC1A 1BB — empty state shown (0 addresses) | Step 1 loaded | 1. Enter `EC1A 1BB`<br>2. Click Find Address<br>3. Wait for response | `No addresses found` message shown; address list not visible; Continue button disabled | As expected | Pass | High |
| TC-021 | M1 1AE — loading spinner shown during 1500ms delay | Step 1 loaded | 1. Enter `M1 1AE`<br>2. Click Find Address<br>3. Observe UI during API call | Loading spinner (`loading-spinner`) visible for ~1.5 seconds before addresses appear | As expected | Pass | Medium |
| TC-022 | BS1 4DJ — first call returns HTTP 500 error state | Step 1 loaded | 1. Enter `BS1 4DJ`<br>2. Click Find Address | Error message shown; retry button (`retry-button`) visible; address list not shown | As expected | Pass | High |
| TC-023 | BS1 4DJ — retry button succeeds on second call | TC-022 completed (error state active) | 1. Click retry button<br>2. Wait for response | Loading spinner appears; then 3 Bristol addresses shown; Continue becomes enabled after selection | As expected | Pass | High |
| TC-024 | Mobile 375px — no horizontal overflow on Step 1 | Browser viewport set to 375×812 | 1. Set viewport to 375×812<br>2. Navigate to `/booking` | `document.documentElement.scrollWidth` ≤ 375; no horizontal scrollbar | As expected | Pass | Medium |
| TC-025 | Mobile 375px — skip grid shows single column on Step 3 | Browser viewport 375×812; Steps 1–2 completed | 1. Reach Step 3 at 375px viewport<br>2. Inspect skip cards layout | Skip cards stack vertically (1 column); `scrollWidth` ≤ 375; all 8 cards visible via scroll | As expected | Pass | Medium |
| TC-026 | Double-submit prevention — Confirm button disabled after first click | Step 4 loaded | 1. Click Confirm Booking<br>2. Immediately click Confirm Booking again (force) | Button disabled after first click; only ONE POST to `/api/booking/confirm` fires; booking ID shown on success | As expected | Pass | Critical |
| TC-027 | Booking success screen displays valid BK- booking ID | Steps 1–4 completed | 1. Click Confirm Booking<br>2. Wait for success screen | `booking-success` element visible; `booking-id` contains text matching `BK-` followed by 5 digits | As expected | Pass | High |

---

## TC-028 to TC-032 — API Failure Scenarios

| TC-ID | Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|-------|-------|---------------|-------|-----------------|---------------|--------|----------|
| TC-028 | Postcode lookup API 500 — error message displayed | Step 1 loaded; network intercepted to return 500 | 1. Intercept `/api/postcode/lookup` to return HTTP 500<br>2. Enter `SW1A 1AA`, click Find Address | `error-message` element shown with error text; address list not shown | As expected | Pass | High |
| TC-029 | Postcode lookup API 500 — retry button visible | TC-028 active (error state) | 1. Error state is shown after 500 response<br>2. Inspect page | `retry-button` is visible and actionable | As expected | Pass | High |
| TC-030 | Retry after API failure — succeeds when route restored | TC-028 active; then route unregistered | 1. Click retry button (with route restored to normal)<br>2. Wait for response | Addresses load successfully; retry button no longer visible; Continue enabled after selection | As expected | Pass | High |
| TC-031 | API `/api/skips` — missing `heavyWaste` param returns 400 | App running | 1. GET `/api/skips?postcode=SW1A1AA` (no heavyWaste param) | HTTP 400 response | As expected | Pass | Medium |
| TC-032 | API `/api/booking/confirm` — missing required field returns 400 | App running | 1. POST to `/api/booking/confirm` omitting `postcode` field | HTTP 400 response | As expected | Pass | Medium |

---

## TC-033 to TC-039 — State Transitions

| TC-ID | Title | Preconditions | Steps | Expected Result | Actual Result | Status | Priority |
|-------|-------|---------------|-------|-----------------|---------------|--------|----------|
| TC-033 | Back navigation from Step 2 preserves postcode and address | Steps 1–2 completed | 1. From Step 2, click Back<br>2. Observe Step 1 UI | Postcode input shows `SW1A 1AA`; address list visible with previous selection retained | As expected | Pass | High |
| TC-034 | Back navigation from Step 3 preserves waste type selection | Steps 1–3 completed (General Waste) | 1. From Step 3, click Back<br>2. Observe Step 2 UI | `waste-type-general` card shows selected state (blue border); plasterboard sub-options hidden | As expected | Pass | High |
| TC-035 | Switching from Heavy to General waste clears skip selection | Steps 1–3 completed with heavy waste flow | 1. From Step 3, click Back to Step 2<br>2. Change waste type from Heavy to General<br>3. Click Continue<br>4. Observe Step 3 | No skip is pre-selected; `skip-selected-summary` not visible; Continue button disabled | As expected | Pass | High |
| TC-036 | Switching from Plasterboard to General clears plasterboard option | Step 2 loaded | 1. Select Plasterboard<br>2. Select `Separate Bag` sub-option<br>3. Click `General Waste` card | Plasterboard sub-options disappear; plasterboard option is cleared in local state; Continue disabled until a waste type is confirmed | As expected | Pass | High |
| TC-037 | Plasterboard sub-options visible only when plasterboard waste type is selected | Step 2 loaded | 1. Observe initial state — no sub-options<br>2. Select `Plasterboard`<br>3. Observe sub-options appear<br>4. Select `General Waste`<br>5. Observe sub-options disappear | Sub-options (`plasterboard-separate-bag`, `plasterboard-dedicated-skip`, `plasterboard-licensed-carrier`) shown only when Plasterboard is selected | As expected | Pass | Medium |
| TC-038 | Browser Back button from Step 2 — app does not crash | Steps 1–2 completed; user is on Step 2 | 1. Press browser Back button<br>2. Observe URL and page state | URL matches `/booking` or `/`; page title does not show `Error`; app is still functional | As expected | Pass | Medium |
| TC-039 | Heavy waste — 12/14/16-yard skips disabled with visible reason; 8-yard selectable | Steps 1–2 completed with Heavy Waste | 1. Reach Step 3<br>2. Observe 12-yard, 14-yard, 16-yard cards<br>3. Observe 8-yard card<br>4. Select 8-yard | Disabled cards have `opacity-50` and `cursor-not-allowed`; disabled badge/reason visible; 8-yard selectable; summary shows 8-yard + price | As expected | Pass | Critical |

---

## Coverage Summary

| Category | Count | TC-IDs |
|----------|-------|--------|
| Happy Path | 7 | TC-001 to TC-007 |
| Negative / Input Validation | 12 | TC-008 to TC-019 |
| Edge Cases | 8 | TC-020 to TC-027 |
| API Failure | 5 | TC-028 to TC-032 |
| State Transitions | 7 | TC-033 to TC-039 |
| **Total** | **39** | |

| Requirement | Target | Actual |
|-------------|--------|--------|
| Negative tests | ≥ 10 | 12 |
| Edge cases | ≥ 6 | 8 |
| API failure tests | ≥ 4 | 5 |
| State transition tests | ≥ 4 | 7 |
| Total test cases | ≥ 35 | 39 |
