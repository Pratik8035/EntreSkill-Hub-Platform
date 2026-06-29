import { useState, useEffect, useCallback } from 'react';
import {
  listNotifications,
  generateNotifications,
  markNotificationRead,
} from '../services/notificationService';

/**
 * useNotifications — Sprint 9
 *
 * Manages in-app notifications: list, generate, and mark read.
 */
export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Generate ──────────────────────────────────────────────────────────────

  const generate = useCallback(async () => {
    try {
      setError(null);
      const newNotifs = await generateNotifications();
      if (newNotifs.length > 0) {
        // Prepend new notifications; re-fetch to get correct sort order
        await fetchNotifications();
      }
      return newNotifs;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate notifications');
      return [];
    }
  }, [fetchNotifications]);

  // ── Mark read ─────────────────────────────────────────────────────────────

  const markRead = useCallback(async (id) => {
    try {
      setError(null);
      const updated = await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      return updated;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark notification as read');
      throw err;
    }
  }, []);

  // ── Mark all read ─────────────────────────────────────────────────────────

  const markAllRead = useCallback(async () => {
    try {
      setError(null);
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => markNotificationRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to mark all as read');
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    generate,
    markRead,
    markAllRead,
  };
}
