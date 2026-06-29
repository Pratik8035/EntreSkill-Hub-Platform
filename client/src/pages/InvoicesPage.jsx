import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Receipt, AlertCircle, RefreshCw, X } from 'lucide-react';
import useInvoices from '../hooks/useInvoices';
import InvoiceCard from '../components/finance/InvoiceCard';
import toast from 'react-hot-toast';

const defaultItem = { description: '', quantity: 1, unitPrice: '' };
const defaultForm = { clientName: '', clientEmail: '', clientAddress: '', dueDate: '', notes: '', currency: 'INR', taxRate: 0, discount: 0, items: [{ ...defaultItem }] };

const InvoicesPage = () => {
  const { data, summary, loading, error, fetch, add, update, remove, markPaid, markSent } = useInvoices();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (inv) => { setEditing(inv); setForm({ ...inv, dueDate: inv.dueDate?.split('T')[0] || '', taxRate: inv.taxRate || 0, discount: inv.discount || 0 }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const setItem = (idx, key, val) => setForm(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }));
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { ...defaultItem }] }));
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientName || !form.dueDate || form.items.length === 0) return toast.error('Client name, due date and items are required');
    try {
      setSubmitting(true);
      const payload = { ...form, taxRate: parseFloat(form.taxRate) || 0, discount: parseFloat(form.discount) || 0,
        items: form.items.map(it => ({ ...it, quantity: Number(it.quantity), unitPrice: parseFloat(it.unitPrice) || 0, total: Number(it.quantity) * (parseFloat(it.unitPrice) || 0) })) };
      if (editing) { await update(editing._id, payload); toast.success('Invoice updated'); }
      else { await add(payload); toast.success('Invoice created'); }
      closeForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save invoice');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete this invoice?')) return; try { await remove(id); toast.success('Invoice deleted'); } catch { toast.error('Failed to delete'); } };
  const handleMarkPaid = async (id) => { try { await markPaid(id); toast.success('Invoice marked as paid'); } catch { toast.error('Failed'); } };
  const handleMarkSent = async (id) => { try { await markSent(id); toast.success('Invoice marked as sent'); } catch { toast.error('Failed'); } };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard</Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center"><Receipt className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">Invoices</h1>
              <p className="text-xs text-slate-400">{data.total ?? 0} invoices</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetch()} disabled={loading} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"><RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} /></button>
            <button onClick={openAdd} className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"><Plus className="w-4 h-4" /> New Invoice</button>
          </div>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-rose-500" /><p className="text-sm text-rose-700 dark:text-rose-400">{error}</p></div>}

        {summary && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: summary.totalInvoices, prefix: '' },
              { label: 'Paid', value: summary.paid, prefix: '' },
              { label: 'Sent', value: summary.sent, prefix: '' },
              { label: 'Overdue', value: summary.overdue, prefix: '' },
              { label: 'Revenue', value: summary.totalRevenue },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{s.prefix !== '' ? '₹' : ''}{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}</p>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900/60 border border-sky-100 dark:border-sky-900/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-white">{editing ? 'Edit Invoice' : 'New Invoice'}</h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Client Name *', key: 'clientName', type: 'text', ph: 'Client or company name' },
                  { label: 'Client Email', key: 'clientEmail', type: 'email', ph: 'client@email.com' },
                  { label: 'Due Date *', key: 'dueDate', type: 'date', ph: '' },
                  { label: 'Tax Rate (%)', key: 'taxRate', type: 'number', ph: '0' },
                  { label: 'Discount (₹)', key: 'discount', type: 'number', ph: '0' },
                  { label: 'Currency', key: 'currency', type: 'text', ph: 'INR' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.ph} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Client Address</label>
                  <textarea rows={2} value={form.clientAddress} onChange={e => setForm(p => ({...p, clientAddress: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Line Items</p>
                  <button type="button" onClick={addItem} className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 cursor-pointer">+ Add Item</button>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input className="col-span-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Description" value={item.description} onChange={e => setItem(idx, 'description', e.target.value)} />
                    <input type="number" min="1" className="col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Qty" value={item.quantity} onChange={e => setItem(idx, 'quantity', e.target.value)} />
                    <input type="number" min="0" step="0.01" className="col-span-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="₹ Price" value={item.unitPrice} onChange={e => setItem(idx, 'unitPrice', e.target.value)} />
                    {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="col-span-1 text-rose-400 hover:text-rose-600 text-xs font-bold cursor-pointer">×</button>}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="Payment terms, notes..." />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">{submitting ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[1,2,3].map(i => <div key={i} className="h-36 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : data.invoices?.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No invoices yet</p>
            <p className="text-xs text-slate-400">Create your first invoice to start billing clients.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.invoices?.map(inv => <InvoiceCard key={inv._id} invoice={inv} onEdit={openEdit} onDelete={handleDelete} onMarkPaid={handleMarkPaid} onMarkSent={handleMarkSent} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
