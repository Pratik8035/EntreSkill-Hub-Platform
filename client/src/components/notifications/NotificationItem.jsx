import React from 'react';
import { Bell, CheckCircle, Clock, TrendingDown, AlertCircle, Target, Star } from 'lucide-react';

/**
 * NotificationItem — Sprint 9
 *
 * Props:
 *   notification {object}  — notification document
 *   onMarkRead   {fn}      — called with notification._id when mark-read clicked
 */

const TYPE_CONFIG = {
  overdue_task:     { icon: Clock,         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  overdue_milestone:{ icon: AlertCircle,   color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  stalled_goal:     { icon: Target,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  kpi_decline:      { icon: TrendingDown,  color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  missed_deadline:  { icon: AlertCircle,   color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
  low_progress:     { icon: Clock,         color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  goal_completed:   { icon: Star,          color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  weekly_reminder:  { icon: Bell,          color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)     return 'just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

const NotificationItem = ({ notification, onMarkRead }) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.weekly_reminder;
  const Icon   = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
        notification.read
          ? 'bg-white dark:bg-slate-900/20 opacity-70'
          : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'
      }`}
      role="listitem"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.color}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
          {notification.title}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {formatDate(notification.createdAt)}
        </p>
      </div>

      {/* Mark-read button */}
      {!notification.read && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification._id)}
          className="flex-shrink-0 text-slate-300 hover:text-green-500 dark:text-slate-600 dark:hover:text-green-400 transition-colors"
          aria-label="Mark as read"
          title="Mark as read"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
