import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const FinancialStatCard = ({ label, value, trend, trendLabel, icon: Icon, color = 'primary', prefix = '₹' }) => {
  const colorMap = {
    primary: 'from-primary-600 to-primary-500',
    emerald: 'from-emerald-600 to-teal-500',
    rose: 'from-rose-600 to-pink-500',
    amber: 'from-amber-500 to-orange-400',
    violet: 'from-violet-600 to-purple-500',
    sky: 'from-sky-600 to-blue-500',
  };
  const isPositiveTrend = trend >= 0;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${colorMap[color]} flex items-center justify-center shadow-sm`}>
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
        {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : (value ?? '—')}
      </p>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositiveTrend ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {isPositiveTrend ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isPositiveTrend ? '+' : ''}{trend}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};

export default FinancialStatCard;
