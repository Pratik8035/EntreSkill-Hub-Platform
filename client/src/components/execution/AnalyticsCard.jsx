// src/components/execution/AnalyticsCard.jsx
import React from 'react';

/**
 * Props:
 *   label   {string}
 *   value   {string|number}
 *   sub     {string}  — optional subtitle
 *   color   {string}  — Tailwind color class for value text
 *   icon    {React.Component}
 */
const AnalyticsCard = ({ label, value, sub, color = 'text-primary-600 dark:text-primary-400', icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      {Icon && <Icon className="w-4 h-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />}
    </div>
    <p className={`text-2xl font-extrabold font-outfit ${color}`}>{value ?? '—'}</p>
    {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
  </div>
);

export default AnalyticsCard;
