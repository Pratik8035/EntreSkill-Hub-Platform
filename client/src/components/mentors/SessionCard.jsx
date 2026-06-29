import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Video, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',  dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',     dot: 'bg-blue-400' },
  cancelled: { label: 'Cancelled', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',  dot: 'bg-slate-400' },
};

/**
 * SessionCard — Sprint 11
 * Displays a single mentor session with actions.
 *
 * Props:
 *   session     {object}   — MentorSession document (populated mentor/mentee)
 *   currentUserId {string} — for determining role (mentor or mentee)
 *   onConfirm   {fn}       — fn(id) — for mentors
 *   onCancel    {fn}       — fn(id)
 *   onComplete  {fn}       — fn(id)
 */
const SessionCard = ({ session, currentUserId, onConfirm, onCancel, onComplete }) => {
  const [loading, setLoading] = useState(false);

  const isMentor = session.mentorId?._id === currentUserId || session.mentorId === currentUserId;
  const other    = isMentor ? session.menteeId : session.mentorId;
  const config   = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending;

  const scheduledDate = new Date(session.scheduledAt);
  const isPast        = scheduledDate < new Date();

  const handleAction = async (fn, id) => {
    setLoading(true);
    try { await fn(id); } finally { setLoading(false); }
  };

  const otherInitials = other?.name
    ? other.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-400 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {otherInitials}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {isMentor ? 'Mentee' : 'Mentor'}: {other?.name || 'Unknown'}
            </p>
            <p className="text-[10px] text-slate-400">{other?.email || ''}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{session.title}</h3>

      {session.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
          {session.description}
        </p>
      )}

      {/* Schedule */}
      <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {scheduledDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({session.durationMin || 60} min)
        </span>
      </div>

      {/* Meeting link */}
      {session.meetingLink && session.status !== 'cancelled' && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 hover:underline mb-3"
        >
          <Video className="w-3.5 h-3.5" />
          Join meeting
        </a>
      )}

      {/* Notes */}
      {session.notes && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 mb-3">
          <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
            <FileText className="w-3 h-3" /> Notes
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{session.notes}</p>
        </div>
      )}

      {/* Actions */}
      {session.status !== 'completed' && session.status !== 'cancelled' && (
        <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          {isMentor && session.status === 'pending' && onConfirm && (
            <button
              onClick={() => handleAction(onConfirm, session._id)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm
            </button>
          )}
          {session.status === 'confirmed' && isPast && onComplete && (
            <button
              onClick={() => handleAction(onComplete, session._id)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => handleAction(onCancel, session._id)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionCard;
