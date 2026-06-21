import React, { useState } from 'react';
import { Award, Star, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MentorCard = ({ mentor, matchScore, onRequest, compact = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const mentorName = mentor.userId?.name || 'Mentor';
  const expertise = mentor.expertise || [];
  const industries = mentor.industries || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please add a short message');
      return;
    }
    try {
      setSubmitting(true);
      await onRequest(mentor._id, message.trim());
      toast.success('Mentor request sent!');
      setShowForm(false);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-all ${compact ? 'p-4' : 'p-6'} space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
            {mentorName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 truncate">{mentorName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{mentor.availability || 'OnDemand'} availability</p>
          </div>
        </div>
        {typeof matchScore === 'number' && (
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 shrink-0">
            {matchScore}% Match
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < Math.round(mentor.rating || 0) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}
          />
        ))}
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{(mentor.rating || 0).toFixed(1)}</span>
      </div>

      {expertise.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">Expertise</p>
          <div className="flex flex-wrap gap-1.5">
            {expertise.slice(0, compact ? 3 : 5).map((item, idx) => (
              <span key={idx} className="text-[10px] bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-lg font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {industries.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {industries.map((industry, idx) => (
            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg font-medium flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>{industry}</span>
            </span>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request Mentor</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and describe what guidance you need..."
            className="w-full resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-primary-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MentorCard;
