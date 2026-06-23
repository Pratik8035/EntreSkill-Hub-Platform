// src/components/funding/EligibilityBadge.jsx
// Compact badge indicating whether a scheme/program is eligible, partial, or not eligible

import React from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

/**
 * Props:
 *   eligible  {boolean}            — true = fully eligible bucket
 *   score     {number}             — 0-100
 *   size      {'sm'|'md'}          — default 'md'
 */
const EligibilityBadge = ({ eligible, score, size = 'md' }) => {
  const isPartial = !eligible && score >= 40;
  const isNot     = !eligible && score < 40;

  const config = eligible
    ? {
        icon:  CheckCircle2,
        label: 'Eligible',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
        iconClass: 'text-emerald-500',
      }
    : isPartial
    ? {
        icon:  AlertCircle,
        label: 'Partial',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
        iconClass: 'text-amber-500',
      }
    : {
        icon:  XCircle,
        label: 'Not Eligible',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
        iconClass: 'text-rose-500',
      };

  const Icon       = config.icon;
  const iconSize   = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const textSize   = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const px         = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center space-x-1 ${px} rounded-full border font-semibold ${textSize} ${config.className}`}
      aria-label={`Eligibility: ${config.label}, score ${score ?? 'N/A'}`}
    >
      <Icon className={`${iconSize} flex-shrink-0 ${config.iconClass}`} aria-hidden="true" />
      <span>{config.label}</span>
      {score != null && (
        <span className="opacity-70">· {score}%</span>
      )}
    </span>
  );
};

export default EligibilityBadge;
