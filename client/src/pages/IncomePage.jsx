import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, AlertCircle, RefreshCw, X } from 'lucide-react';
import useIncome from '../hooks/useIncome';
import IncomeCard from '../components/finance/IncomeCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['Sales', 'Service', 'Investment', 'Freelance', 'Rental', 'Grant', 'Loan', 'Other'];

const defaultForm = { title: '', amount: '', category: 'Sales', source: '', date: '', description: '', recurring: false, recurringFrequency: '' };

const IncomePage = () => {
  const { data, loading, error, fetch, add, update, remove } = useIncome();
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
      if (editing) {
        await update(editing._id, payload);
        toast.success('Income updated');
      } else {
        await add(payload);
        toast.success('Income added');
      }
      closeForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save income');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this income record?')) return;
    try { await remove(id); toast.success('Income deleted'); }
    catch { toast.error('Failed to delete income'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">Income</h1>
              <p className="text-xs text-slate-400">{data.total ?? 0} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetch()} disabled={loading} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
              <Plus className="w-4 h-4" /> Add Income
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900/60 border border-primary-100 dark:border-primary-900/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-white">{editing ? 'Edit Income' : 'Add Income'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Product Sales" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (₹) *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Source</label>
                <input value={form.source} onChange={e => setForm(p => ({...p, source: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g. Client name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Optional notes..." />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input type="checkbox" checked={form.recurring} onChange={e => setForm(p => ({...p, recurring: e.target.checked}))} className="rounded" /> Recurring
                </label>
                {form.recurring && (
                  <select value={form.recurringFrequency} onChange={e => setForm(p => ({...p, recurringFrequency: e.target.value}))} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Frequency</option>
                    {['Weekly','Monthly','Quarterly','Yearly'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  {submitting ? 'Saving...' : (editing ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : data.income?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <TrendingUp className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No income records yet</p>
            <p className="text-xs text-slate-400">Add your first income entry to start tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.income?.map(item => (
              <IncomeCard key={item._id} income={item} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;
