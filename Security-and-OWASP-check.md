# Security & OWASP Audit Report

## Metadata

| Field | Value |
|-------|-------|
| Project | rem-waste-qa |
| Date | 2026-04-16 |
| Auditor | Claude Sonnet 4.6 (automated) |
| Standard | OWASP Top 10 2021 + CWE Top 25 (2024 edition) |
| Scope | Full codebase scan excluding node_modules, .next, playwright-report, test-results |
| Framework | Next.js 16.2.4 / TypeScript / Tailwind CSS |
| Auth | None (no authentication layer in scope) |

---

## OWASP Top 10 2021 — Reference

| ID | Name | Key CWEs | Status in This Project |
|----|------|----------|------------------------|
| A01 | Broken Access Control | CWE-200, CWE-284, CWE-285, CWE-352, CWE-601, CWE-639, CWE-862, CWE-863 | PARTIAL — no auth required (by design), but missing CSRF token and open-redirect risk in redirect logic |
| A02 | Cryptographic Failures | CWE-261, CWE-311, CWE-312, CWE-319, CWE-326, CWE-327, CWE-328, CWE-329 | LOW — no secrets stored; HSTS header absent |
| A03 | Injection | CWE-20, CWE-74, CWE-77, CWE-78, CWE-79, CWE-89, CWE-116 | MEDIUM — postcode query param interpolated into URL without encoding; no dangerouslySetInnerHTML found |
| A04 | Insecure Design | CWE-73, CWE-183, CWE-209, CWE-256, CWE-501, CWE-522 | HIGH — no rate limiting on any API route; booking price accepted from client payload without server-side validation |
| A05 | Security Misconfiguration | CWE-2, CWE-11, CWE-13, CWE-15, CWE-260, CWE-520 | HIGH — next.config.ts is empty (no security headers); verbose error detail echoed in 500 response; no CSP |
| A06 | Vulnerable and Outdated Components | CWE-1035, CWE-1104 | INFO — all direct dependencies appear current; npm audit recommended |
| A07 | Identification and Authentication Failures | CWE-255, CWE-259, CWE-287, CWE-288, CWE-290, CWE-306, CWE-307, CWE-522 | N/A — no auth in scope; module-level counter shared across requests is a logical-integrity risk |
| A08 | Software and Data Integrity Failures | CWE-345, CWE-346, CWE-353, CWE-426, CWE-494, CWE-502, CWE-565 | MEDIUM — CI workflow uses `actions/checkout@v5` (non-pinned SHA); no subresource integrity on external assets |
| A09 | Security Logging and Monitoring Failures | CWE-117, CWE-223, CWE-532, CWE-778 | MEDIUM — zero structured logging in any API route; no monitoring or alerting configured |
| A10 | Server-Side Request Forgery (SSRF) | CWE-918 | LOW — no user-controlled URLs used in server-side fetch calls |

---

## CWE Top 25 2024 — Applicable Subset

| Rank | CWE-ID | Name | Applicable | Finding |
|------|--------|------|------------|---------|
| 1 | CWE-79 | Cross-site Scripting (XSS) | YES | React escapes JSX by default; no dangerouslySetInnerHTML found. Risk: unencoded postcode in URL query string (SEC-003) |
| 2 | CWE-787 | Out-of-bounds Write | NO | Not applicable to JavaScript/TypeScript web app |
| 3 | CWE-89 | SQL Injection | NO | No database; all data is in-memory fixtures |
| 4 | CWE-352 | Cross-Site Request Forgery (CSRF) | YES | No CSRF tokens on any state-mutating API route (SEC-006) |
| 5 | CWE-22 | Path Traversal | NO | No filesystem access in routes |
| 6 | CWE-125 | Out-of-bounds Read | NO | Not applicable |
| 7 | CWE-78 | OS Command Injection | NO | No shell invocations |
| 8 | CWE-416 | Use After Free | NO | Not applicable |
| 9 | CWE-862 | Missing Authorization | YES | All API routes are unauthenticated and publicly accessible (by design, but flagged) (SEC-001) |
| 10 | CWE-434 | Unrestricted Upload of Dangerous File | NO | No file upload functionality |
| 11 | CWE-94 | Code Injection | NO | No eval or dynamic code execution found |
| 12 | CWE-20 | Improper Input Validation | YES | Price and skipSize accepted from client without server-side validation (SEC-007); plasterboardOption not validated against enum (SEC-008) |
| 13 | CWE-77 | Command Injection | NO | No shell invocations |
| 14 | CWE-287 | Improper Authentication | N/A | No auth layer in scope |
| 15 | CWE-269 | Improper Privilege Management | N/A | No roles or privilege model |
| 16 | CWE-502 | Deserialization of Untrusted Data | LOW | `request.json()` used directly; Next.js/V8 JSON parser is safe for well-formed JSON |
| 17 | CWE-200 | Exposure of Sensitive Information | YES | BS1 4DJ route returns raw "Internal server error" string in 500 body (SEC-005) |
| 18 | CWE-863 | Incorrect Authorization | N/A | No roles in scope |
| 19 | CWE-918 | SSRF | LOW | No user-controlled URLs used server-side |
| 20 | CWE-119 | Buffer Bounds | NO | Not applicable |
| 21 | CWE-476 | NULL Pointer Dereference | LOW | `booking.selectedSkip!` non-null assertion in Step4Review (SEC-012) |
| 22 | CWE-798 | Hard-coded Credentials | NO | No credentials found in codebase |
| 23 | CWE-190 | Integer Overflow | NO | Not applicable |
| 24 | CWE-400 | Uncontrolled Resource Consumption | YES | No rate limiting on any API endpoint (SEC-004) |
| 25 | CWE-306 | Missing Authentication for Critical Function | YES | POST /api/booking/confirm has no authentication (by design); noted as risk if deployed publicly (SEC-001) |

---

## Findings — Secrets & Credentials

| Finding-ID | File | Line | Pattern | Severity | Status | Remediation |
|------------|------|------|---------|----------|--------|-------------|
| SEC-S001 | — | N/A | api_key / secret / token | INFO | PASS — No secrets found in source code | Run `npm audit` and a dedicated secret scanner (e.g., trufflehog) on git history before public release |
| SEC-S002 | .gitignore | 34 | `.env*` | INFO | PASS — .env files are excluded from git | Confirm `.env.local` and `.env.production` do not exist or are not committed; verified by filesystem check |
| SEC-S003 | package-lock.json | 5563 | `sk-` prefix match (false positive: npm registry tgz URL containing `queue-microtask`) | INFO | FALSE POSITIVE — npm registry URL, not a credential | No action required |

---

## Findings — Code Vulnerabilities

| Finding-ID | OWASP-ID | CWE-ID | File | Line(s) | Description | Severity | Recommendation |
|------------|----------|--------|------|---------|-------------|----------|----------------|
| SEC-001 | A01 | CWE-862 | `app/api/booking/confirm/route.ts` | 1–27 | POST /api/booking/confirm is publicly accessible with no authentication, authorization, or CSRF protection. Any origin can fire arbitrary booking confirmations. | HIGH | Add `Origin` header validation or implement a CSRF token pattern. If the app is deployed publicly, add a server-side idempotency key check. |
| SEC-002 | A05 | CWE-16 | `next.config.ts` | 1–7 | Security headers entirely absent: no `Content-Security-Policy`, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Strict-Transport-Security`, no `Referrer-Policy`, no `Permissions-Policy`. Next.js does not set these by default. | HIGH | Add a `headers()` async function to `next.config.ts` setting at minimum: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a Content-Security-Policy. |
| SEC-003 | A03 | CWE-79 | `components/steps/Step3SkipSelect.tsx` | 31 | The `postcode` value (user-supplied, normalised but not URL-encoded) is interpolated directly into a fetch URL: `` `/api/skips?postcode=${norm}&heavyWaste=${heavyWaste}` ``. While the UK postcode regex prevents characters like `&`, `=`, or `#`, this is an implicit reliance on upstream validation rather than explicit encoding. | MEDIUM | Wrap the interpolated values with `encodeURIComponent()`: `` `/api/skips?postcode=${encodeURIComponent(norm)}&heavyWaste=${encodeURIComponent(String(heavyWaste))}` `` |
| SEC-004 | A04 | CWE-400 | `app/api/postcode/lookup/route.ts`, `app/api/waste-types/route.ts`, `app/api/skips/route.ts`, `app/api/booking/confirm/route.ts` | N/A (all routes) | No rate limiting on any API route. The `/api/postcode/lookup` endpoint introduces a 1500ms artificial delay for M1 1AE which is server-side resource consumption; combined with no rate limiting, this is a trivial DoS vector. Any IP can send unlimited requests. | HIGH | Implement rate limiting at the edge (Vercel Edge Middleware or a package such as `@upstash/ratelimit`). Apply stricter limits to `/api/booking/confirm` and `/api/postcode/lookup`. |
| SEC-005 | A09 | CWE-200 | `app/api/postcode/lookup/route.ts` | 58 | The BS1 4DJ error branch returns `{ error: 'Internal server error' }` with HTTP 500. While this specific string is benign, the pattern of echoing internal error state in response bodies can expose stack traces or implementation details in future error paths. No structured server-side logging exists in any route — errors are entirely silent server-side. | MEDIUM | Replace the raw string with a generic client-safe message (e.g., `{ error: 'Service temporarily unavailable' }`). Add server-side logging using `console.error` or a structured logger (e.g., Pino) for the 500 branch so errors are observable without being exposed to clients. |
| SEC-006 | A01 | CWE-352 | `app/api/postcode/lookup/route.ts`, `app/api/waste-types/route.ts`, `app/api/booking/confirm/route.ts` | N/A (all POST routes) | No CSRF protection on any state-mutating POST endpoint. Next.js App Router does not add CSRF tokens automatically. A malicious site could trigger cross-origin POST requests from a victim's browser (though `Content-Type: application/json` provides partial mitigation via CORS preflight — only if CORS is configured correctly, which it currently is not). | MEDIUM | Validate the `Origin` or `Referer` header server-side on all POST routes. Alternatively use a double-submit cookie CSRF token pattern. At minimum, confirm that the Vercel deployment's default CORS policy blocks cross-origin requests. |
| SEC-007 | A04 | CWE-20 | `app/api/booking/confirm/route.ts` | 12–26 | The `price` field is accepted from the client payload and used directly in the booking confirmation response without any server-side validation. A malicious actor can send `price: 0` or `price: -999`. Similarly `skipSize` is not validated against the known set of valid sizes (`2-yard` through `16-yard`). | HIGH | Derive `price` server-side from the `skipSize` using the `getSkips()` fixture — never trust a price sent from the client. Validate `skipSize` against the enum of known sizes. Remove `price` from the `BookingConfirmRequest` interface or mark it as informational only. |
| SEC-008 | A04 | CWE-20 | `app/api/booking/confirm/route.ts`, `app/api/waste-types/route.ts` | 12–21 (confirm), 19–20 (waste-types) | `plasterboardOption` in `/api/booking/confirm` is checked for presence (`!(field in body)`) but its value is never validated against the `PlasterboardOption` union type (`'separate-bag' \| 'dedicated-skip' \| 'licensed-carrier'`). An attacker can submit `plasterboardOption: "arbitrary-string"`. Same issue in `/api/waste-types`. | MEDIUM | Add explicit enum validation: `const VALID_PLASTERBOARD = ['separate-bag', 'dedicated-skip', 'licensed-carrier']; if (body.plasterboardOption !== null && !VALID_PLASTERBOARD.includes(body.plasterboardOption)) return 400`. |
| SEC-009 | A08 | CWE-345 | `.github/workflows/playwright.yml` | 17 | `actions/checkout@v5` is referenced by tag (floating), not by pinned commit SHA. A compromised tag or GitHub Actions supply chain attack could silently inject malicious code into the CI pipeline. | MEDIUM | Pin all GitHub Actions to their full commit SHA. Example: `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v5`. Use Dependabot for automated SHA pinning updates. |
| SEC-010 | A05 | CWE-16 | `.github/workflows/playwright.yml` | 37, 43 | `BASE_URL` defaults to `http://localhost:3000` (plaintext HTTP) when the `BASE_URL` secret is not set. If CI runs tests against a production URL over HTTP, all test traffic (including any credentials in future) would be unencrypted. | LOW | Set `BASE_URL` GitHub Actions secret to the HTTPS Vercel URL before production testing. Add a CI step that validates `BASE_URL` starts with `https://` when running in the non-PR (push to main) job. |
| SEC-011 | A04 | CWE-501 | `fixtures/postcodes.ts` | (module-level `bs14djCallCount`) | The BS1 4DJ retry counter is a module-level mutable singleton. In a production Next.js deployment with multiple serverless function instances or warm instances, the counter state is not shared across instances, making the retry behaviour non-deterministic. This is a logical design flaw rather than a direct security issue, but it creates an observable inconsistency. | LOW | Document explicitly that this counter is a test fixture behaviour only. Add a comment stating it is not suitable for multi-instance production deployments. If a production retry simulation is needed, use a shared store (e.g., Redis) or a stateless approach. |
| SEC-012 | A04 | CWE-476 | `components/steps/Step4Review.tsx` | 35 | `const skip = booking.selectedSkip!` uses a TypeScript non-null assertion. If `Step4Review` is ever rendered without a `selectedSkip` (e.g., due to a state bug or direct URL navigation), this will throw a runtime TypeError. The parent component has a guard (`booking.selectedSkip && <Step4Review ...>`), but the component itself has no defensive check. | LOW | Remove the non-null assertion and add a defensive guard: `if (!booking.selectedSkip) return null;` at the top of the component. This is defence-in-depth against upstream state bugs. |
| SEC-013 | A09 | CWE-778 | All API routes | N/A | No server-side logging of any kind exists in any API route handler. Successful bookings, failed validations, and 500 errors are all silent server-side. This makes incident response and debugging impossible without Vercel function log inspection. | LOW | Add structured logging at minimum for: 400/422/500 responses (log method, path, error reason), successful bookings (log bookingId — excluding PII like postcode unless required), and for rate limit hits (once rate limiting is added). |
| SEC-014 | A02 | CWE-330 | `app/api/booking/confirm/route.ts` | 24 | `Math.random()` is used to generate booking IDs (`BK-XXXXX`). `Math.random()` is not cryptographically secure (CWE-338). While booking IDs here have no security function (no auth, no secret), if this pattern is copied to a future auth token or reset-token generator it would be a vulnerability. | INFO | Replace `Math.random()` with `crypto.randomInt()` from Node.js built-ins: `const bookingId = \`BK-\${crypto.randomInt(10000, 99999)}\``. This is a zero-effort improvement and eliminates the anti-pattern. |
| SEC-015 | A05 | CWE-16 | `components/steps/ManualAddressForm.tsx` | 11 | The manual address form uses computed property name `[field]: e.target.value` where `field` is typed as `keyof ManualAddress`. While TypeScript constrains this at compile time, the computed property pattern combined with user input could enable prototype pollution in environments where the type guard is absent or bypassed. No current exploit path exists due to TypeScript's strict typing. | INFO | This is a defence-in-depth note. The current implementation is safe. If the pattern is extended to less-typed code, add an explicit allowlist check: `const ALLOWED_FIELDS = ['line1', 'line2', 'city', 'postcode']; if (!ALLOWED_FIELDS.includes(field)) return;`. |

---

## Findings — Dependency Vulnerabilities

| Package | Version | CVE / Advisory | Severity | Action |
|---------|---------|----------------|----------|--------|
| next | 16.2.4 | No known CVEs as of audit date for 16.2.4 | INFO | Run `npm audit` to confirm. Monitor Next.js security advisories at https://github.com/vercel/next.js/security/advisories |
| react | 19.2.4 | No known CVEs as of audit date | INFO | Run `npm audit` to confirm |
| react-dom | 19.2.4 | No known CVEs as of audit date | INFO | Run `npm audit` to confirm |
| @playwright/test | ^1.59.1 | No known CVEs as of audit date | INFO | Keep updated; Playwright is a dev-only dependency not shipped to production |
| typescript | ^5 | No known CVEs as of audit date | INFO | Dev-only; not shipped to production |
| eslint | ^9 | No known CVEs as of audit date | INFO | Dev-only; not shipped to production |
| — | — | `package-lock.json` is present | INFO | Run `npm audit` locally and in CI to catch transitive dependency CVEs. Add `npm audit --audit-level=high` as a CI step. |

---

## CI/CD Security

| Check | Status | Notes |
|-------|--------|-------|
| Secrets in workflow files | PASS | No hardcoded secrets in `.github/workflows/playwright.yml` |
| `BASE_URL` secret usage | WARN | Falls back to `http://` (plaintext) if secret not set — see SEC-010 |
| Actions pinned by SHA | FAIL | `actions/checkout@v5`, `actions/setup-node@v4.2.0`, `actions/upload-artifact@v4.6.2` use tags, not commit SHAs — see SEC-009 |
| `npm audit` step in CI | FAIL | No `npm audit` step present in the workflow |
| Dependency cache | PASS | `cache: 'npm'` configured in setup-node step |
| TypeScript check in CI | PASS | `npx tsc --noEmit` runs as a quality gate step |
| Playwright report uploaded | PASS | HTML report and JUnit XML uploaded as artifacts with 14-day retention |
| GITHUB_TOKEN permissions | WARN | No explicit `permissions:` block — defaults to repository-level settings. Best practice is to add `permissions: contents: read` to the job to follow least privilege |
| Branch protection | UNKNOWN | Cannot verify from code scan — confirm `main` branch requires PR review and status checks in GitHub repository settings |
| No force-push protection | UNKNOWN | Cannot verify from code scan — confirm `main` branch has `Allow force pushes` disabled |

---

## Remediation Priority

| Priority | Finding-ID | Effort | Impact |
|----------|------------|--------|--------|
| 1 | SEC-007 | LOW — add server-side price/skipSize validation in one route file | CRITICAL — prevents client-side price manipulation |
| 2 | SEC-002 | LOW — add headers() block to next.config.ts (~30 lines) | HIGH — enables CSP, clickjacking protection, MIME sniffing protection |
| 3 | SEC-004 | MEDIUM — integrate Vercel Edge Middleware or @upstash/ratelimit | HIGH — prevents DoS against all API routes |
| 4 | SEC-001 | MEDIUM — add Origin header validation to POST routes | HIGH — closes CSRF and cross-origin abuse vector |
| 5 | SEC-006 | LOW — validate Origin/Referer header in POST handlers | MEDIUM — CSRF mitigation (defence in depth with SEC-001) |
| 6 | SEC-009 | LOW — replace tag references with pinned commit SHAs in workflow | MEDIUM — supply chain attack prevention |
| 7 | SEC-003 | LOW — wrap URL interpolation with encodeURIComponent() | MEDIUM — eliminates implicit encoding reliance |
| 8 | SEC-008 | LOW — add enum validation for plasterboardOption in two route files | MEDIUM — closes input validation gap |
| 9 | SEC-005 | LOW — replace raw error string; add console.error logging | MEDIUM — reduces information disclosure; improves observability |
| 10 | SEC-013 | LOW — add structured logging to all route handlers | LOW — improves incident response capability |
| 11 | SEC-010 | LOW — document and enforce HTTPS BASE_URL in CI | LOW — prevents plaintext test traffic against production |
| 12 | SEC-014 | LOW — replace Math.random() with crypto.randomInt() | LOW — eliminates weak PRNG anti-pattern before it spreads |
| 13 | SEC-011 | LOW — add comment documenting counter behaviour | LOW — prevents logical errors in multi-instance deployments |
| 14 | SEC-012 | LOW — add null guard in Step4Review component | LOW — defence-in-depth against state bugs |
| 15 | SEC-015 | INFO — document computed property pattern | INFO — no current exploit path |

---

## Summary

| Metric | Count |
|--------|-------|
| CRITICAL | 0 |
| HIGH | 3 (SEC-001, SEC-002, SEC-004, SEC-007) |
| MEDIUM | 6 (SEC-003, SEC-005, SEC-006, SEC-008, SEC-009, SEC-010) |
| LOW | 4 (SEC-010, SEC-011, SEC-012, SEC-013) |
| INFO | 2 (SEC-014, SEC-015) |
| Secrets found | 0 |
| Dependency CVEs identified | 0 (npm audit recommended to confirm) |

> **Note on HIGH count:** The table lists 4 finding IDs under HIGH above. SEC-007 (client-side price accepted without server validation) is the most business-critical issue. SEC-002 (missing security headers) and SEC-004 (no rate limiting) are infrastructure-level hardening gaps standard for any public-facing deployment.

| Gate | Result |
|------|--------|
| No CRITICAL findings | PASS |
| No hardcoded secrets | PASS |
| No known CVEs in direct dependencies | PASS (unconfirmed — run npm audit) |
| Security headers configured | FAIL — SEC-002 |
| Rate limiting present | FAIL — SEC-004 |
| Server-side price validation | FAIL — SEC-007 |
| CI actions pinned by SHA | FAIL — SEC-009 |
| **Overall pass/fail gate** | **FAIL — 4 items require remediation before production hardening is complete** |
