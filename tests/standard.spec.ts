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

  await page.click('[title="ii-connect-btn"]');
  await page.click('[title="connect-btn"]');

  await expect(page).toHaveURL("http://127.0.0.1:8080/?canisterId=qhbym-qaaaa-aaaaa-aaafq-cai#authorize")
});