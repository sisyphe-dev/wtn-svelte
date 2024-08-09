import { test, expect } from '@playwright/test';
import { mockSignIn } from './utils/mockInternetIdentity';

test('has title', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('WaterNeuron | ICP Liquid Staking');
});

test('test urls', async ({ page }) => {
	await page.goto('/');
  await expect(page).toHaveURL('/stake/');

  await page.goto('/any');
  await expect(page).toHaveURL('/stake/');

  await page.goto('/sns/');
  await expect(page).toHaveURL('/sns/');

  await page.goto('/wallet/');
  await expect(page).toHaveURL('/stake/');
});

test('connection', async ({page}) => {
  await page.goto('/');
  let connectBtn = page.locator('[title="connect-btn"]');
  await expect(connectBtn).toBeVisible();

  await mockSignIn();
  await page.goto('/wallet/');
  await expect(page).toHaveURL('/stake/');
});