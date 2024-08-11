import { test, expect } from '@playwright/test';
import {testWithII} from '@dfinity/internet-identity-playwright';
import { user } from '$lib/stores';
import { get } from 'svelte/store';
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

testWithII.only('should sign-in with a new user', async ({page, iiPage}) => {
  await page.goto('/');

  let connectBtn = page.locator('[title="connect-btn"]');
  await connectBtn.click();

  await iiPage.signInWithIdentity({selector: '[title="ii-connect-btn"]', identity: 1000});

  const walletInfo = page.locator('#wallet-info');
  await expect(walletInfo).toBeVisible();

  await walletInfo.click();
  await page.waitForTimeout(1000);

  const accountId = await page.locator('[title="accountIdentifier-hex"]').evaluate(accountId => {
    return accountId.textContent;
  });
  console.log(accountId);

  const paragraphs = walletInfo.locator('p');
  const count = await paragraphs.count();
  expect(count).toBe(3);

  const firstParagraph = paragraphs.nth(0);
  await expect(firstParagraph).toHaveText('0 ICP');

  const secondParagraph = paragraphs.nth(1);
  await expect(secondParagraph).toHaveText('0 nICP');

  const thirdParagraph = paragraphs.nth(2);
  await expect(thirdParagraph).toHaveText('0 WTN');


  await mockSignIn();
  const mockUser = get(user);
  expect(mockUser).toBeDefined();
}); 