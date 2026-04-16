import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step3SkipSelectPage extends BasePage {
  readonly continueButton  = this.page.getByTestId('step3-continue');
  readonly selectedSummary = this.page.getByTestId('skip-selected-summary');
  readonly loadingSpinner  = this.page.getByTestId('loading-spinner');

  skipCard         = (size: string) => this.page.getByTestId(`skip-card-${size}`);
  skipCardDisabled = (size: string) => this.page.getByTestId(`skip-card-${size}-disabled`);
  skipCardPrice    = (size: string) => this.page.getByTestId(`skip-card-${size}-price`);

  constructor(page: Page) { super(page); }

  async isLoaded() {
    // Wait for skips to load
    await this.skipCard('2-yard').waitFor({ state: 'visible', timeout: 15_000 });
  }

  async selectSkip(size: string) {
    await this.skipCard(size).click();
  }
}
