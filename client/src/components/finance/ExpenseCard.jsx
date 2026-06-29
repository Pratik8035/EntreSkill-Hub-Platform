import React from 'react';
import { Calendar, Pencil, Trash2, RefreshCw } from 'lucide-react';

const categoryColor = {
  Operations: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Marketing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Salaries: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Rent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Utilities: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Taxes: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const cat = expense.category || 'Other';
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{expense.title}</p>
          {expense.vendor && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{expense.vendor}</p>
          )}
        </div>
        <p className="text-base font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">
          -₹{expense.amount?.toLocaleString('en-IN')}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[cat] || categoryColor.Other}`}>
            {cat}
          </span>
          {expense.recurring && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-3 h-3" /> {expense.recurringFrequency}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar className="w-3 h-3" />
          {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800">
          {onEdit && (
            <button onClick={() => onEdit(expense)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(expense._id)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
