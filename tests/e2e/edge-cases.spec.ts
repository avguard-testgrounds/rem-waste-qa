import { test, expect, Page } from '@playwright/test';
import { Step1PostcodePage } from '../../page-objects/Step1PostcodePage';
import { Step2WasteTypePage } from '../../page-objects/Step2WasteTypePage';
import { Step3SkipSelectPage } from '../../page-objects/Step3SkipSelectPage';
import { Step4ReviewPage } from '../../page-objects/Step4ReviewPage';
import { POSTCODES, SKIP_SIZES, PLASTERBOARD_OPTIONS, VALID_ADDRESS_ID } from '../../fixtures/testData';

// ── Helper: complete Steps 1-3 quickly ───────────────────────────────────────
async function completeSteps123(page: Page, heavy = false) {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);
  const step3 = new Step3SkipSelectPage(page);

  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();

  await step2.isLoaded();
  await step2.selectWasteType(heavy ? 'heavy' : 'general');
  await step2.continueButton.click();

  await step3.isLoaded();
  await step3.selectSkip(heavy ? SKIP_SIZES.large : SKIP_SIZES.medium);
  await step3.continueButton.click();
}

// ── Input Validation ─────────────────────────────────────────────────────────

test('@regression empty postcode shows "Please enter a postcode"', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await step1.goto('/');
  await step1.submitButton.click();
  await expect(step1.errorMessage).toContainText('Please enter a postcode');
});

test('@regression invalid postcode format shows validation error', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await step1.goto('/');
  await step1.postcodeInput.fill(POSTCODES.invalid.wrongFormat);
  await step1.submitButton.click();
  await expect(step1.errorMessage).toContainText('Please enter a valid UK postcode');
});

test('@regression XSS input is rejected with validation error', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await step1.goto('/');
  await step1.postcodeInput.fill(POSTCODES.invalid.xss);
  await step1.submitButton.click();
  await expect(step1.errorMessage).toBeVisible();
  // Verify the XSS payload is not executed (page title unchanged)
  await expect(page).toHaveTitle(/REM Waste|Next\.js|Book/i);
});

test('@regression SQL injection input is rejected with validation error', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await step1.goto('/');
  await step1.postcodeInput.fill(POSTCODES.invalid.sqlInjection);
  await step1.submitButton.click();
  await expect(step1.errorMessage).toBeVisible();
});

// ── Empty State ───────────────────────────────────────────────────────────────

test('@regression EC1A 1BB shows no-addresses empty state', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.ec1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await expect(step1.addressList).not.toBeVisible();
  await expect(page.getByText('No addresses found')).toBeVisible();
  await expect(step1.continueButton).toBeDisabled();
});

// ── API Error + Retry ─────────────────────────────────────────────────────────

test('@regression API error shows error message and retry button', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  await page.route('**/api/postcode/lookup', route =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'server error' }) })
  );

  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.errorMessage).toBeVisible({ timeout: 10_000 });
  await expect(step1.retryButton).toBeVisible();

  // Unroute so retry succeeds
  await page.unroute('**/api/postcode/lookup');
  await step1.retryButton.click();
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await expect(step1.addressList).toBeVisible();
});

// ── Plasterboard Without Option ───────────────────────────────────────────────

test('@regression plasterboard without option keeps Continue disabled', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);

  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();

  await step2.isLoaded();
  await step2.selectWasteType('plasterboard');

  // Three sub-options must appear
  await expect(page.getByTestId(`plasterboard-${PLASTERBOARD_OPTIONS.separateBag}`)).toBeVisible();
  await expect(page.getByTestId(`plasterboard-${PLASTERBOARD_OPTIONS.dedicatedSkip}`)).toBeVisible();
  await expect(page.getByTestId(`plasterboard-${PLASTERBOARD_OPTIONS.licensedCarrier}`)).toBeVisible();

  // Continue disabled until option chosen
  await expect(step2.continueButton).toBeDisabled();

  // Select an option — continue becomes enabled
  await step2.selectPlasterboardOption(PLASTERBOARD_OPTIONS.separateBag);
  await expect(step2.continueButton).toBeEnabled();
});

// ── Back Navigation Preserves State ──────────────────────────────────────────

test('@regression back navigation preserves selections', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);
  const step3 = new Step3SkipSelectPage(page);

  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();

  await step2.isLoaded();
  await step2.selectWasteType('general');
  await step2.continueButton.click();

  await step3.isLoaded();
  // Go back to Step 2
  await page.getByRole('button', { name: 'Back' }).click();

  // Step 2 should still show General selected
  await step2.isLoaded();
  await expect(page.getByTestId('waste-type-general')).toHaveClass(/border-blue-600/);

  // Go back to Step 1
  await page.getByRole('button', { name: 'Back' }).click();
  await step1.isLoaded();
});

// ── Double-Submit Prevention ──────────────────────────────────────────────────

test('@regression double-submit prevention — only one POST fires', async ({ page }) => {
  await completeSteps123(page);
  const step4 = new Step4ReviewPage(page);
  await step4.isLoaded();

  let requestCount = 0;
  await page.route('**/api/booking/confirm', async route => {
    requestCount++;
    await new Promise(r => setTimeout(r, 800)); // delay to keep button disabled
    await route.continue();
  });

  // First click — button should immediately become disabled
  await step4.confirmButton.click();
  await expect(step4.confirmButton).toBeDisabled();

  // Second click with force (button is disabled, but ensure no second request fires)
  await step4.confirmButton.click({ force: true });

  await expect(step4.bookingSuccess).toBeVisible({ timeout: 15_000 });
  expect(requestCount).toBe(1);
});

// ── Browser Back Button ───────────────────────────────────────────────────────

test('@regression browser back button — app recovers gracefully', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);

  // Seed history so goBack() has a URL to return to (without this, goBack() → about:blank)
  await page.goto('/booking');
  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();
  await step2.isLoaded();

  // Press browser back — client-side state resets, user lands back at step 1
  await page.goBack();
  await expect(page).toHaveURL(/\//);
  // The app should still be functional
  await expect(page).not.toHaveTitle(/Error/i);
});

// ── Mobile Viewport ───────────────────────────────────────────────────────────

test('@regression mobile 375px — no horizontal overflow on Step 1', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/booking');
  const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(docWidth).toBeLessThanOrEqual(375);
});

test('@regression mobile 375px — no horizontal overflow on Step 3 (skip grid)', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);
  const step3 = new Step3SkipSelectPage(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await step1.goto('/');
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();

  await step2.isLoaded();
  await step2.selectWasteType('general');
  await step2.continueButton.click();

  await step3.isLoaded();
  const docWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(docWidth).toBeLessThanOrEqual(375);
  // Skip grid shows single column at 375px
  await expect(step3.skipCard('2-yard')).toBeVisible();
});
