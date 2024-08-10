import { test, expect } from '@playwright/test';
import {testWithII} from '@dfinity/internet-identity-playwright';
import { user } from '$lib/stores';
import { get } from 'svelte/store';

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

testWithII('should sign-in with a new user', async ({page, iiPage}) => {
  await page.goto('/');

  let connectBtn = page.locator('[title="connect-btn"]');
  await connectBtn.click();

  await iiPage.signInWithNewIdentity({selector: '[title="ii-connect-btn"]'});

  let walletInfo = page.locator('#wallet-info');
  await expect(walletInfo).toBeVisible();

  await walletInfo.click();
  await expect(page).toHaveURL('/wallet/');
}); 