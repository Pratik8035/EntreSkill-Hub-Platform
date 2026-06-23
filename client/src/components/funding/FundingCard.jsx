// src/components/funding/FundingCard.jsx
// Card displaying a single eligibility or recommendation result in the Funding Dashboard

import React from 'react';
import {
  ExternalLink,
  IndianRupee,
  Landmark,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import EligibilityBadge from './EligibilityBadge';

/**
 * Props:
 *   item         — eligibility or recommendation object from the API
 *   mode         — 'eligibility' | 'recommendation'
 */
const FundingCard = ({ item, mode = 'recommendation' }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!item) return null;

  const isEligibility = mode === 'eligibility';

  // ── Field normalisation ───────────────────────────────────────────────────
  const name          = item.schemeName || item.name || 'Unnamed';
  const type          = item.type       || null;
  const score         = item.score      ?? null;
  const provider      = item.provider   || null;
  const fundingType   = item.fundingType || item.fundingAmount ? null : null;
  const reasons       = item.reasons    || [];
  const missing       = item.missingRequirements || [];
  const appUrl        = item.applicationUrl      || null;

  const formatAmount = (val) => {
    if (!val) return null;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000)   return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000)     return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  const amountRange = (item.minAmount || item.maxAmount)
    ? `${formatAmount(item.minAmount) || '—'} – ${formatAmount(item.maxAmount) || '—'}`
    : item.fundingAmount
    ? formatAmount(item.fundingAmount)
    : null;

  const eligible = isEligibility ? item.eligible : null;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 flex flex-col space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {name}
            </p>
            {provider && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                {provider}
              </p>
            )}
          </div>
        </div>

        {/* Badge */}
        {isEligibility && score != null && (
          <EligibilityBadge eligible={eligible} score={score} size="sm" />
        )}
        {!isEligibility && score != null && (
          <span className="inline-block bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
            {score}% match
          </span>
        )}
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-1.5">
        {type && (
          <span className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" aria-hidden="true" />
            <span>{type}</span>
          </span>
        )}
        {amountRange && (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
            <IndianRupee className="w-2.5 h-2.5" aria-hidden="true" />
            <span>{amountRange}</span>
          </span>
        )}
      </div>

      {/* Expandable reasons / missing */}
      {(reasons.length > 0 || missing.length > 0) && (
        <div>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center space-x-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{expanded ? 'Hide details' : 'View details'}</span>
          </button>

          {expanded && (
            <div className="mt-2 space-y-2">
              {reasons.length > 0 && (
                <ul className="space-y-1">
                  {reasons.slice(0, 4).map((r, i) => (
                    <li key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              )}
              {missing.length > 0 && (
                <ul className="space-y-1">
                  {missing.slice(0, 4).map((m, i) => (
                    <li key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Apply link */}
      {appUrl && (
        <a
          href={appUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center space-x-1.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
          aria-label={`Apply for ${name}`}
        >
          <span>Apply</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  );
};

export default FundingCard;
