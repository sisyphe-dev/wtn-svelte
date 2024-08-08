import { test, expect } from '@playwright/test';
import {testWithII} from '@dfinity/internet-identity-playwright';

test('has title', async ({ page }) => {
	await page.goto('/');

	await expect(page).toHaveTitle('WaterNeuron | ICP Liquid Staking');
});

testWithII('test urls', async ({ page, iiPage }) => {
	await page.goto('/');
  await expect(page).toHaveURL('/stake/');

  await page.goto('/any');
  await expect(page).toHaveURL('/stake/');

  await page.goto('/sns/');
  await expect(page).toHaveURL('/sns/');

  await page.goto('/wallet/');
  await expect(page).toHaveURL('/stake/');

  page.goto('http://127.0.0.1:8080/?canisterId=qhbym-qaaaa-aaaaa-aaafq-cai#authorize');
  await iiPage.signInWithNewIdentity();

  await page.goto('/stake/');

  await page.click('[title="connect-btn"]');

  await page.goto('/wallet/');
  await expect(page).toHaveURL('/wallet/');
});