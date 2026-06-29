// src/components/execution/ProgressChart.jsx
// Simple bar chart for monthly/weekly progress — no external chart library needed

import React from 'react';

const ProgressChart = ({ data = [], labelKey = 'month', valueKey = 'count', title = 'Progress', color = 'bg-primary-500' }) => {
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      )}
      {data.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 italic">No data available.</p>
      ) : (
        <div className="flex items-end space-x-2 h-24" role="img" aria-label={`${title} bar chart`}>
          {data.map((point, i) => {
            const height = max > 0 ? Math.round(((point[valueKey] || 0) / max) * 100) : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-lg ${color} transition-all duration-500 ${height === 0 ? 'bg-slate-100 dark:bg-slate-800 rounded-lg' : ''}`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${point[labelKey]}: ${point[valueKey]} tasks`}
                  />
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                  {point[labelKey]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
