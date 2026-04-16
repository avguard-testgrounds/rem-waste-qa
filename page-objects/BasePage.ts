import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '') { await this.page.goto(path); }

  async assertVisible(locator: Locator, msg?: string) {
    await expect(locator, msg).toBeVisible();
  }

  async assertText(locator: Locator, expected: string) {
    await expect(locator).toContainText(expected);
  }

  async assertUrl(pattern: string | RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  abstract isLoaded(): Promise<void>;
}
