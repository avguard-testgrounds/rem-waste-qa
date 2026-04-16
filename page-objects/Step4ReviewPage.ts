import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step4ReviewPage extends BasePage {
  readonly postcode           = this.page.getByTestId('review-postcode');
  readonly address            = this.page.getByTestId('review-address');
  readonly wasteType          = this.page.getByTestId('review-waste-type');
  readonly plasterboardOption = this.page.getByTestId('review-plasterboard-option');
  readonly skipSize           = this.page.getByTestId('review-skip-size');
  readonly priceBase          = this.page.getByTestId('review-price-base');
  readonly priceTotal         = this.page.getByTestId('review-price-total');
  readonly confirmButton      = this.page.getByTestId('confirm-button');
  readonly confirmLoading     = this.page.getByTestId('confirm-loading');
  readonly bookingSuccess     = this.page.getByTestId('booking-success');
  readonly bookingId          = this.page.getByTestId('booking-id');

  constructor(page: Page) { super(page); }

  async isLoaded() {
    await this.assertVisible(this.postcode);
  }

  async confirm() {
    await this.confirmButton.click();
  }
}
