// src/components/execution/KPIWidget.jsx
import React from 'react';
import { TrendingUp } from 'lucide-react';

const CATEGORY_COLORS = {
  'Revenue Progress':  { bar: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400' },
  'Customer Progress': { bar: 'bg-sky-500',     bg: 'bg-sky-50 dark:bg-sky-950/20',         text: 'text-sky-700 dark:text-sky-400' },
  'Marketing Progress':{ bar: 'bg-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/20',   text: 'text-violet-700 dark:text-violet-400' },
  'Business Growth':   { bar: 'bg-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/20',     text: 'text-amber-700 dark:text-amber-400' },
};

const KPIWidget = ({ kpi }) => {
  if (!kpi) return null;

  const percentage = kpi.targetValue > 0
    ? Math.min(100, Math.round((kpi.currentValue / kpi.targetValue) * 100))
    : 0;

  const name = (kpi.name || '').toLowerCase();
  let category = 'Business Growth';
  if (/revenue|sales|income|₹/.test(name))              category = 'Revenue Progress';
  else if (/customer|client|user|subscriber/.test(name)) category = 'Customer Progress';
  else if (/marketing|reach|conversion|rate/.test(name)) category = 'Marketing Progress';

  const colors = CATEGORY_COLORS[category];

  return (
    <div className={`${colors.bg} border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <TrendingUp className={`w-4 h-4 ${colors.text}`} aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={kpi.name}>
            {kpi.name}
          </p>
        </div>
        <span className={`text-sm font-extrabold ${colors.text}`}>{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Values */}
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
        <span>Current: {kpi.currentValue?.toLocaleString('en-IN')}{kpi.unit && ` ${kpi.unit}`}</span>
        <span>Target: {kpi.targetValue?.toLocaleString('en-IN')}{kpi.unit && ` ${kpi.unit}`}</span>
      </div>
    </div>
  );
};

export default KPIWidget;
