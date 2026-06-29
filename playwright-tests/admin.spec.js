// admin.spec.js - Playwright test for Admin role
const { test, expect } = require('@playwright/test');

async function registerUser(page, role, email, password) {
  await page.goto('/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.selectOption('select[name="role"]', role);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*login/);
}

async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.dashboard');
}

test('Admin full workflow', async ({ page }) => {
  const email = 'admin_test@example.com';
  const password = 'Test123!';
  await registerUser(page, 'admin', email, password);
  await loginUser(page, email, password);
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  await page.screenshot({ path: 'admin_dashboard.png' });
  // Users page
  await page.click('a[href="/admin/users"]');
  await page.waitForSelector('text=Users');
  await page.screenshot({ path: 'admin_users.png' });
  // Mentors page
  await page.click('a[href="/admin/mentors"]');
  await page.waitForSelector('text=Mentors');
  await page.screenshot({ path: 'admin_mentors.png' });
  // Analytics page
  await page.click('a[href="/admin/analytics"]');
  await page.waitForSelector('text=Analytics');
  await page.screenshot({ path: 'admin_analytics.png' });
  // Funding page
  await page.click('a[href="/admin/funding"]');
  await page.waitForSelector('text=Funding');
  await page.screenshot({ path: 'admin_funding.png' });
  // Government Schemes page
  await page.click('a[href="/admin/schemes"]');
  await page.waitForSelector('text=Schemes');
  await page.screenshot({ path: 'admin_schemes.png' });
  // Reports page
  await page.click('a[href="/admin/reports"]');
  await page.waitForSelector('text=Reports');
  await page.screenshot({ path: 'admin_reports.png' });
  // Logout
  await page.goto('/logout');
});
