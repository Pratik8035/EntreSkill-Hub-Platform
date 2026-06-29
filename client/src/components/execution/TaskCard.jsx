// src/components/execution/TaskCard.jsx
import React from 'react';
import { CheckCircle2, Circle, Calendar, Clock } from 'lucide-react';

const STATUS_DOT = {
  'Completed':  'bg-emerald-500',
  'In Progress': 'bg-blue-500',
  'Pending':    'bg-slate-300 dark:bg-slate-600',
};

const TaskCard = ({ task, onComplete }) => {
  if (!task) return null;

  const isCompleted = task.status === 'Completed';
  const isOverdue   = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <div className={`flex items-start space-x-3 px-3 py-2.5 rounded-xl transition-colors ${
      isCompleted
        ? 'bg-emerald-50/50 dark:bg-emerald-950/10'
        : isOverdue
        ? 'bg-rose-50/50 dark:bg-rose-950/10'
        : 'bg-slate-50 dark:bg-slate-800/40'
    }`}>
      <button
        onClick={() => !isCompleted && onComplete?.(task._id)}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          isCompleted ? 'text-emerald-500 cursor-default' : 'text-slate-300 hover:text-emerald-500 cursor-pointer'
        }`}
        disabled={isCompleted}
        aria-label={isCompleted ? 'Task completed' : `Complete task: ${task.title}`}
      >
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={`text-xs font-semibold leading-snug ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
          {task.title}
        </p>
        <div className="flex items-center space-x-2">
          {task.dueDate && (
            <span className={`flex items-center space-x-1 text-[10px] ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </span>
          )}
          <span className="flex items-center space-x-1 text-[10px] text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status] || STATUS_DOT.Pending}`} />
            <span>{task.status}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
