// mentor.spec.js - Playwright test for Mentor role
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

test('Mentor full workflow', async ({ page }) => {
  const email = 'mentor_test@example.com';
  const password = 'Test123!';
  await registerUser(page, 'mentor', email, password);
  await loginUser(page, email, password);
  await expect(page.locator('text=Mentor Dashboard')).toBeVisible();
  await page.screenshot({ path: 'mentor_dashboard.png' });
  // Pending Requests page
  await page.click('a[href="/mentor/requests"]');
  await page.waitForSelector('text=Pending Requests');
  await page.screenshot({ path: 'mentor_pending_requests.png' });
  // Accept first request if exists
  const acceptBtn = page.locator('button:has-text("Accept")').first();
  if (await acceptBtn.count()) {
    await acceptBtn.click();
    await page.waitForResponse(resp => resp.url().includes('/api/mentor/accept') && resp.status() === 200);
    await page.screenshot({ path: 'mentor_accept_success.png' });
  }
  // Assigned Entrepreneurs page
  await page.click('a[href="/mentor/entrepreneurs"]');
  await page.waitForSelector('text=Assigned Entrepreneurs');
  await page.screenshot({ path: 'mentor_assigned_entrepreneurs.png' });
  // Sessions page
  await page.click('a[href="/mentor/sessions"]');
  await page.waitForSelector('text=Sessions');
  await page.screenshot({ path: 'mentor_sessions.png' });
  // Chat page
  await page.click('a[href="/mentor/chat"]');
  await page.waitForSelector('text=Chat');
  await page.fill('textarea[name="message"]', 'Hello from Mentor');
  await page.click('button:has-text("Send")');
  await page.screenshot({ path: 'mentor_chat.png' });
  // Reports page
  await page.click('a[href="/mentor/reports"]');
  await page.waitForSelector('text=Reports');
  await page.screenshot({ path: 'mentor_reports.png' });
  // Logout
  await page.goto('/logout');
});
