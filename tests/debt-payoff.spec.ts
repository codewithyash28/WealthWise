import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    const user = {
      uid: 'test-user-id',
      displayName: 'Test User',
      email: 'test@example.com',
      photoURL: null
    };
    const profile = {
      uid: 'test-user-id',
      name: 'Test User',
      age: '30',
      learningGoal: 'Testing',
      currency: 'USD',
      joinDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      visitDates: [new Date().toISOString().split('T')[0]],
      highScore: 0,
      netWorth: { assets: 100000, liabilities: 50000 },
      gitProvider: 'github',
      achievements: [],
      goals: []
    };
    window.localStorage.setItem('ww_user', JSON.stringify(user));
    window.localStorage.setItem('ww_profile', JSON.stringify(profile));
  });
});

test('user can add a loan and it persists across reloads', async ({ page }) => {
  // Go directly to the debt payoff page
  await page.goto('http://localhost:3000/#debt-payoff');

  // Wait for splash screen to disappear
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  // Ensure we are on the Debt Payoff page
  await expect(page.locator('h1:has-text("Debt Snowball vs. Avalanche Router")')).toBeVisible({ timeout: 20000 });

  // Fill in loan details
  await page.fill('input[placeholder="Loan description (e.g., student debt)"]', 'Test Credit Card');
  await page.fill('input[placeholder="Balance"]', '5000');
  await page.fill('input[placeholder="APR %"]', '18');
  await page.fill('input[placeholder="Min Pay"]', '150');

  // Submit the form
  await page.click('button:has-text("Append Debt Source")');

  // Verify it appears in the ledger
  await expect(page.locator('text=Test Credit Card')).toBeVisible();
  // The formatCurrency might add commas, so we check for "$5,000"
  await expect(page.locator('text=$5,000')).toBeVisible();

  // Change payoff method to Snowball
  await page.click('button:has-text("Snowball Method")');

  // Add extra payment using the range input
  // We'll use the fill method on the range input
  await page.fill('input[type="range"]', '400');

  // Verify the display updates
  await expect(page.locator('span:has-text("$400")')).toBeVisible();

  // Reload the page to test persistence
  await page.reload();

  // Wait for splash again
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  // Verify data persisted
  await expect(page.locator('text=Test Credit Card')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=$5,000')).toBeVisible();

  // Check if Snowball method is active (it should have the active class)
  const snowballBtn = page.locator('button:has-text("Snowball Method")');
  await expect(snowballBtn).toHaveClass(/bg-accent-gold\/10/);

  // Check if extra payment persisted
  await expect(page.locator('span:has-text("$400")')).toBeVisible();

  console.log('Debt payoff persistence verified successfully!');
});
