import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, TrendingUp, AlertCircle, Heart } from 'lucide-react';

const ScoreBadge = ({ score }) => {
  const color = score >= 70 ? 'emerald' : score >= 45 ? 'amber' : 'rose';
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  const label = score >= 70 ? 'Healthy' : score >= 45 ? 'Moderate' : 'Needs Attention';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${colorMap[color]}`}>
      <Heart className="w-3 h-3" /> {score}/100 · {label}
    </span>
  );
};

const AdvisorCard = ({ advice, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900/40 border border-primary-100 dark:border-primary-900/40 rounded-3xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        ))}
      </div>
    );
  }

  if (!advice) {
    return (
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
        <Bot className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">AI Financial Advisor</p>
        <p className="text-xs text-slate-400">Click <strong>Get Advice</strong> to receive personalised financial guidance.</p>
        {onRefresh && (
          <button onClick={onRefresh} className="mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
            Get Advice
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-primary-100 dark:border-primary-900/40 rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center shadow-md shadow-primary-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">AI Financial Advisor</p>
            <p className="text-[10px] text-slate-400">{advice.generatedAt ? new Date(advice.generatedAt).toLocaleString() : ''}</p>
          </div>
        </div>
        {advice.context?.financialHealthScore !== null && advice.context?.financialHealthScore !== undefined && (
          <ScoreBadge score={advice.context.financialHealthScore} />
        )}
      </div>

      {advice.context && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Revenue', value: `₹${advice.context.revenue?.toLocaleString('en-IN') ?? 0}`, pos: true },
            { label: 'Expenses', value: `₹${advice.context.expenses?.toLocaleString('en-IN') ?? 0}`, pos: false },
            { label: 'Profit', value: `₹${advice.context.profit?.toLocaleString('en-IN') ?? 0}`, pos: advice.context.isProfit },
            { label: 'Cash Flow', value: `₹${advice.context.cashFlow?.toLocaleString('en-IN') ?? 0}`, pos: (advice.context.cashFlow ?? 0) >= 0 },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-sm font-extrabold mt-0.5 ${s.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{advice.advice}</ReactMarkdown>
      </div>

      {onRefresh && (
        <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors cursor-pointer">
          <TrendingUp className="w-3.5 h-3.5" /> Refresh Advice
        </button>
      )}
    </div>
  );
};

export default AdvisorCard;
