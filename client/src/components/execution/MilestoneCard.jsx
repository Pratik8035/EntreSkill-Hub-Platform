// src/components/execution/MilestoneCard.jsx
import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const MilestoneCard = ({ milestone, tasks = [], onComplete, onCreateTask, onCompleteTask, loadingTasks = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue]     = useState('');

  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date() && !milestone.completed;

  const handleToggle = async () => {
    if (!expanded) {
      // Notify parent to load tasks on first expand
    }
    setExpanded((p) => !p);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDue) return;
    await onCreateTask?.(milestone._id, { title: taskTitle.trim(), dueDate: taskDue });
    setTaskTitle('');
    setTaskDue('');
    setShowTaskForm(false);
  };

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
      milestone.completed
        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30'
        : isOverdue
        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30'
        : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
    }`}>
      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-2">
        <div className="flex items-start space-x-3 min-w-0 flex-1">
          <button
            onClick={() => !milestone.completed && onComplete?.(milestone._id)}
            className={`mt-0.5 flex-shrink-0 transition-colors ${milestone.completed ? 'text-emerald-500 cursor-default' : 'text-slate-300 hover:text-emerald-500 cursor-pointer'}`}
            aria-label={milestone.completed ? 'Milestone completed' : 'Mark milestone complete'}
            disabled={milestone.completed}
          >
            {milestone.completed
              ? <CheckCircle2 className="w-5 h-5" />
              : <Circle className="w-5 h-5" />}
          </button>
          <div className="min-w-0">
            <p className={`text-sm font-bold leading-snug ${milestone.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {milestone.title}
            </p>
            {milestone.description && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{milestone.description}</p>
            )}
            {milestone.targetDate && (
              <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>Due {new Date(milestone.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                {isOverdue && <span className="text-rose-500 font-bold ml-1">Overdue</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {tasks.length > 0 && (
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {completedCount}/{tasks.length}
            </span>
          )}
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="px-4 pb-2">
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${milestone.completed ? 'bg-emerald-500' : 'bg-primary-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded tasks */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {loadingTasks ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={onCompleteTask ? (id) => onCompleteTask(id, milestone._id) : undefined}
              />
            ))
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">No tasks yet.</p>
          )}

          {/* Add task */}
          {!showTaskForm ? (
            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          ) : (
            <form onSubmit={handleCreateTask} className="space-y-2 mt-2">
              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100"
                required
              />
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100"
                required
              />
              <div className="flex space-x-2">
                <button type="submit" className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  Add
                </button>
                <button type="button" onClick={() => setShowTaskForm(false)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;
