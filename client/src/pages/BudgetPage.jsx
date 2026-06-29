import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Wallet, AlertCircle, RefreshCw, X } from 'lucide-react';
import useBudget from '../hooks/useBudget';
import BudgetCard from '../components/finance/BudgetCard';
import FinancialStatCard from '../components/finance/FinancialStatCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities', 'Equipment', 'Raw Materials', 'Taxes', 'Insurance', 'Travel', 'General', 'Other'];
const PERIODS = ['Monthly', 'Quarterly', 'Yearly'];
const defaultForm = { name: '', category: 'General', allocatedAmount: '', period: 'Monthly', startDate: '', endDate: '', description: '', alertThreshold: 80, isActive: true };

const BudgetPage = () => {
  const { data, utilization, loading, error, fetch, add, update, remove } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...b, allocatedAmount: b.allocatedAmount?.toString(), startDate: b.startDate?.split('T')[0] || '', endDate: b.endDate?.split('T')[0] || '' }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.allocatedAmount || !form.startDate || !form.endDate) return toast.error('Name, amount and dates are required');
    try {
      setSubmitting(true);
      const payload = { ...form, allocatedAmount: parseFloat(form.allocatedAmount), alertThreshold: Number(form.alertThreshold) };
      if (editing) { await update(editing._id, payload); toast.success('Budget updated'); }
      else { await add(payload); toast.success('Budget created'); }
      closeForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    try { await remove(id); toast.success('Budget deleted'); }
    catch { toast.error('Failed to delete budget'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">Budgets</h1>
              <p className="text-xs text-slate-400">{data.total ?? 0} budgets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetch()} disabled={loading} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Add Budget
            </button>
          </div>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-rose-500" /><p className="text-sm text-rose-700 dark:text-rose-400">{error}</p></div>}

        {utilization && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Budgets', value: utilization.totalBudgets, prefix: '' },
              { label: 'Total Allocated', value: utilization.totalAllocated },
              { label: 'Total Spent', value: utilization.totalSpent },
              { label: 'Utilization', value: utilization.overallUtilization, prefix: '', suffix: '%' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {s.prefix !== '' ? '₹' : ''}{s.prefix === undefined ? '₹' : s.prefix}{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}{s.suffix || ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900/60 border border-amber-100 dark:border-amber-900/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-white">{editing ? 'Edit Budget' : 'Add Budget'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name *', key: 'name', type: 'text', ph: 'e.g. Marketing Budget', full: true },
                { label: 'Allocated Amount (₹) *', key: 'allocatedAmount', type: 'number', ph: '0.00' },
                { label: 'Alert Threshold (%)', key: 'alertThreshold', type: 'number', ph: '80' },
                { label: 'Start Date *', key: 'startDate', type: 'date' },
                { label: 'End Date *', key: 'endDate', type: 'date' },
              ].map(f => (
                <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Period</label>
                <select value={form.period} onChange={e => setForm(p => ({...p, period: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400">
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : data.budgets?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Wallet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No budgets yet</p>
            <p className="text-xs text-slate-400">Create a budget to track your spending limits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.budgets?.map(b => <BudgetCard key={b._id} budget={b} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPage;
