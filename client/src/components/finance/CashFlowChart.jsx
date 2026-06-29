import React from 'react';

/**
 * CashFlowChart — Visualises net cash flow per month using CSS bars
 */
const CashFlowChart = ({ data = [], height = 140 }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-32 text-slate-400 text-xs">No cash flow data</div>;
  }

  const values = data.map((d) => d.net ?? d.profit ?? 0);
  const maxAbs = Math.max(...values.map(Math.abs), 1);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cash Flow Trend</p>
      <div className="flex items-center gap-2" style={{ height }}>
        {data.map((d, i) => {
          const val = d.net ?? d.profit ?? 0;
          const isPos = val >= 0;
          const barH = Math.round((Math.abs(val) / maxAbs) * ((height - 20) / 2));
          return (
            <div key={i} className="flex-1 flex flex-col items-center" style={{ height }}>
              {/* positive half */}
              <div className="flex-1 flex items-end w-full">
                <div
                  className={`w-full rounded-t-sm ${isPos ? 'bg-emerald-400 dark:bg-emerald-500' : ''}`}
                  style={{ height: isPos ? barH : 0 }}
                  title={isPos ? `+₹${val.toLocaleString('en-IN')}` : undefined}
                />
              </div>
              {/* axis */}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              {/* negative half */}
              <div className="flex-1 flex items-start w-full">
                <div
                  className={`w-full rounded-b-sm ${!isPos ? 'bg-rose-400 dark:bg-rose-500' : ''}`}
                  style={{ height: !isPos ? barH : 0 }}
                  title={!isPos ? `-₹${Math.abs(val).toLocaleString('en-IN')}` : undefined}
                />
              </div>
              <p className="text-[9px] text-slate-400 text-center truncate w-full">{d.label || d.month}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Positive</div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500"><div className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Negative</div>
      </div>
    </div>
  );
};

export default CashFlowChart;
