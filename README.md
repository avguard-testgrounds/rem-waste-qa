# REM Waste — Skip Hire Booking Flow

A full-stack multi-step booking platform for REM Waste, a UK waste management company. Built as a QA Engineering Assessment submission demonstrating end-to-end feature delivery, automated testing, and AI-augmented engineering.

## Live Demo

**[https://rem-waste-qa-seven.vercel.app/booking](https://rem-waste-qa-seven.vercel.app/booking)**

## GitHub Repository

**[https://github.com/subbotin-es/rem-waste-qa](https://github.com/subbotin-es/rem-waste-qa)**

## Project Documentation Library

**[https://subbotin.es/PorfolioProjects/REMWaste/rem-waste-project-library.html#docs](https://subbotin.es/PorfolioProjects/REMWaste/rem-waste-project-library.html#docs)**

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Start the development server
npm run dev

# 4. Run the full test suite (in a separate terminal)
npm test
```

> **Note:** `npm test` runs `npx playwright test`. The Playwright config starts the dev server automatically (`webServer` config) and restarts it fresh on each run (`reuseExistingServer: false`) to guarantee deterministic fixture state.

### Running specific test tags

```bash
# Smoke tests only (fast, ~30 seconds)
npx playwright test --grep @smoke --project=chromium

# Regression tests only
npx playwright test --grep @regression --project=chromium

# All projects (Chromium + WebKit + mobile-chrome)
npx playwright test
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Testing | Playwright 1.44 |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

## Test Data Strategy

### In-Memory Fixtures

All data is held in deterministic TypeScript modules under `fixtures/`. There is no database, no external API, and no network dependency. Every API route handler imports directly from these fixtures:

- `fixtures/postcodes.ts` — address data for all 4 postcode scenarios
- `fixtures/skips.ts` — 8 skip sizes with heavy-waste disabled logic
- `fixtures/testData.ts` — Playwright test constants (never imported in app code)

### Four Deterministic Postcode Fixtures

| Postcode | Behaviour | Purpose |
|----------|-----------|---------|
| `SW1A 1AA` | 200 + 12 addresses (immediate) | Happy path |
| `EC1A 1BB` | 200 + 0 addresses (immediate) | Empty state |
| `M1 1AE` | 200 + addresses after 1500ms | Loading state |
| `BS1 4DJ` | 500 on first call, 200 on retry | Error + retry |

### BS1 4DJ Retry Counter Mechanism

The retry simulation uses a **module-level counter** in `fixtures/postcodes.ts`:

```typescript
let bs14djCallCount = 0;

export function getBs14djResponse(): { shouldFail: boolean } {
  bs14djCallCount++;
  return { shouldFail: bs14djCallCount === 1 };
}
```

The counter increments on every call to the `/api/postcode/lookup` route for `BS1 4DJ`. The first call returns HTTP 500; all subsequent calls return HTTP 200 with 3 Bristol addresses.

**Critical constraint:** `playwright.config.ts` sets `reuseExistingServer: false` and `workers: 1`. This ensures every test run gets a fresh Node.js process (counter reset to 0) and tests run sequentially (no concurrent counter mutation). See [BUG-003 in bug-reports.md](./bug-reports.md) for the issue encountered when `reuseExistingServer: true` was used.

---

## AI Engineering Approach

This project was built using **Claude Code** (Anthropic's CLI for Claude) as the primary engineering accelerator across a 5-day sprint. Claude Code was used for:

- Scaffolding the full Next.js project structure from the CLAUDE.md specification
- Implementing all 4 API routes with correct TypeScript types
- Building all 4 booking wizard step components with required `data-testid` attributes
- Writing the complete Playwright test suite (e2e, API, edge cases)
- Diagnosing and fixing all test failures identified during CI runs

The engineering approach is documented in detail in `docs/DOC-008-AI-Engineering-Log.docx` *(if present)*.

Key workflow: the CLAUDE.md file served as the single authoritative specification — every component, API contract, and test was generated from it with no deviation. TypeScript's `tsc --noEmit` was run after every file to enforce compile-time correctness.

---

## Project Structure

```
rem-waste-qa/
├── app/
│   ├── api/
│   │   ├── postcode/lookup/route.ts    # POST /api/postcode/lookup
│   │   ├── waste-types/route.ts        # POST /api/waste-types
│   │   ├── skips/route.ts              # GET  /api/skips
│   │   └── booking/confirm/route.ts    # POST /api/booking/confirm
│   └── booking/page.tsx                # Main booking wizard
├── components/
│   ├── steps/                          # Step1–Step4 components
│   └── ui/                             # SkipCard, StepIndicator, etc.
├── fixtures/                           # In-memory test data
├── lib/types.ts                        # All TypeScript interfaces
├── page-objects/                       # Playwright Page Object Model
├── tests/
│   ├── e2e/                            # Smoke + regression E2E tests
│   └── api/                            # API regression tests
├── manual-tests.md                     # 39 manual test cases
├── bug-reports.md                      # 3 documented bugs
└── playwright.config.ts
```

---

## Documentation Library

All project documentation artefacts are in `docs/`:

| Document | Description |
|----------|-------------|
| [DOC-001 Project Glossary](./docs/DOC-001-Project-Glossary.docx) | Definitions of domain terms used across the project |
| [DOC-002 Project Charter](./docs/DOC-002-Project-Charter.docx) | Scope, objectives, and success criteria |
| [DOC-003 Product Backlog](./docs/DOC-003-Product-Backlog.xlsx) | All user stories with acceptance criteria and status |
| [DOC-004 ADR Collection](./docs/DOC-004-ADR-Collection.docx) | Architecture Decision Records |
| [DOC-005 Test Strategy](./docs/DOC-005-Test-Strategy.docx) | Testing approach, coverage targets, and tooling rationale |
| [DOC-006 Release Management Plan](./docs/DOC-006-Release-Management-Plan.docx) | Release checklist and deployment process |
| [DOC-007 Tech Stack Evaluation](./docs/DOC-007-Tech-Stack-Evaluation.docx) | Technology selection rationale |

---

## Test Coverage Summary

| Suite | Tag | Tests | Status |
|-------|-----|-------|--------|
| General waste E2E flow | @smoke | 1 | Pass |
| Heavy waste E2E flow | @smoke | 1 | Pass |
| Edge cases + regressions | @regression | 12 | Pass |
| API endpoint tests | @regression | 17 | Pass |
| **Total** | | **31** | **31 Pass** |

Manual test cases: **39** (see [manual-tests.md](./manual-tests.md))  
Bug reports: **3** (see [bug-reports.md](./bug-reports.md))

---

*Author: Evgenii Subbotin | Assessment: QA Engineering Sprint | Stack: Next.js · TypeScript · Playwright · Vercel*
