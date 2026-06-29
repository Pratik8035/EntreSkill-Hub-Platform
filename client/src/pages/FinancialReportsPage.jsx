import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw, AlertCircle, BarChart2 } from 'lucide-react';
import useFinancialReports from '../hooks/useFinancialReports';
import toast from 'react-hot-toast';

const typeIcons = {
  income_report: '📈', expense_report: '📉', profit_report: '💰',
  loss_report: '⚠️', cash_flow_report: '💧', budget_report: '🏦',
  invoice_report: '🧾', monthly_report: '📅', yearly_report: '📆',
};

const Stat = ({ label, value }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{value ?? '—'}</p>
  </div>
);

const ReportViewer = ({ report, onClose }) => {
  if (!report) return null;
  const fmt = (v) => typeof v === 'number' ? `₹${v.toLocaleString('en-IN')}` : v;
  return (
    <div className="bg-white dark:bg-slate-900/40 border border-primary-100 dark:border-primary-900/40 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{report.type?.replace(/_/g, ' ')}</p>
          <h2 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">{report.label}</h2>
          {report.generatedAt && <p className="text-[10px] text-slate-400 mt-0.5">Generated {new Date(report.generatedAt).toLocaleString()}</p>}
        </div>
        <button onClick={onClose} className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Close</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {report.type === 'income_report' && <>
          <Stat label="Total Income" value={fmt(report.totalIncome)} />
          <Stat label="Records" value={report.totalRecords} />
          {report.byCategory && Object.entries(report.byCategory).map(([k, v]) => <Stat key={k} label={k} value={fmt(v)} />)}
        </>}
        {report.type === 'expense_report' && <>
          <Stat label="Total Expenses" value={fmt(report.totalExpenses)} />
          <Stat label="Records" value={report.totalRecords} />
          {report.byCategory && Object.entries(report.byCategory).map(([k, v]) => <Stat key={k} label={k} value={fmt(v)} />)}
        </>}
        {report.type === 'profit_report' && <>
          <Stat label="Revenue" value={fmt(report.revenue)} />
          <Stat label="Expenses" value={fmt(report.expenses)} />
          <Stat label={report.isProfit ? 'Profit' : 'Loss'} value={fmt(Math.abs(report.profit))} />
          <Stat label="Profit Margin" value={`${report.profitMargin ?? 0}%`} />
          <Stat label="Health Score" value={`${report.financialHealthScore ?? 0}/100`} />
        </>}
        {report.type === 'loss_report' && <>
          <Stat label="Current Month" value={report.currentMonthIsLoss ? `₹${report.currentLoss?.toLocaleString('en-IN')} loss` : 'Profitable'} />
          <Stat label="Loss Periods (12mo)" value={report.totalLossPeriods} />
          <Stat label="Total Loss" value={fmt(report.totalLossAmount)} />
          <Stat label="Burn Rate" value={fmt(report.burnRate)} />
        </>}
        {report.type === 'cash_flow_report' && <>
          <Stat label="Cash Inflow" value={fmt(report.cashInflow)} />
          <Stat label="Cash Outflow" value={fmt(report.cashOutflow)} />
          <Stat label="Net Cash Flow" value={fmt(report.netCashFlow)} />
          <Stat label="Status" value={report.isPositive ? '✅ Positive' : '⚠️ Negative'} />
          <Stat label="Burn Rate" value={fmt(report.burnRate)} />
        </>}
        {report.type === 'budget_report' && <>
          <Stat label="Total Budgets" value={report.totalBudgets} />
          <Stat label="Total Allocated" value={fmt(report.totalAllocated)} />
          <Stat label="Total Spent" value={fmt(report.totalSpent)} />
          <Stat label="Utilization" value={`${report.overallUtilization ?? 0}%`} />
          <Stat label="Exceeded" value={report.exceededBudgets} />
        </>}
        {report.type === 'invoice_report' && <>
          <Stat label="Total Invoices" value={report.totalInvoices} />
          <Stat label="Paid" value={report.byStatus?.paid} />
          <Stat label="Overdue" value={report.byStatus?.overdue} />
          <Stat label="Revenue" value={fmt(report.totalRevenue)} />
          <Stat label="Pending" value={fmt(report.pendingAmount)} />
          <Stat label="Overdue Amount" value={fmt(report.overdueAmount)} />
        </>}
        {(report.type === 'monthly_report' || report.type === 'yearly_report') && <>
          <Stat label="Revenue" value={fmt(report.revenue ?? report.totalRevenue)} />
          <Stat label="Expenses" value={fmt(report.expenses ?? report.totalExpenses)} />
          <Stat label={report.isProfit ? 'Profit' : 'Loss'} value={fmt(Math.abs(report.profit ?? report.totalProfit ?? 0))} />
          {report.revenueGrowth !== undefined && <Stat label="Revenue Growth" value={`${report.revenueGrowth}%`} />}
          <Stat label="Health Score" value={`${report.financialHealthScore ?? 0}/100`} />
          {report.burnRate && <Stat label="Burn Rate" value={fmt(report.burnRate)} />}
        </>}
      </div>
    </div>
  );
};

const FinancialReportsPage = () => {
  const { reportTypes, activeReport, loadingTypes, loadingReport, error, fetchReportTypes, fetchReport, clearReport } = useFinancialReports();
  const [activeType, setActiveType] = useState(null);

  const handleGenerate = async (type) => {
    try { setActiveType(type); await fetchReport(type); }
    catch { toast.error('Failed to generate report'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/finance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Finance Dashboard</Link>

        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">Financial Reports</h1>
              <p className="text-xs text-slate-400">Generate structured financial reports</p>
            </div>
          </div>
          <button onClick={fetchReportTypes} disabled={loadingTypes} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-50 transition-colors cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTypes ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {error && <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center gap-3"><AlertCircle className="w-4 h-4 text-rose-500" /><p className="text-sm text-rose-700 dark:text-rose-400">{error}</p></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Available Reports</p>
            {loadingTypes ? [1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />) :
              reportTypes.map(r => (
                <div key={r.type} className={`bg-white dark:bg-slate-900/40 border rounded-2xl p-4 flex items-start justify-between gap-3 ${activeReport?.type === r.type ? 'border-primary-200 dark:border-primary-800' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">{typeIcons[r.type] || '📊'}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{r.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleGenerate(r.type)} disabled={loadingReport && activeType === r.type} className="flex-shrink-0 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer">
                    {loadingReport && activeType === r.type ? '...' : 'Generate'}
                  </button>
                </div>
              ))
            }
          </div>
          <div className="lg:col-span-2">
            {activeReport ? <ReportViewer report={activeReport} onClose={clearReport} /> : (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <BarChart2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Select a report to generate</p>
                <p className="text-xs text-slate-400">Click <strong>Generate</strong> on any report type to view financial insights.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReportsPage;
