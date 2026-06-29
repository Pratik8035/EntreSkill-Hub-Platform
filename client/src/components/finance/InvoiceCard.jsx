import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Pencil, Trash2, Send, CreditCard } from 'lucide-react';

const statusConfig = {
  Draft:     { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: Clock },
  Sent:      { color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Send },
  Paid:      { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  Overdue:   { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: AlertTriangle },
  Cancelled: { color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500', icon: Clock },
};

const InvoiceCard = ({ invoice, onEdit, onDelete, onMarkPaid, onMarkSent }) => {
  const cfg = statusConfig[invoice.status] || statusConfig.Draft;
  const StatusIcon = cfg.icon;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{invoice.invoiceNumber}</p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{invoice.clientName}</p>
          {invoice.clientEmail && (
            <p className="text-[11px] text-slate-400 truncate">{invoice.clientEmail}</p>
          )}
        </div>
        <p className="text-base font-extrabold text-primary-600 dark:text-primary-400 whitespace-nowrap">
          ₹{invoice.totalAmount?.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
          <StatusIcon className="w-3 h-3" /> {invoice.status}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="w-3 h-3" />
          Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800 flex-wrap">
        {invoice.status === 'Draft' && onMarkSent && (
          <button onClick={() => onMarkSent(invoice._id)} className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer">
            <Send className="w-3 h-3" /> Mark Sent
          </button>
        )}
        {(invoice.status === 'Sent' || invoice.status === 'Overdue') && onMarkPaid && (
          <button onClick={() => onMarkPaid(invoice._id)} className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
            <CreditCard className="w-3 h-3" /> Mark Paid
          </button>
        )}
        {onEdit && (
          <button onClick={() => onEdit(invoice)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary-600 transition-colors cursor-pointer">
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(invoice._id)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default InvoiceCard;
