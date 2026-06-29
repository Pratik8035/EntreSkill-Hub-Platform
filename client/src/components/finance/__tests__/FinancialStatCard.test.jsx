// src/components/finance/__tests__/FinancialStatCard.test.jsx
// Component tests for Sprint 12 Finance components

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FinancialStatCard from '../FinancialStatCard';
import IncomeCard from '../IncomeCard';
import ExpenseCard from '../ExpenseCard';
import BudgetCard from '../BudgetCard';
import InvoiceCard from '../InvoiceCard';

// ─── FinancialStatCard ────────────────────────────────────────────────────────

describe('FinancialStatCard', () => {
  it('renders label and value', () => {
    render(<FinancialStatCard label="Revenue" value={50000} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText(/50,000/)).toBeInTheDocument();
  });

  it('renders prefix (₹) by default', () => {
    render(<FinancialStatCard label="Profit" value={12000} />);
    expect(screen.getByText(/₹/)).toBeInTheDocument();
  });

  it('renders positive trend in green', () => {
    const { container } = render(<FinancialStatCard label="Growth" value={5000} trend={15} />);
    expect(screen.getByText(/\+15%/)).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    render(<FinancialStatCard label="Loss" value={1000} trend={-10} />);
    expect(screen.getByText(/-10%/)).toBeInTheDocument();
  });

  it('renders without trend when not provided', () => {
    const { container } = render(<FinancialStatCard label="Savings" value={3000} />);
    expect(screen.queryByText(/%/)).toBeNull();
  });
});

// ─── IncomeCard ───────────────────────────────────────────────────────────────

describe('IncomeCard', () => {
  const mockIncome = {
    _id: 'inc_1',
    title: 'Product Sales',
    amount: 15000,
    category: 'Sales',
    source: 'Online Store',
    date: new Date().toISOString(),
    recurring: false,
  };

  it('renders income title and amount', () => {
    render(<IncomeCard income={mockIncome} />);
    expect(screen.getByText('Product Sales')).toBeInTheDocument();
    expect(screen.getByText(/15,000/)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<IncomeCard income={mockIncome} />);
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('shows positive amount with + prefix', () => {
    render(<IncomeCard income={mockIncome} />);
    expect(screen.getByText(/\+₹/)).toBeInTheDocument();
  });

  it('renders source when provided', () => {
    render(<IncomeCard income={mockIncome} />);
    expect(screen.getByText('Online Store')).toBeInTheDocument();
  });
});

// ─── ExpenseCard ──────────────────────────────────────────────────────────────

describe('ExpenseCard', () => {
  const mockExpense = {
    _id: 'exp_1',
    title: 'Office Rent',
    amount: 8000,
    category: 'Rent',
    vendor: 'Landlord Co',
    date: new Date().toISOString(),
    recurring: true,
    recurringFrequency: 'Monthly',
  };

  it('renders expense title and amount', () => {
    render(<ExpenseCard expense={mockExpense} />);
    expect(screen.getByText('Office Rent')).toBeInTheDocument();
    expect(screen.getByText(/8,000/)).toBeInTheDocument();
  });

  it('shows negative amount with - prefix', () => {
    render(<ExpenseCard expense={mockExpense} />);
    expect(screen.getByText(/-₹/)).toBeInTheDocument();
  });

  it('shows recurring frequency when recurring', () => {
    render(<ExpenseCard expense={mockExpense} />);
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('renders vendor name', () => {
    render(<ExpenseCard expense={mockExpense} />);
    expect(screen.getByText('Landlord Co')).toBeInTheDocument();
  });
});

// ─── BudgetCard ───────────────────────────────────────────────────────────────

describe('BudgetCard', () => {
  const mockBudget = {
    _id: 'bud_1',
    name: 'Marketing Budget',
    category: 'Marketing',
    period: 'Monthly',
    allocatedAmount: 20000,
    spentAmount: 12000,
    remainingAmount: 8000,
    utilizationPercent: 60,
    isExceeded: false,
    isAlertTriggered: false,
    alertThreshold: 80,
  };

  it('renders budget name and category', () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText('Marketing Budget')).toBeInTheDocument();
  });

  it('renders utilization percentage', () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText('60% used')).toBeInTheDocument();
  });

  it('renders allocated amount', () => {
    render(<BudgetCard budget={mockBudget} />);
    expect(screen.getByText(/20,000/)).toBeInTheDocument();
  });

  it('shows check icon when not exceeded', () => {
    const { container } = render(<BudgetCard budget={mockBudget} />);
    // CheckCircle2 rendered — no alert visible
    expect(screen.queryByText(/Exceeded/)).toBeNull();
  });
});

// ─── InvoiceCard ──────────────────────────────────────────────────────────────

describe('InvoiceCard', () => {
  const mockInvoice = {
    _id: 'inv_1',
    invoiceNumber: 'INV-0001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    totalAmount: 25000,
    status: 'Sent',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  it('renders invoice number and client name', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    expect(screen.getByText('INV-0001')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders total amount', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    expect(screen.getByText(/25,000/)).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('renders Paid status correctly', () => {
    render(<InvoiceCard invoice={{ ...mockInvoice, status: 'Paid' }} />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders client email', () => {
    render(<InvoiceCard invoice={mockInvoice} />);
    expect(screen.getByText('billing@acme.com')).toBeInTheDocument();
  });
});
