import { test, expect } from '@playwright/test';
import { Step1PostcodePage } from '../../page-objects/Step1PostcodePage';
import { Step2WasteTypePage } from '../../page-objects/Step2WasteTypePage';
import { Step3SkipSelectPage } from '../../page-objects/Step3SkipSelectPage';
import { Step4ReviewPage } from '../../page-objects/Step4ReviewPage';
import { POSTCODES, SKIP_SIZES, VALID_ADDRESS_ID } from '../../fixtures/testData';

test('@smoke — heavy waste booking with disabled skip verification', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);
  const step3 = new Step3SkipSelectPage(page);
  const step4 = new Step4ReviewPage(page);

  // ── Step 1 ────────────────────────────────────────────────────────────────
  await step1.goto('/');
  await step1.isLoaded();
  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await step1.selectAddress(VALID_ADDRESS_ID);
  await step1.continueButton.click();

  // ── Step 2: Heavy Waste ───────────────────────────────────────────────────
  await step2.isLoaded();
  await step2.selectWasteType('heavy');
  await expect(step2.continueButton).toBeEnabled();
  await step2.continueButton.click();

  // ── Step 3: Verify disabled skips ────────────────────────────────────────
  await step3.isLoaded();

  // 12-yard, 14-yard, 16-yard must be disabled
  await expect(step3.skipCardDisabled(SKIP_SIZES.disabledHeavy1)).toBeVisible();
  await expect(step3.skipCardDisabled(SKIP_SIZES.disabledHeavy2)).toBeVisible();
  await expect(step3.skipCardDisabled(SKIP_SIZES.disabledHeavy3)).toBeVisible();

  // Disabled cards should visually indicate they are not usable
  await expect(step3.skipCard(SKIP_SIZES.disabledHeavy1)).toHaveClass(/opacity-50/);
  await expect(step3.skipCard(SKIP_SIZES.disabledHeavy1)).toHaveClass(/cursor-not-allowed/);

  // Clicking a disabled skip must NOT select it
  await step3.skipCard(SKIP_SIZES.disabledHeavy1).click({ force: true });
  await expect(step3.selectedSummary).not.toBeVisible();
  await expect(step3.continueButton).toBeDisabled();

  // 8-yard is enabled — select it
  await step3.selectSkip(SKIP_SIZES.large);
  await expect(step3.selectedSummary).toBeVisible();
  await expect(step3.selectedSummary).toContainText(SKIP_SIZES.large);
  await expect(step3.continueButton).toBeEnabled();
  await step3.continueButton.click();

  // ── Step 4: Verify heavyWaste in payload ─────────────────────────────────
  await step4.isLoaded();
  await expect(step4.wasteType).toContainText('Heavy Waste');
  await expect(step4.skipSize).toContainText(SKIP_SIZES.large);
  await expect(step4.priceBase).toContainText('£200');

  const captured: { body: Record<string, unknown> | null } = { body: null };
  await page.route('**/api/booking/confirm', async route => {
    captured.body = route.request().postDataJSON() as Record<string, unknown>;
    await route.continue();
  });

  await step4.confirm();
  await expect(step4.bookingSuccess).toBeVisible({ timeout: 10_000 });
  await expect(step4.bookingId).toContainText('BK-');

  // heavyWaste must be true in the POST payload
  expect(captured.body?.heavyWaste).toBe(true);
  expect(captured.body?.skipSize).toBe(SKIP_SIZES.large);
});
