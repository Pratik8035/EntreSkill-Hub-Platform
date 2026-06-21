import React from 'react';
import { ExternalLink, CreditCard, IndianRupee, Landmark, Percent } from 'lucide-react';

const FundingCard = ({ fundingData, isRecommendedMode }) => {
  const program = isRecommendedMode ? fundingData.program : fundingData;
  const matchScore = isRecommendedMode ? fundingData.matchScore : null;
  const reasons = isRecommendedMode ? fundingData.reasons : [];

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
    if (score >= 80) return 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-250 dark:border-violet-900';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-250 dark:border-amber-900';
    return 'text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between relative group">
      
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="bg-secondary-50 dark:bg-secondary-950/40 text-secondary-750 dark:text-secondary-350 border border-secondary-100 dark:border-secondary-900/50 text-xs px-3 py-1 rounded-full font-bold">
          Commercial Loan
        </span>

        <div className="flex items-center space-x-2">
          {/* Industry badge */}
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 px-2.5 py-0.5 border border-slate-150 dark:border-slate-700 rounded-full">
            {program.industry || 'All Industries'}
          </span>

          {/* Match Score */}
          {isRecommendedMode && matchScore !== null && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getScoreColor(matchScore)}`}>
              {matchScore}% Match
            </span>
          )}
        </div>
      </div>

      {/* Provider & Loan Title */}
      <div className="space-y-1 flex-grow mb-4">
        <div className="flex items-center space-x-1.5 text-xs text-slate-450 dark:text-slate-400 font-semibold uppercase tracking-wide">
          <Landmark className="w-3.5 h-3.5" />
          <span>{program.provider}</span>
        </div>
        <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
          {program.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
          {program.eligibility}
        </p>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl mb-4 text-xs">
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Maximum Limit</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold flex items-center space-x-0.5 mt-0.5">
            <IndianRupee className="w-3.5 h-3.5 text-slate-550" />
            <span>{formatAmount(program.amount)}</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">Interest Rate</span>
          <span className="text-violet-650 dark:text-violet-400 font-bold flex items-center space-x-0.5 mt-0.5">
            <Percent className="w-3.5 h-3.5" />
            <span>{program.interestRate ? `${program.interestRate}% p.a.` : 'Varies'}</span>
          </span>
        </div>
      </div>

      {/* Matching Reasons */}
      {isRecommendedMode && reasons.length > 0 && (
        <div className="bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 p-3 rounded-2xl mb-4">
          <span className="text-[10px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wide block mb-1">
            Matching Analysis:
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
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        {program.applicationLink ? (
          <a
            href={program.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Apply for Funding</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            disabled
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-not-allowed"
          >
            <span>Applications Closed</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default FundingCard;
