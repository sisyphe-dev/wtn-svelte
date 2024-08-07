import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('http://localhost:5173/');

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