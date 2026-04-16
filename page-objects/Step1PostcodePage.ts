import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step1PostcodePage extends BasePage {
  readonly postcodeInput  = this.page.getByTestId('postcode-input');
  readonly submitButton   = this.page.getByTestId('postcode-submit');
  readonly loadingSpinner = this.page.getByTestId('loading-spinner');
  readonly errorMessage   = this.page.getByTestId('error-message');
  readonly retryButton    = this.page.getByTestId('retry-button');
  readonly continueButton = this.page.getByTestId('step1-continue');
  readonly manualToggle   = this.page.getByTestId('manual-entry-toggle');
  readonly addressList    = this.page.getByTestId('address-list');
  readonly manualLine1    = this.page.getByTestId('manual-line1');
  readonly manualLine2    = this.page.getByTestId('manual-line2');
  readonly manualCity     = this.page.getByTestId('manual-city');

  addressOption = (id: string) => this.page.getByTestId(`address-option-${id}`);

  constructor(page: Page) { super(page); }

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
