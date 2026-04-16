import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class Step2WasteTypePage extends BasePage {
  readonly continueButton = this.page.getByTestId('step2-continue');
  readonly wasteTypeGeneral      = this.page.getByTestId('waste-type-general');
  readonly wasteTypeHeavy        = this.page.getByTestId('waste-type-heavy');
  readonly wasteTypePlasterboard = this.page.getByTestId('waste-type-plasterboard');

  plasterboardOption = (option: string) => this.page.getByTestId(`plasterboard-${option}`);

  constructor(page: Page) { super(page); }

  async isLoaded() {
    await this.assertVisible(this.wasteTypeGeneral);
  }

  async selectWasteType(type: 'general' | 'heavy' | 'plasterboard') {
    await this.page.getByTestId(`waste-type-${type}`).click();
  }

  async selectPlasterboardOption(option: string) {
    await this.plasterboardOption(option).click();
  }
}
