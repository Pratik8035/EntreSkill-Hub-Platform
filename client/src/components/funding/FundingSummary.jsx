// src/components/funding/FundingSummary.jsx
// Displays the AI-generated advisor summary text with a loading skeleton

import React from 'react';
import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SummaryLine = ({ width = 'w-full' }) => (
  <div className={`h-3 ${width} bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse`} />
);

const FundingSummarySkeleton = () => (
  <div className="space-y-2.5 py-2">
    <SummaryLine />
    <SummaryLine width="w-11/12" />
    <SummaryLine width="w-5/6" />
    <SummaryLine />
    <SummaryLine width="w-3/4" />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Props:
 *   summary   {string|null}
 *   loading   {boolean}
 *   onRefresh {function}
 */
const FundingSummary = ({ summary, loading, onRefresh }) => {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950/30 dark:to-secondary-950/20 border border-primary-100 dark:border-primary-900/40 rounded-2xl p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
              AI Funding Advisor
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
              Personalised funding summary
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-950/50 rounded-lg transition-colors cursor-pointer text-primary-500 dark:text-primary-400 disabled:opacity-50"
            aria-label="Refresh funding advisor"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <FundingSummarySkeleton />
      ) : summary ? (
        <div className="space-y-2">
          {/* Render paragraphs split by double newlines */}
          {summary.split(/\n\n+/).map((para, i) => (
            <p
              key={i}
              className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{
                // Bold markdown **text** only — safe since this is server-generated content
                __html: para.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>'
                ),
              }}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center space-x-2 py-2 text-xs text-slate-400 dark:text-slate-500">
          <Sparkles className="w-4 h-4 text-primary-400" aria-hidden="true" />
          <span>
            Complete your assessment and generate a business plan to unlock personalised AI funding advice.
          </span>
        </div>
      )}
    </div>
  );
};

export default FundingSummary;
