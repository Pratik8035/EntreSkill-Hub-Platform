// entrepreneur.spec.js - Playwright test for EntreSkill Hub
const { test, expect } = require('@playwright/test');

// Helper to register a user via UI
async function registerUser(page, role, email, password) {
  await page.goto('http://localhost:5173/register');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.selectOption('select[name="role"]', role);
  await page.click('button[type="submit"]');
  // Assume registration redirects to login
  await expect(page).toHaveURL(/.*login/);
}

async function loginUser(page, email, password) {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // wait for dashboard
  await page.waitForSelector('.dashboard');
}

// Simple flow for each role
async function testEntrepreneur(page) {
  const email = 'entrepreneur_test@example.com';
  const password = 'Test123!';
  await registerUser(page, 'entrepreneur', email, password);
  await loginUser(page, email, password);
  // Verify dashboard contains Entrepreneur label
  await expect(page.locator('text=Entrepreneur Dashboard')).toBeVisible();
  // Take screenshot
  await page.screenshot({ path: 'entrepreneur_dashboard.png' });
  // Additional page checks can be added here
}

async function testMentor(page) {
  const email = 'mentor_test@example.com';
  const password = 'Test123!';
  await registerUser(page, 'mentor', email, password);
  await loginUser(page, email, password);
  await expect(page.locator('text=Mentor Dashboard')).toBeVisible();
  await page.screenshot({ path: 'mentor_dashboard.png' });
}

async function testAdmin(page) {
  const email = 'admin_test@example.com';
  const password = 'Test123!';
  await registerUser(page, 'admin', email, password);
  await loginUser(page, email, password);
  await expect(page.locator('text=Admin Dashboard')).toBeVisible();
  await page.screenshot({ path: 'admin_dashboard.png' });
}

test('EntreSkill Hub full role workflow', async ({ page }) => {
  // Enable tracing
  await test.info().attach('trace', { path: 'trace.zip' });
  // Run each role sequentially
  await testEntrepreneur(page);
  await page.goto('http://localhost:5173/logout');
  await testMentor(page);
  await page.goto('http://localhost:5173/logout');
  await testAdmin(page);
});
