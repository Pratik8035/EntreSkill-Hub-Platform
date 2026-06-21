import React, { useState } from 'react';
import {
  UserPlus, UserCheck, Clock, Briefcase, MapPin, Tag,
  Award, Compass, CheckCircle2, XCircle, User
} from 'lucide-react';

const ConnectionCard = ({ user, onConnect, onAccept, onReject, onCollaborate }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (fn) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const getRoleBadge = (role) => {
    if (role === 'mentor') {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
          <Award className="w-3 h-3" />
          <span>Mentor</span>
        </span>
      );
    }
    return (
      <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-900/50">
        <Compass className="w-3 h-3" />
        <span>Entrepreneur</span>
      </span>
    );
  };

  const getStatusBadge = () => {
    if (user.connectionStatus === 'connected') {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-3 h-3" />
          <span>Connected</span>
        </span>
      );
    }
    if (user.connectionStatus === 'pending_sent') {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          <Clock className="w-3 h-3" />
          <span>Request Sent</span>
        </span>
      );
    }
    if (user.connectionStatus === 'pending_received') {
      return (
        <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50">
          <Clock className="w-3 h-3" />
          <span>Awaiting Your Response</span>
        </span>
      );
    }
    return null;
  };

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col group">

      {/* Avatar + Name Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-400 text-white flex items-center justify-center font-bold text-base font-outfit flex-shrink-0 shadow-md shadow-primary-500/15">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-outfit text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
              {user.name}
            </h3>
            <div className="flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] text-slate-450 dark:text-slate-400 truncate">
                {user.profile?.location || 'India'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">{getRoleBadge(user.role)}</div>
      </div>

      {/* Status badge */}
      {getStatusBadge() && (
        <div className="mb-3">{getStatusBadge()}</div>
      )}

      {/* Bio */}
      {user.profile?.bio && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {user.profile.bio}
        </p>
      )}

      {/* Skills */}
      {user.profile?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {user.profile.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="flex items-center space-x-1 text-[10px] font-semibold bg-slate-50 dark:bg-slate-850 text-slate-650 dark:text-slate-350 border border-slate-150 dark:border-slate-750 px-2 py-0.5 rounded-full"
            >
              <Tag className="w-2.5 h-2.5" />
              <span className="capitalize">{skill}</span>
            </span>
          ))}
          {user.profile.skills.length > 3 && (
            <span className="text-[10px] font-semibold text-slate-400 px-1 py-0.5">
              +{user.profile.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto space-y-2">

        {/* Incoming request: show Accept / Reject */}
        {user.connectionStatus === 'pending_received' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction(() => onAccept(user.connectionId))}
              disabled={loading}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => handleAction(() => onReject(user.connectionId))}
              disabled={loading}
              className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        )}

        {/* No connection yet: show Connect button */}
        {user.connectionStatus === 'none' && (
          <button
            onClick={() => handleAction(() => onConnect(user._id))}
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{loading ? 'Sending...' : 'Connect'}</span>
          </button>
        )}

        {/* Connected: show Collaborate button */}
        {user.connectionStatus === 'connected' && (
          <button
            onClick={() => onCollaborate(user)}
            className="w-full py-2 border border-primary-200 dark:border-primary-800 text-primary-650 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Propose Collaboration</span>
          </button>
        )}

        {/* Pending sent: disabled button */}
        {user.connectionStatus === 'pending_sent' && (
          <button
            disabled
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Request Pending</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionCard;
