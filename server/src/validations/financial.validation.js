// financial.validation.js — Sprint 12
'use strict';

const { z } = require('zod');

const dateString = z.string().refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid date format' });

// ── Income ─────────────────────────────────────────────────────────────────

const createIncomeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number({ required_error: 'Amount is required' }).min(0, 'Amount cannot be negative'),
  category: z.enum(['Sales', 'Service', 'Investment', 'Freelance', 'Rental', 'Grant', 'Loan', 'Other']).optional(),
  source: z.string().max(200).optional(),
  date: dateString.optional(),
  description: z.string().max(1000).optional(),
  recurring: z.boolean().optional(),
  recurringFrequency: z.enum(['Weekly', 'Monthly', 'Quarterly', 'Yearly']).nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
});

const updateIncomeSchema = createIncomeSchema.partial();

// ── Expense ────────────────────────────────────────────────────────────────

const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  amount: z.number({ required_error: 'Amount is required' }).min(0, 'Amount cannot be negative'),
  category: z.enum(['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities', 'Equipment', 'Raw Materials', 'Taxes', 'Insurance', 'Travel', 'Other']).optional(),
  date: dateString.optional(),
  description: z.string().max(1000).optional(),
  paymentMethod: z.enum(['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other']).optional(),
  vendor: z.string().max(200).optional(),
  recurring: z.boolean().optional(),
  recurringFrequency: z.enum(['Weekly', 'Monthly', 'Quarterly', 'Yearly']).nullable().optional(),
  tags: z.array(z.string().max(50)).optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();

// ── Budget ─────────────────────────────────────────────────────────────────

const createBudgetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.enum(['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities', 'Equipment', 'Raw Materials', 'Taxes', 'Insurance', 'Travel', 'General', 'Other']).optional(),
  allocatedAmount: z.number({ required_error: 'Allocated amount is required' }).min(0),
  period: z.enum(['Monthly', 'Quarterly', 'Yearly']).optional(),
  startDate: dateString,
  endDate: dateString,
  description: z.string().max(1000).optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});

const updateBudgetSchema = createBudgetSchema.partial();

// ── Invoice ────────────────────────────────────────────────────────────────

const invoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0).optional(),
});

const createInvoiceSchema = z.object({
  invoiceNumber: z.string().max(50).optional(),
  clientName: z.string().min(1, 'Client name is required').max(200),
  clientEmail: z.string().email().max(200).optional(),
  clientAddress: z.string().max(500).optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled']).optional(),
  issueDate: dateString.optional(),
  dueDate: dateString,
  notes: z.string().max(1000).optional(),
  currency: z.string().max(10).optional(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

// ── Financial Goal ─────────────────────────────────────────────────────────

const createFinancialGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  targetAmount: z.number({ required_error: 'Target amount is required' }).min(0),
  currentAmount: z.number().min(0).optional(),
  type: z.enum(['Savings', 'Revenue', 'Investment', 'Debt Reduction', 'Emergency Fund', 'Expansion', 'Other']).optional(),
  status: z.enum(['Active', 'Completed', 'Paused', 'Cancelled']).optional(),
  targetDate: dateString,
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

const updateFinancialGoalSchema = createFinancialGoalSchema.partial();

module.exports = {
  createIncomeSchema,
  updateIncomeSchema,
  createExpenseSchema,
  updateExpenseSchema,
  createBudgetSchema,
  updateBudgetSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createFinancialGoalSchema,
  updateFinancialGoalSchema,
};
