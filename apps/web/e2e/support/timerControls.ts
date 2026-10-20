import { expect, type Page } from '@playwright/test';

export async function waitForTimerReady(page: Page) {
  const scramble = page.locator('.timer-page__scramble');
  await expect(scramble).toHaveAttribute('aria-busy', 'false');
  await expect(scramble.locator('.timer-page__scramble-notation')).toBeVisible();
  await expect(scramble.getByRole('status')).toHaveText('Ready');
  await expect(page.getByRole('timer')).not.toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => page.getByRole('combobox', { name: 'Session' }).getAttribute('aria-valuetext')).not.toBeNull();
  await expect.poll(() => page.getByRole('combobox', { name: 'Session' }).getAttribute('aria-valuetext')).not.toMatch(/^Loading sessions/u);
}

export async function chooseTimerOption(page: Page, label: string, optionName: string) {
  const combobox = page.getByRole('combobox', { name: label });
  await expect(combobox).toBeEnabled();
  await combobox.click();
  const listbox = page.getByRole('listbox', { name: label });
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name: optionName, exact: true }).click();
  await expect(combobox).toHaveAttribute('aria-valuetext', optionName);
}
