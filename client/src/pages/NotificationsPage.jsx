import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, ArrowLeft, RefreshCw, CheckCheck, AlertCircle, Inbox,
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import toast from 'react-hot-toast';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const ItemSkeleton = () => (
  <div className="flex items-start gap-3 p-3 rounded-xl animate-pulse">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-1/4" />
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    generate,
    markRead,
    markAllRead,
  } = useNotifications();

  const handleGenerate = async () => {
    try {
      const created = await generate();
      if (created.length > 0) {
        toast.success(`${created.length} new notification(s) created`);
      } else {
        toast('No new notifications at this time');
      }
    } catch {
      toast.error('Failed to generate notifications');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                Sprint 9
              </span>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="inline-block mt-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              aria-label="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || loading}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              aria-label="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark All Read</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
              aria-label="Generate new notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Check Now</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 space-y-2">

          {loading && notifications.length === 0 ? (
            <div className="space-y-2" aria-label="Loading notifications">
              {[1, 2, 3, 4].map((i) => <ItemSkeleton key={i} />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center space-y-3" role="status">
              <Inbox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Click <strong>Check Now</strong> to detect new execution events.
              </p>
            </div>
          ) : (
            <div role="list" className="space-y-2">
              {/* Unread */}
              {notifications.filter((n) => !n.read).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-1">
                    Unread
                  </p>
                  {notifications
                    .filter((n) => !n.read)
                    .map((n) => (
                      <NotificationItem
                        key={n._id}
                        notification={n}
                        onMarkRead={handleMarkRead}
                      />
                    ))}
                </div>
              )}

              {/* Read */}
              {notifications.filter((n) => n.read).length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-1">
                    Read
                  </p>
                  {notifications
                    .filter((n) => n.read)
                    .map((n) => (
                      <NotificationItem
                        key={n._id}
                        notification={n}
                        onMarkRead={null}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NotificationsPage;
