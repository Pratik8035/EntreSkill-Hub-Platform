import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, BarChart2,
  FileText, Receipt, Target, Bot, RefreshCw, AlertCircle,
  ArrowRight, Heart,
} from 'lucide-react';
import { getFinancialDashboard } from '../services/financeService';
import FinancialStatCard from '../components/finance/FinancialStatCard';
import FinancialChart from '../components/finance/FinancialChart';
import CashFlowChart from '../components/finance/CashFlowChart';
import toast from 'react-hot-toast';

const Skeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
    <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
  </div>
);

const QuickLink = ({ to, label, Icon, color }) => (
  <Link to={to} className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors`}>
    <Icon className={`w-4 h-4 text-${color}-600 dark:text-${color}-400`} />
    <span className={`text-xs font-semibold text-${color}-700 dark:text-${color}-300`}>{label}</span>
    <ArrowRight className={`w-3 h-3 ml-auto text-${color}-500`} />
  </Link>
);

const FinanceDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFinancialDashboard();
      setAnalytics(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard');
      toast.error('Failed to load financial dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const healthColor = analytics?.financialHealthScore >= 70 ? 'emerald'
    : analytics?.financialHealthScore >= 45 ? 'amber' : 'rose';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sprint 12</span>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Finance Dashboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Complete financial overview for your business</p>
            </div>
          </div>
          <button onClick={fetchDashboard} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [1,2,3,4].map(i => <Skeleton key={i} />) : analytics ? (
            <>
              <FinancialStatCard label="Revenue" value={analytics.revenue} trend={analytics.revenueGrowth} icon={TrendingUp} color="emerald" />
              <FinancialStatCard label="Expenses" value={analytics.expenses} trend={analytics.expenseGrowth} icon={TrendingDown} color="rose" />
              <FinancialStatCard label={analytics.isProfit ? 'Profit' : 'Loss'} value={Math.abs(analytics.profit)} icon={Wallet} color={analytics.isProfit ? 'primary' : 'rose'} />
              <FinancialStatCard label="Cash Flow" value={analytics.netCashFlow} icon={BarChart2} color={analytics.netCashFlow >= 0 ? 'sky' : 'rose'} />
            </>
          ) : null}
        </div>

        {/* Health Score + Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className={`w-16 h-16 rounded-2xl bg-${healthColor}-100 dark:bg-${healthColor}-900/30 flex items-center justify-center`}>
              <Heart className={`w-8 h-8 text-${healthColor}-600 dark:text-${healthColor}-400`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Financial Health</p>
              <p className={`text-4xl font-extrabold text-${healthColor}-600 dark:text-${healthColor}-400 font-outfit`}>
                {loading ? '—' : (analytics?.financialHealthScore ?? 0)}
              </p>
              <p className="text-xs text-slate-400">/100</p>
            </div>
            {analytics && (
              <div className="w-full space-y-1 text-left">
                {[
                  { l: 'Budget Util.', v: `${analytics.budgetUtilization ?? 0}%` },
                  { l: 'Burn Rate', v: `₹${analytics.burnRate?.toLocaleString('en-IN') ?? 0}/mo` },
                  { l: 'Overdue Inv.', v: analytics.overdueInvoices ?? 0 },
                ].map(s => (
                  <div key={s.l} className="flex justify-between text-xs">
                    <span className="text-slate-400">{s.l}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{s.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Trend Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ) : (
              <FinancialChart data={analytics?.monthlyTrend ?? []} title="Income vs Expenses (6 months)" />
            )}
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6">
          {loading ? (
            <div className="animate-pulse h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ) : (
            <CashFlowChart data={analytics?.monthlyTrend ?? []} />
          )}
        </div>

        {/* Quick Navigation */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-3">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Access</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <QuickLink to="/finance/income" label="Income" Icon={TrendingUp} color="emerald" />
            <QuickLink to="/finance/expenses" label="Expenses" Icon={TrendingDown} color="rose" />
            <QuickLink to="/finance/budgets" label="Budgets" Icon={Wallet} color="amber" />
            <QuickLink to="/finance/invoices" label="Invoices" Icon={Receipt} color="sky" />
            <QuickLink to="/finance/reports" label="Reports" Icon={FileText} color="violet" />
            <QuickLink to="/finance/advisor" label="AI Advisor" Icon={Bot} color="primary" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinanceDashboard;
