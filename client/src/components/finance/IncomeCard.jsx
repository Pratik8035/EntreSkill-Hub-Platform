import React from 'react';
import { TrendingUp, Tag, Calendar, Pencil, Trash2, RefreshCw } from 'lucide-react';

const categoryColor = {
  Sales: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Service: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Investment: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Freelance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Grant: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const IncomeCard = ({ income, onEdit, onDelete }) => {
  const cat = income.category || 'Other';
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{income.title}</p>
          {income.source && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{income.source}</p>
          )}
        </div>
        <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          +₹{income.amount?.toLocaleString('en-IN')}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[cat] || categoryColor.Other}`}>
            {cat}
          </span>
          {income.recurring && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary-600 dark:text-primary-400">
              <RefreshCw className="w-3 h-3" />
              {income.recurringFrequency}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="w-3 h-3" />
          {new Date(income.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800">
          {onEdit && (
            <button onClick={() => onEdit(income)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(income._id)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomeCard;
