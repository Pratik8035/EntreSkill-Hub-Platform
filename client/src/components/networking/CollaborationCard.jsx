import React, { useState } from 'react';
import { Briefcase, CheckCircle2, XCircle, Clock, ArrowRight, User } from 'lucide-react';

const CollaborationCard = ({ collab, mode, onAccept, onReject }) => {
  // mode: 'received' | 'sent'
  const [loading, setLoading] = useState(false);

  const handleAction = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Accepted',
          className: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
          icon: <CheckCircle2 className="w-3 h-3" />
        };
      case 'rejected':
        return {
          label: 'Rejected',
          className: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
          icon: <XCircle className="w-3 h-3" />
        };
      default:
        return {
          label: 'Pending',
          className: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const statusConfig = getStatusConfig(collab.status);
  const person = mode === 'received' ? collab.senderId : collab.receiverId;
  const personInitials = person?.name
    ? person.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col group">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-1.5 text-primary-600 dark:text-primary-400">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Collaboration Proposal</span>
        </div>
        <span className={`flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.className}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Project Title */}
      <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors mb-1.5">
        {collab.projectTitle}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
        {collab.description}
      </p>

      {/* Sender / Receiver info */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-3 mb-4 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-secondary-500 to-primary-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {personInitials}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block">
            {mode === 'received' ? 'Proposed by' : 'Sent to'}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
            {person?.name || 'Unknown User'}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto flex-shrink-0" />
      </div>

      {/* Actions (only for received + pending) */}
      {mode === 'received' && collab.status === 'pending' && (
        <div className="flex space-x-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleAction(() => onAccept(collab._id))}
            disabled={loading}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept</span>
          </button>
          <button
            onClick={() => handleAction(() => onReject(collab._id))}
            disabled={loading}
            className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Decline</span>
          </button>
        </div>
      )}

      {/* Sent mode — show status only */}
      {mode === 'sent' && (
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            {collab.status === 'pending'
              ? 'Awaiting response from the other party.'
              : collab.status === 'accepted'
                ? 'They accepted — start building!'
                : 'They declined this proposal.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CollaborationCard;
