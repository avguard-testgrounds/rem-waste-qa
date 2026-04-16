import { test, expect } from '@playwright/test';
import { Step1PostcodePage } from '../../page-objects/Step1PostcodePage';
import { Step2WasteTypePage } from '../../page-objects/Step2WasteTypePage';
import { Step3SkipSelectPage } from '../../page-objects/Step3SkipSelectPage';
import { Step4ReviewPage } from '../../page-objects/Step4ReviewPage';
import { POSTCODES, SKIP_SIZES, VALID_ADDRESS_ID } from '../../fixtures/testData';

test('@smoke — complete general waste booking flow', async ({ page }) => {
  const step1 = new Step1PostcodePage(page);
  const step2 = new Step2WasteTypePage(page);
  const step3 = new Step3SkipSelectPage(page);
  const step4 = new Step4ReviewPage(page);

  // ── Step 1: Postcode & Address ────────────────────────────────────────────
  await step1.goto('/');
  await step1.isLoaded();

  await step1.lookupPostcode(POSTCODES.valid.sw1a);
  await expect(step1.loadingSpinner).not.toBeVisible({ timeout: 10_000 });
  await expect(step1.addressList).toBeVisible();

  // Verify 12 addresses are shown
  const addressOptions = page.locator('[data-testid^="address-option-"]');
  await expect(addressOptions).toHaveCount(12);

  // Select first address and continue
  await step1.selectAddress(VALID_ADDRESS_ID);
  await expect(step1.continueButton).toBeEnabled();
  await step1.continueButton.click();

  // ── Step 2: Waste Type ────────────────────────────────────────────────────
  await step2.isLoaded();
  await expect(page.getByTestId('step-indicator-2')).toBeVisible();

  await step2.selectWasteType('general');
  await expect(step2.continueButton).toBeEnabled();
  await step2.continueButton.click();

  // ── Step 3: Skip Selection ────────────────────────────────────────────────
  await step3.isLoaded();
  await expect(page.getByTestId('step-indicator-3')).toBeVisible();

  // All 8 skips should be enabled
  const allCards = page.locator('[data-testid^="skip-card-"][data-testid$="-yard"]');
  await expect(allCards).toHaveCount(8);

  // Select 6-yard (£160)
  await step3.selectSkip(SKIP_SIZES.medium);
  await expect(step3.selectedSummary).toBeVisible();
  await expect(step3.selectedSummary).toContainText('6-yard');
  await expect(step3.selectedSummary).toContainText('£160');
  await expect(step3.continueButton).toBeEnabled();
  await step3.continueButton.click();

  // ── Step 4: Review & Confirm ──────────────────────────────────────────────
  await step4.isLoaded();
  await expect(page.getByTestId('step-indicator-4')).toBeVisible();

  await expect(step4.postcode).toContainText(POSTCODES.valid.sw1a);
  await expect(step4.wasteType).toContainText('General Waste');
  await expect(step4.skipSize).toContainText(SKIP_SIZES.medium);
  await expect(step4.priceBase).toContainText('£160');
  await expect(step4.priceTotal).toContainText('£160');

  // Assert exactly ONE POST fires
  const confirmRequests: string[] = [];
  page.on('request', req => {
    if (req.url().includes('/api/booking/confirm') && req.method() === 'POST') {
      confirmRequests.push(req.url());
    }
  });

  await step4.confirm();
  await expect(step4.bookingSuccess).toBeVisible({ timeout: 10_000 });
  await expect(step4.bookingId).toContainText('BK-');

  expect(confirmRequests).toHaveLength(1);
});
