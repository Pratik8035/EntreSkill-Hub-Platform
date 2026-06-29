import { useState, useEffect, useCallback } from 'react';
import mentorSessionService from '../services/mentorSessionService';

/**
 * useMentorSessions — manages upcoming and completed session lists
 * for the current logged-in user.
 */
export function useMentorSessions() {
  const [upcoming, setUpcoming]     = useState([]);
  const [completed, setCompleted]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [upRes, compRes] = await Promise.all([
        mentorSessionService.getUpcomingSessions(),
        mentorSessionService.getCompletedSessions(),
      ]);
      setUpcoming(upRes.data || []);
      setCompleted(compRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const bookSession = async (data) => {
    const res = await mentorSessionService.bookSession(data);
    setUpcoming(prev => [...prev, res.data]);
    return res.data;
  };

  const cancelSession = async (id, reason = '') => {
    const res = await mentorSessionService.cancelSession(id, reason);
    setUpcoming(prev => prev.filter(s => s._id !== id));
    return res.data;
  };

  const confirmSession = async (id) => {
    const res = await mentorSessionService.confirmSession(id);
    setUpcoming(prev => prev.map(s => s._id === id ? res.data : s));
    return res.data;
  };

  const completeSession = async (id, notes = '') => {
    const res = await mentorSessionService.completeSession(id, notes);
    setUpcoming(prev => prev.filter(s => s._id !== id));
    setCompleted(prev => [res.data, ...prev]);
    return res.data;
  };

  return {
    upcoming, completed, loading, error, reload: load,
    bookSession, cancelSession, confirmSession, completeSession,
  };
}
