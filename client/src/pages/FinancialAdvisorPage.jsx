import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, AlertCircle } from 'lucide-react';
import useFinancialAdvisor from '../hooks/useFinancialAdvisor';
import AdvisorCard from '../components/finance/AdvisorCard';
import toast from 'react-hot-toast';

const FinancialAdvisorPage = () => {
  const { advice, loading, error, fetchAdvice } = useFinancialAdvisor();

  const handleFetch = async () => {
    try { await fetchAdvice(); }
    catch { toast.error('Failed to get financial advice'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-violet-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Sprint 12</span>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">AI Financial Advisor</h1>
              <p className="text-xs text-slate-400">Personalised financial guidance based on your data</p>
            </div>
          </div>
          <button onClick={handleFetch} disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
            {loading ? 'Analysing...' : 'Get Advice'}
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <AdvisorCard advice={advice} loading={loading} onRefresh={handleFetch} />

        <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            💡 The AI advisor uses your income, expense, budget, invoice and goals data to provide personalised guidance.
            Add more financial records for more accurate advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAdvisorPage;
