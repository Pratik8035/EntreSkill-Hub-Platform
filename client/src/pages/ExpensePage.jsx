import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingDown, AlertCircle, RefreshCw, X } from 'lucide-react';
import useExpense from '../hooks/useExpense';
import ExpenseCard from '../components/finance/ExpenseCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['Operations', 'Marketing', 'Salaries', 'Rent', 'Utilities', 'Equipment', 'Raw Materials', 'Taxes', 'Insurance', 'Travel', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
const defaultForm = { title: '', amount: '', category: 'Operations', date: '', description: '', paymentMethod: 'Cash', vendor: '', recurring: false, recurringFrequency: '' };

const ExpensePage = () => {
  const { data, loading, error, fetch, add, update, remove } = useExpense();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item, date: item.date?.split('T')[0] || '', amount: item.amount?.toString() }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return toast.error('Title and amount are required');
    try {
      setSubmitting(true);
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) { await update(editing._id, payload); toast.success('Expense updated'); }
      else { await add(payload); toast.success('Expense added'); }
      closeForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense record?')) return;
    try { await remove(id); toast.success('Expense deleted'); }
    catch { toast.error('Failed to delete expense'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">Expenses</h1>
              <p className="text-xs text-slate-400">{data.total ?? 0} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetch()} disabled={loading} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Add Expense
            </button>
          </div>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-rose-500" /><p className="text-sm text-rose-700 dark:text-rose-400">{error}</p></div>}

        {showForm && (
          <div className="bg-white dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-white">{editing ? 'Edit Expense' : 'Add Expense'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="e.g. Office Rent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (₹) *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Vendor</label>
                <input value={form.vendor} onChange={e => setForm(p => ({...p, vendor: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Vendor name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => setForm(p => ({...p, paymentMethod: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400" placeholder="Optional notes..." />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : data.expenses?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <TrendingDown className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No expense records yet</p>
            <p className="text-xs text-slate-400">Add your first expense to start tracking costs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.expenses?.map(item => <ExpenseCard key={item._id} expense={item} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
