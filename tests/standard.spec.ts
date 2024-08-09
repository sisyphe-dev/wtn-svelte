import { test, expect } from '@playwright/test';
import {testWithII} from '@dfinity/internet-identity-playwright';
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

  await mockSignIn();
});

test('connection', async ({page}) => {
  await page.goto('/');
  const connectBtn = page.locator('[title="connect-btn"]');
  await expect(connectBtn).toBeVisible();
});