import React from 'react';

/**
 * FinancialChart — Simple bar chart using pure CSS/HTML
 * No external chart library required (matches project zero-dep approach)
 */
const FinancialChart = ({ data = [], title, height = 160 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400 text-xs">No data</div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.income ?? 0, d.expenses ?? 0, d.profit ?? 0]), 1);

  return (
    <div className="space-y-2">
      {title && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full flex items-end gap-0.5" style={{ height: height - 20 }}>
              {d.income !== undefined && (
                <div
                  className="flex-1 bg-emerald-400 dark:bg-emerald-500 rounded-t-sm"
                  style={{ height: `${(d.income / maxVal) * 100}%`, minHeight: d.income > 0 ? 2 : 0 }}
                  title={`Income: ₹${d.income?.toLocaleString('en-IN')}`}
                />
              )}
              {d.expenses !== undefined && (
                <div
                  className="flex-1 bg-rose-400 dark:bg-rose-500 rounded-t-sm"
                  style={{ height: `${(d.expenses / maxVal) * 100}%`, minHeight: d.expenses > 0 ? 2 : 0 }}
                  title={`Expenses: ₹${d.expenses?.toLocaleString('en-IN')}`}
                />
              )}
            </div>
            <p className="text-[9px] text-slate-400 text-center truncate w-full">{d.label || d.month}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Income
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Expenses
        </div>
      </div>
    </div>
  );
};

export default FinancialChart;
