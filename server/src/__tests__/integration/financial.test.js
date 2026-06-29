'use strict';

/**
 * Integration Tests — Financial Management API (Sprint 12)
 * Tests: Income, Expenses, Budgets, Invoices, Transactions, Goals,
 *        Analytics, Reports, AI Advisor (mocked)
 */

require('../setup');
const request  = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV           = 'test';
process.env.JWT_SECRET         = 'test-jwt-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES= '7d';

const app = require('../../app');

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerAndLogin() {
  const email = `finance_${Date.now()}@test.com`;
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Finance Test User', email, password: 'password123',
  });
  expect(reg.status).toBe(201);
  const token = reg.body.data.token;
  const jwt   = require('jsonwebtoken');
  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
  return { token, userId };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Financial Management API (Sprint 12)', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await registerAndLogin());
  });

  // ── Dashboard ───────────────────────────────────────────────────────────────

  describe('GET /api/finance/dashboard', () => {
    it('returns 200 with analytics data', async () => {
      const res = await request(app)
        .get('/api/finance/dashboard')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('revenue');
      expect(res.body.data).toHaveProperty('expenses');
      expect(res.body.data).toHaveProperty('profit');
      expect(res.body.data).toHaveProperty('financialHealthScore');
    });

    it('returns 401 without auth token', async () => {
      const res = await request(app).get('/api/finance/dashboard');
      expect(res.status).toBe(401);
    });
  });

  // ── Income CRUD ─────────────────────────────────────────────────────────────

  describe('Income CRUD', () => {
    it('POST /api/finance/income creates an income record', async () => {
      const res = await request(app)
        .post('/api/finance/income')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Product Sales', amount: 5000, category: 'Sales', date: new Date().toISOString() });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Product Sales');
      expect(res.body.data.amount).toBe(5000);
    });

    it('POST /api/finance/income returns 400 without required fields', async () => {
      const res = await request(app)
        .post('/api/finance/income')
        .set('Authorization', `Bearer ${token}`)
        .send({ category: 'Sales' });
      expect(res.status).toBe(400);
    });

    it('GET /api/finance/income returns income list', async () => {
      await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Income', amount: 1000 });
      const res = await request(app).get('/api/finance/income').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('income');
      expect(Array.isArray(res.body.data.income)).toBe(true);
    });

    it('GET /api/finance/income/:id returns a single income', async () => {
      const create = await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Single Income', amount: 2500 });
      const id = create.body.data._id;
      const res = await request(app).get(`/api/finance/income/${id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(id);
    });

    it('PUT /api/finance/income/:id updates an income record', async () => {
      const create = await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Old Title', amount: 1000 });
      const id = create.body.data._id;
      const res = await request(app).put(`/api/finance/income/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title', amount: 1500 });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('DELETE /api/finance/income/:id deletes an income record', async () => {
      const create = await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Delete', amount: 100 });
      const id = create.body.data._id;
      const res = await request(app).delete(`/api/finance/income/${id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Expense CRUD ────────────────────────────────────────────────────────────

  describe('Expense CRUD', () => {
    it('POST /api/finance/expenses creates an expense', async () => {
      const res = await request(app)
        .post('/api/finance/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Office Rent', amount: 8000, category: 'Rent' });
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Office Rent');
      expect(res.body.data.amount).toBe(8000);
    });

    it('POST /api/finance/expenses returns 400 without required fields', async () => {
      const res = await request(app).post('/api/finance/expenses')
        .set('Authorization', `Bearer ${token}`).send({});
      expect(res.status).toBe(400);
    });

    it('GET /api/finance/expenses returns list', async () => {
      const res = await request(app).get('/api/finance/expenses').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('expenses');
    });

    it('PUT /api/finance/expenses/:id updates an expense', async () => {
      const create = await request(app).post('/api/finance/expenses').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Old Expense', amount: 500 });
      const id = create.body.data._id;
      const res = await request(app).put(`/api/finance/expenses/${id}`).set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Expense', amount: 600 });
      expect(res.status).toBe(200);
      expect(res.body.data.amount).toBe(600);
    });

    it('DELETE /api/finance/expenses/:id deletes an expense', async () => {
      const create = await request(app).post('/api/finance/expenses').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Del Expense', amount: 200 });
      const id = create.body.data._id;
      const del = await request(app).delete(`/api/finance/expenses/${id}`).set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(200);
    });
  });

  // ── Budget CRUD ─────────────────────────────────────────────────────────────

  describe('Budget CRUD', () => {
    const validBudget = {
      name: 'Marketing Q1', category: 'Marketing', allocatedAmount: 20000,
      period: 'Monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate:   new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
    };

    it('POST /api/finance/budgets creates a budget', async () => {
      const res = await request(app).post('/api/finance/budgets')
        .set('Authorization', `Bearer ${token}`).send(validBudget);
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Marketing Q1');
    });

    it('POST /api/finance/budgets returns 400 without required fields', async () => {
      const res = await request(app).post('/api/finance/budgets')
        .set('Authorization', `Bearer ${token}`).send({ name: 'Incomplete' });
      expect(res.status).toBe(400);
    });

    it('GET /api/finance/budgets returns list', async () => {
      const res = await request(app).get('/api/finance/budgets').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('budgets');
    });

    it('GET /api/finance/budgets/utilization returns summary', async () => {
      const res = await request(app).get('/api/finance/budgets/utilization').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalBudgets');
      expect(res.body.data).toHaveProperty('overallUtilization');
    });

    it('PUT /api/finance/budgets/:id updates a budget', async () => {
      const create = await request(app).post('/api/finance/budgets')
        .set('Authorization', `Bearer ${token}`).send(validBudget);
      const id = create.body.data._id;
      const res = await request(app).put(`/api/finance/budgets/${id}`)
        .set('Authorization', `Bearer ${token}`).send({ name: 'Updated Budget', allocatedAmount: 25000 });
      expect(res.status).toBe(200);
      expect(res.body.data.allocatedAmount).toBe(25000);
    });

    it('DELETE /api/finance/budgets/:id deletes a budget', async () => {
      const create = await request(app).post('/api/finance/budgets')
        .set('Authorization', `Bearer ${token}`).send(validBudget);
      const id = create.body.data._id;
      const del = await request(app).delete(`/api/finance/budgets/${id}`).set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(200);
    });
  });

  // ── Invoice CRUD ────────────────────────────────────────────────────────────

  describe('Invoice CRUD', () => {
    const validInvoice = {
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [{ description: 'Web Development', quantity: 1, unitPrice: 15000, total: 15000 }],
    };

    it('POST /api/finance/invoices creates an invoice with auto number', async () => {
      const res = await request(app).post('/api/finance/invoices')
        .set('Authorization', `Bearer ${token}`).send(validInvoice);
      expect(res.status).toBe(201);
      expect(res.body.data.clientName).toBe('Acme Corp');
      expect(res.body.data.invoiceNumber).toBeDefined();
      expect(res.body.data.totalAmount).toBeGreaterThan(0);
    });

    it('POST /api/finance/invoices returns 400 without required fields', async () => {
      const res = await request(app).post('/api/finance/invoices')
        .set('Authorization', `Bearer ${token}`).send({ clientName: 'No Items' });
      expect(res.status).toBe(400);
    });

    it('GET /api/finance/invoices returns invoice list', async () => {
      const res = await request(app).get('/api/finance/invoices').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('invoices');
    });

    it('GET /api/finance/invoices/summary returns summary stats', async () => {
      const res = await request(app).get('/api/finance/invoices/summary').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalInvoices');
      expect(res.body.data).toHaveProperty('totalRevenue');
    });

    it('PATCH /api/finance/invoices/:id/sent marks invoice as sent', async () => {
      const create = await request(app).post('/api/finance/invoices')
        .set('Authorization', `Bearer ${token}`).send(validInvoice);
      const id = create.body.data._id;
      const res = await request(app).patch(`/api/finance/invoices/${id}/sent`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Sent');
    });

    it('PATCH /api/finance/invoices/:id/paid marks invoice as paid', async () => {
      const create = await request(app).post('/api/finance/invoices')
        .set('Authorization', `Bearer ${token}`).send(validInvoice);
      const id = create.body.data._id;
      // First mark sent, then paid
      await request(app).patch(`/api/finance/invoices/${id}/sent`).set('Authorization', `Bearer ${token}`);
      const res = await request(app).patch(`/api/finance/invoices/${id}/paid`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Paid');
    });

    it('DELETE /api/finance/invoices/:id deletes an invoice', async () => {
      const create = await request(app).post('/api/finance/invoices')
        .set('Authorization', `Bearer ${token}`).send(validInvoice);
      const id = create.body.data._id;
      const del = await request(app).delete(`/api/finance/invoices/${id}`).set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(200);
    });
  });

  // ── Transactions ────────────────────────────────────────────────────────────

  describe('GET /api/finance/transactions', () => {
    it('returns transaction history (auto-created from income/expense)', async () => {
      await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Txn Income', amount: 3000 });
      await request(app).post('/api/finance/expenses').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Txn Expense', amount: 1500 });
      const res = await request(app).get('/api/finance/transactions').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('transactions');
      expect(res.body.data.transactions.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Financial Goals ─────────────────────────────────────────────────────────

  describe('Financial Goals CRUD', () => {
    const validGoal = {
      title: 'Save for Equipment', targetAmount: 50000,
      type: 'Savings', targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    it('POST /api/finance/goals creates a financial goal', async () => {
      const res = await request(app).post('/api/finance/goals')
        .set('Authorization', `Bearer ${token}`).send(validGoal);
      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Save for Equipment');
    });

    it('GET /api/finance/goals returns list', async () => {
      const res = await request(app).get('/api/finance/goals').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('PUT /api/finance/goals/:id updates a goal', async () => {
      const create = await request(app).post('/api/finance/goals')
        .set('Authorization', `Bearer ${token}`).send(validGoal);
      const id = create.body.data._id;
      const res = await request(app).put(`/api/finance/goals/${id}`)
        .set('Authorization', `Bearer ${token}`).send({ currentAmount: 10000 });
      expect(res.status).toBe(200);
      expect(res.body.data.currentAmount).toBe(10000);
    });

    it('DELETE /api/finance/goals/:id deletes a goal', async () => {
      const create = await request(app).post('/api/finance/goals')
        .set('Authorization', `Bearer ${token}`).send(validGoal);
      const id = create.body.data._id;
      const del = await request(app).delete(`/api/finance/goals/${id}`).set('Authorization', `Bearer ${token}`);
      expect(del.status).toBe(200);
    });
  });

  // ── Summary Endpoints ───────────────────────────────────────────────────────

  describe('Summary Endpoints', () => {
    it('GET /api/finance/summary/monthly returns monthly summary', async () => {
      const res = await request(app).get('/api/finance/summary/monthly').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpenses');
      expect(res.body.data).toHaveProperty('profit');
    });

    it('GET /api/finance/summary/yearly returns yearly summary', async () => {
      const res = await request(app).get('/api/finance/summary/yearly').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('monthlyBreakdown');
    });
  });

  // ── Financial Reports ───────────────────────────────────────────────────────

  describe('Financial Reports', () => {
    it('GET /api/finance/reports returns list of report types', async () => {
      const res = await request(app).get('/api/finance/reports').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('type');
      expect(res.body.data[0]).toHaveProperty('label');
    });

    it('GET /api/finance/reports/income_report generates income report', async () => {
      const res = await request(app).get('/api/finance/reports/income_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('income_report');
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('generatedAt');
    });

    it('GET /api/finance/reports/expense_report generates expense report', async () => {
      const res = await request(app).get('/api/finance/reports/expense_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('expense_report');
      expect(res.body.data).toHaveProperty('totalExpenses');
    });

    it('GET /api/finance/reports/profit_report generates profit report', async () => {
      const res = await request(app).get('/api/finance/reports/profit_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('profit_report');
      expect(res.body.data).toHaveProperty('profit');
    });

    it('GET /api/finance/reports/cash_flow_report generates cash flow report', async () => {
      const res = await request(app).get('/api/finance/reports/cash_flow_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('cash_flow_report');
      expect(res.body.data).toHaveProperty('netCashFlow');
    });

    it('GET /api/finance/reports/monthly_report generates monthly report', async () => {
      const res = await request(app).get('/api/finance/reports/monthly_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('monthly_report');
      expect(res.body.data).toHaveProperty('financialHealthScore');
    });

    it('GET /api/finance/reports/yearly_report generates yearly report', async () => {
      const res = await request(app).get('/api/finance/reports/yearly_report').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.type).toBe('yearly_report');
      expect(res.body.data).toHaveProperty('yearlyTrend');
    });

    it('GET /api/finance/reports/invalid_type returns 400', async () => {
      const res = await request(app).get('/api/finance/reports/invalid_type').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
    });
  });

  // ── AI Financial Advisor ────────────────────────────────────────────────────

  describe('GET /api/finance/advisor', () => {
    it('returns 200 with advice object (AI may fail gracefully)', async () => {
      const res = await request(app)
        .get('/api/finance/advisor')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('advice');
      expect(res.body.data).toHaveProperty('generatedAt');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/finance/advisor');
      expect(res.status).toBe(401);
    });
  });

  // ── Notifications ───────────────────────────────────────────────────────────

  describe('POST /api/finance/notifications/generate', () => {
    it('generates financial notifications', async () => {
      const res = await request(app)
        .post('/api/finance/notifications/generate')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── Authorization ───────────────────────────────────────────────────────────

  describe('Authorization', () => {
    it('all finance endpoints return 401 without token', async () => {
      const endpoints = [
        { method: 'get',  path: '/api/finance/income' },
        { method: 'get',  path: '/api/finance/expenses' },
        { method: 'get',  path: '/api/finance/budgets' },
        { method: 'get',  path: '/api/finance/invoices' },
        { method: 'get',  path: '/api/finance/goals' },
        { method: 'get',  path: '/api/finance/transactions' },
      ];
      for (const ep of endpoints) {
        const res = await request(app)[ep.method](ep.path);
        expect(res.status).toBe(401);
      }
    });

    it('user cannot access another user income', async () => {
      const { token: t1 } = await registerAndLogin();
      const { token: t2 } = await registerAndLogin();
      const create = await request(app).post('/api/finance/income').set('Authorization', `Bearer ${t1}`)
        .send({ title: 'User1 Income', amount: 1000 });
      const id = create.body.data._id;
      const res = await request(app).get(`/api/finance/income/${id}`).set('Authorization', `Bearer ${t2}`);
      expect(res.status).toBe(404);
    });
  });

  // ── Pagination & Filtering ──────────────────────────────────────────────────

  describe('Pagination and Filtering', () => {
    it('GET /api/finance/income supports pagination', async () => {
      const res = await request(app).get('/api/finance/income?page=1&limit=5').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('page', 1);
      expect(res.body.data).toHaveProperty('pages');
    });

    it('GET /api/finance/expenses supports category filter', async () => {
      await request(app).post('/api/finance/expenses').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Rent', amount: 5000, category: 'Rent' });
      const res = await request(app).get('/api/finance/expenses?category=Rent').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const all = res.body.data.expenses;
      expect(all.every(e => e.category === 'Rent')).toBe(true);
    });

    it('GET /api/finance/transactions supports type filter', async () => {
      await request(app).post('/api/finance/income').set('Authorization', `Bearer ${token}`)
        .send({ title: 'Filter Income', amount: 2000 });
      const res = await request(app).get('/api/finance/transactions?type=Income').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      const all = res.body.data.transactions;
      expect(all.every(t => t.type === 'Income')).toBe(true);
    });
  });

  // ── Admin Financial Stats ───────────────────────────────────────────────────

  describe('Admin Financial Stats', () => {
    it('GET /api/admin/financial-stats requires admin role', async () => {
      const res = await request(app).get('/api/admin/financial-stats').set('Authorization', `Bearer ${token}`);
      // Regular user should get 403
      expect(res.status).toBe(403);
    });
  });
});
