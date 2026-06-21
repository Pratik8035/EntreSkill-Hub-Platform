import React from 'react';
import { ExternalLink, CheckCircle2, MapPin, IndianRupee, HelpCircle, Award } from 'lucide-react';

const SchemeCard = ({ schemeData, isRecommendedMode, onCheckEligibility }) => {
  // Determine if it's recommendation data or raw scheme
  const scheme = isRecommendedMode ? schemeData.scheme : schemeData;
  const matchScore = isRecommendedMode ? schemeData.matchScore : null;
  const reasons = isRecommendedMode ? schemeData.reasons : [];

  // Helper to format Indian currency
  const formatAmount = (num) => {
    if (!num) return 'N/A';
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)} Crore`;
    }
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)} Lakh`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-250 dark:border-emerald-900';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-250 dark:border-amber-900';
    return 'text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between relative group">
      
      {/* Top badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="bg-primary-50 dark:bg-primary-950/40 text-primary-750 dark:text-primary-350 border border-primary-100 dark:border-primary-850 text-xs px-3 py-1 rounded-full font-bold">
          {scheme.category || 'Government Scheme'}
        </span>
        
        <div className="flex items-center space-x-2">
          {/* State tag */}
          <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 px-2.5 py-0.5 rounded-full">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="capitalize">{scheme.state || 'All States'}</span>
          </span>

          {/* Match Score */}
          {isRecommendedMode && matchScore !== null && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getScoreColor(matchScore)}`}>
              {matchScore}% Match
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-2 flex-grow mb-4">
        <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
          {scheme.name}
        </h3>
        <p className="text-xs text-slate-550 dark:text-slate-405 leading-relaxed line-clamp-3">
          {scheme.description}
        </p>
      </div>

      {/* Funding & Benefits */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl mb-4 text-xs">
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Max Funding Amount</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center space-x-0.5 mt-0.5">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>{formatAmount(scheme.fundingAmount)}</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Eligibility Criteria</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5" title={scheme.eligibility}>
            {scheme.eligibility || 'Open Scheme'}
          </span>
        </div>
      </div>

      {/* Recommendations explanation details */}
      {isRecommendedMode && reasons.length > 0 && (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/35 p-3 rounded-2xl mb-4">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-405 uppercase tracking-wide block mb-1">
            Why recommended:
          </span>
          <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-350 list-disc list-inside">
            {reasons.slice(0, 2).map((reason, idx) => (
              <li key={idx} className="line-clamp-2 leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => onCheckEligibility(scheme._id)}
          className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Check Eligibility</span>
        </button>

        {scheme.officialLink && (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            title="Official Link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

    </div>
  );
};

export default SchemeCard;
