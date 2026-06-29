import React from 'react';
import { AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const pct = budget.utilizationPercent ?? 0;
  const barColor = budget.isExceeded
    ? 'bg-rose-500'
    : pct >= (budget.alertThreshold ?? 80)
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{budget.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{budget.category} · {budget.period}</p>
        </div>
        {budget.isExceeded ? (
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
        ) : budget.isAlertTriggered ? (
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            ₹{budget.spentAmount?.toLocaleString('en-IN') ?? 0} spent
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            ₹{budget.allocatedAmount?.toLocaleString('en-IN')} budget
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold ${budget.isExceeded ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>
            {pct}% used
          </span>
          <span className="text-[11px] text-slate-400">
            ₹{budget.remainingAmount?.toLocaleString('en-IN') ?? 0} left
          </span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800">
          {onEdit && (
            <button onClick={() => onEdit(budget)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(budget._id)} className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
