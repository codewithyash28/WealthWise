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

test('user can log a transaction and it persists', async ({ page }) => {
  await page.goto('http://localhost:3000/#budget');
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  await expect(page.locator('h1:has-text("Budget Architect")')).toBeVisible({ timeout: 20000 });

  // Connect Bank simulation to log initial transactions
  await page.click('button:has-text("Synchronize Accounts")');

  // Wait for the simulated sync
  await page.waitForTimeout(2500);

  // Check if transactions are present in the ledger
  await expect(page.locator('text=Apple Store')).toBeVisible();

  // Verify transaction amount is visible (assuming $1,299.00 from my reading of BudgetPlanner.tsx)
  await expect(page.locator('text=$1,299')).toBeVisible();

  // Reload to verify persistence (BudgetPlanner should save transactions to budget plan if handleSave is called,
  // but wait, BudgetPlanner uses state for transactions and it's passed to onSave.
  // Actually, handleConnectBank in BudgetPlanner.tsx updates local state.
  // Let's manually trigger a "Save Plan" to ensure it's in localStorage via App.tsx's handleSaveBudget

  await page.click('button:has-text("Save Plan")');

  // Achievement toast might appear
  await expect(page.locator('text=Achievement Unlocked!')).toBeVisible();

  await page.reload();
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  // Verify transaction still exists after reload
  await expect(page.locator('text=Apple Store')).toBeVisible({ timeout: 10000 });

  console.log('Transaction logging and persistence verified!');
});

test('user can add a debt loan and it persists', async ({ page }) => {
  // Go directly to the debt payoff page
  await page.goto('http://localhost:3000/#debt-payoff');

  // Wait for splash screen to disappear
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  // Ensure we are on the Debt Payoff page
  await expect(page.locator('h1:has-text("Debt Snowball vs. Avalanche Router")')).toBeVisible({ timeout: 20000 });

  // Fill in loan details
  await page.fill('input[placeholder="Loan description (e.g., student debt)"]', 'E2E Test Loan');
  await page.fill('input[placeholder="Balance"]', '10000');
  await page.fill('input[placeholder="APR %"]', '15');
  await page.fill('input[placeholder="Min Pay"]', '300');

  // Submit the form
  await page.click('button:has-text("Append Debt Source")');

  // Verify it appears in the ledger
  await expect(page.locator('text=E2E Test Loan')).toBeVisible();
  await expect(page.locator('text=$10,000')).toBeVisible();

  // Reload the page to test persistence
  await page.reload();

  // Wait for splash again
  await page.waitForSelector('text=Initializing Elite Workspace', { state: 'hidden', timeout: 15000 });

  // Verify data persisted
  await expect(page.locator('text=E2E Test Loan')).toBeVisible({ timeout: 10000 });

  console.log('Debt payoff persistence verified successfully!');
});
