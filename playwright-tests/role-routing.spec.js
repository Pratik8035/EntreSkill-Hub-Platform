// role-routing.spec.js - Verify role based access control
const { test, expect } = require('@playwright/test');

async function loginAs(page, role, email, password) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.dashboard');
  // ensure role-specific dashboard text
  await expect(page.locator(`text=${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`)).toBeVisible();
}

// Helper to try accessing a protected page and verify redirect to own dashboard
async function verifyRedirect(page, targetPath, expectedDashboardText) {
  await page.goto(targetPath);
  await expect(page.locator(`text=${expectedDashboardText}`)).toBeVisible();
}

test.describe('Role Routing', () => {
  test('Entrepreneur cannot access Mentor or Admin pages', async ({ page }) => {
    const email = 'entrepreneur_test@example.com';
    const password = 'Test123!';
    await loginAs(page, 'entrepreneur', email, password);
    await verifyRedirect(page, '/mentor/dashboard', 'Entrepreneur Dashboard');
    await verifyRedirect(page, '/admin/dashboard', 'Entrepreneur Dashboard');
  });

  test('Mentor cannot access Entrepreneur or Admin pages', async ({ page }) => {
    const email = 'mentor_test@example.com';
    const password = 'Test123!';
    await loginAs(page, 'mentor', email, password);
    await verifyRedirect(page, '/entrepreneur/dashboard', 'Mentor Dashboard');
    await verifyRedirect(page, '/admin/dashboard', 'Mentor Dashboard');
  });

  test('Admin can access all dashboards', async ({ page }) => {
    const email = 'admin_test@example.com';
    const password = 'Test123!';
    await loginAs(page, 'admin', email, password);
    // Admin should see Admin Dashboard for all routes
    await verifyRedirect(page, '/entrepreneur/dashboard', 'Admin Dashboard');
    await verifyRedirect(page, '/mentor/dashboard', 'Admin Dashboard');
    await verifyRedirect(page, '/admin/dashboard', 'Admin Dashboard');
  });
});
