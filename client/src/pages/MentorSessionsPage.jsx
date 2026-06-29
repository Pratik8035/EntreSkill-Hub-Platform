import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, History } from 'lucide-react';
import { useMentorSessions } from '../hooks/useMentorSessions';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/mentors/SessionCard';
import toast from 'react-hot-toast';

const INITIAL_FORM = {
  mentorId: '', title: '', description: '', scheduledAt: '',
  durationMin: 60, meetingLink: '',
};

const MentorSessionsPage = () => {
  const { user }   = useAuth();
  const sessions   = useMentorSessions();
  const [tab, setTab]           = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(INITIAL_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.mentorId || !form.title || !form.scheduledAt) {
      toast.error('Mentor ID, title, and scheduled time are required');
      return;
    }
    setFormLoading(true);
    try {
      await sessions.bookSession(form);
      toast.success('Session booked!');
      setShowForm(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to book session');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await sessions.cancelSession(id);
      toast.success('Session cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel session');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await sessions.confirmSession(id);
      toast.success('Session confirmed');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to confirm session');
    }
  };

  const handleComplete = async (id) => {
    try {
      await sessions.completeSession(id);
      toast.success('Session marked complete');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to complete session');
    }
  };

  const displaySessions = tab === 'upcoming' ? sessions.upcoming : sessions.completed;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Mentor Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Book, manage, and review your mentoring sessions
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Book Session
        </button>
      </div>

      {/* Book Session Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Book session">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mb-5">Book a Session</h2>
            <form onSubmit={handleBook} className="space-y-4">
              {[
                { id: 'mentorId',    label: 'Mentor User ID', type: 'text',     required: true },
                { id: 'title',       label: 'Session Title',  type: 'text',     required: true },
                { id: 'scheduledAt', label: 'Date & Time',    type: 'datetime-local', required: true },
                { id: 'durationMin', label: 'Duration (min)', type: 'number',   required: false },
                { id: 'meetingLink', label: 'Meeting Link',   type: 'url',      required: false },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {f.label} {f.required && <span className="text-rose-400">*</span>}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    value={form[f.id]}
                    onChange={e => setForm(prev => ({ ...prev, [f.id]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    required={f.required}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="description" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {formLoading ? 'Booking...' : 'Book Session'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`flex items-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-xl transition-all ${
            tab === 'upcoming'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Upcoming ({sessions.upcoming.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`flex items-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-xl transition-all ${
            tab === 'completed'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Completed ({sessions.completed.length})
        </button>
      </div>

      {/* Sessions */}
      {sessions.error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-3">
          <p className="text-sm text-rose-600 dark:text-rose-400">{sessions.error}</p>
        </div>
      )}

      {sessions.loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />)}
        </div>
      ) : displaySessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {tab === 'upcoming' ? 'No upcoming sessions.' : 'No completed sessions yet.'}
          </p>
          {tab === 'upcoming' && (
            <p className="text-xs text-slate-400 mt-1">Book a session with a mentor to get started.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {displaySessions.map(session => (
            <SessionCard
              key={session._id}
              session={session}
              currentUserId={user?._id}
              onConfirm={handleConfirm}
              onCancel={tab === 'upcoming' ? handleCancel : null}
              onComplete={tab === 'upcoming' ? handleComplete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorSessionsPage;
