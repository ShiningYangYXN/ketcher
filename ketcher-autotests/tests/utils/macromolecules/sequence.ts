/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { moveMouseAway } from '@utils';

export async function selectSequenceRangeInEditMode(
  page: Page,
  fromSymbol: Locator,
  toSymbol: Locator,
) {
  await fromSymbol.hover();
  await page.mouse.down();

  // it needs to trigger mousemove event several times to activate selection mode
  // due to the specific of implementation
  await page.mouse.move(0, 0);
  await page.mouse.move(10, 10);

  await toSymbol.hover();

  await page.mouse.up();
  await moveMouseAway(page);
}

export async function pressCancelInConfirmYourActionDialog(page: Page) {
  await page.getByRole('button', { name: 'Cancel' }).click();
}

export async function pressYesInConfirmYourActionDialog(page: Page) {
  await page.getByRole('button', { name: 'Yes' }).click();
}

export async function CloseConfirmYourActionDialog(page: Page) {
  await page.getByRole('button', { name: 'Close window' }).click();
}
