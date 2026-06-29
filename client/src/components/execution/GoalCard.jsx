// src/components/execution/GoalCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Calendar, Trash2, ChevronRight, Flag } from 'lucide-react';

const PRIORITY_CONFIG = {
  High:   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
  Low:    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const STATUS_CONFIG = {
  'Not Started': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  'In Progress':  'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'Completed':    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
};

const GoalCard = ({ goal, onDelete }) => {
  if (!goal) return null;

  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== 'Completed';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
            <Target className="w-4.5 h-4.5" aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
            {goal.title}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal._id)}
            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 text-slate-400 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            aria-label={`Delete goal: ${goal.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Description */}
      {goal.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {goal.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_CONFIG[goal.priority] || PRIORITY_CONFIG.Medium}`}>
          <Flag className="w-2.5 h-2.5" aria-hidden="true" />
          <span>{goal.priority}</span>
        </span>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[goal.status] || STATUS_CONFIG['Not Started']}`}>
          {goal.status}
        </span>
        {isOverdue && (
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
            Overdue
          </span>
        )}
      </div>

      {/* Target date */}
      {goal.targetDate && (
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Due {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      )}

      {/* View details link */}
      <Link
        to={`/business-execution/goals/${goal._id}`}
        className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
        aria-label={`View details for ${goal.title}`}
      >
        <span>View Details</span>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
};

export default GoalCard;
