import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, RefreshCw, AlertCircle, BarChart2,
  Target, TrendingUp, Activity, Calendar, Clock, CheckCircle2,
} from 'lucide-react';
import useReports from '../hooks/useReports';
import ReportCard from '../components/reports/ReportCard';
import toast from 'react-hot-toast';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 animate-pulse space-y-3">
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/2" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
      </div>
    </div>
  </div>
);

// ─── Report Viewer ─────────────────────────────────────────────────────────────

const StatLine = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{value ?? '—'}</span>
  </div>
);

const ReportViewer = ({ report, onClose }) => {
  if (!report) return null;

  const ts = report.generatedAt ? new Date(report.generatedAt).toLocaleString() : null;

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-primary-100 dark:border-primary-900/40 rounded-3xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {report.type?.replace(/_/g, ' ')}
          </p>
          <h2 className="font-outfit text-xl font-extrabold text-slate-900 dark:text-white">
            {report.label}
          </h2>
          {ts && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Generated {ts}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Close
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">

        {/* business_summary */}
        {report.type === 'business_summary' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Health Score',      value: report.businessHealthScore },
              { label: 'Readiness Score',   value: report.businessReadinessScore },
              { label: 'Goal Completion',   value: `${report.goalCompletionRate ?? 0}%` },
              { label: 'Task Completion',   value: `${report.taskCompletionRate ?? 0}%` },
              { label: 'Milestone Completion', value: `${report.milestoneCompletionRate ?? 0}%` },
              { label: 'Total Goals',       value: report.totalGoals ?? 0 },
              { label: 'Completed Goals',   value: report.completedGoals ?? 0 },
              { label: 'Total Tasks',       value: report.totalTasks ?? 0 },
              { label: 'Completed Tasks',   value: report.completedTasks ?? 0 },
              { label: 'Overdue Tasks',     value: report.overdueTasks ?? 0 },
              { label: 'Upcoming Deadlines',value: report.upcomingDeadlines ?? 0 },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* goal_report */}
        {report.type === 'goal_report' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total',       value: report.totalGoals ?? 0 },
                { label: 'Completed',   value: report.byStatus?.completed ?? 0 },
                { label: 'In Progress', value: report.byStatus?.inProgress ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{s.value}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {report.goals?.length > 0 && (
              <div className="space-y-1">
                {report.goals.map((g) => (
                  <div key={g._id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{g.title}</p>
                      <p className="text-[10px] text-slate-400">{g.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{g.progress ?? 0}%</p>
                      <p className="text-[10px] text-slate-400">{g.completedTasks}/{g.totalTasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* kpi_report */}
        {report.type === 'kpi_report' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total KPIs',    value: report.totalKPIs ?? 0 },
                { label: 'On Track',      value: report.onTrack ?? 0 },
                { label: 'Below Target',  value: report.belowTarget ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{s.value}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {report.kpis?.map((k) => (
              <div key={k._id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{k.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${k.onTrack ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {k.onTrack ? 'On Track' : 'Below Target'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${k.onTrack ? 'bg-green-500' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(100, k.percentage ?? 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 w-10 text-right">
                    {k.percentage ?? 0}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {k.currentValue} / {k.targetValue} {k.unit}
                </p>
              </div>
            ))}
          </>
        )}

        {/* execution_report */}
        {report.type === 'execution_report' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Milestones</p>
                <StatLine label="Total"     value={report.milestones?.total} />
                <StatLine label="Completed" value={report.milestones?.completed} />
                <StatLine label="Pending"   value={report.milestones?.pending} />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tasks</p>
                <StatLine label="Total"       value={report.tasks?.total} />
                <StatLine label="Completed"   value={report.tasks?.completed} />
                <StatLine label="In Progress" value={report.tasks?.inProgress} />
                <StatLine label="Pending"     value={report.tasks?.pending} />
                <StatLine label="Overdue"     value={report.tasks?.overdue} />
              </div>
            </div>
            {report.recentActivity?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Recent Activity
                </p>
                {report.recentActivity.slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{a.title}</span>
                    </div>
                    {a.completedAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(a.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* analytics_report */}
        {report.type === 'analytics_report' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Goal Completion',      value: `${report.goalCompletionRate ?? 0}%` },
              { label: 'Task Completion',       value: `${report.taskCompletionRate ?? 0}%` },
              { label: 'Milestone Completion',  value: `${report.milestoneCompletionRate ?? 0}%` },
              { label: 'Health Score',          value: report.businessHealthScore ?? 0 },
              { label: 'Readiness Score',       value: report.businessReadinessScore ?? 0 },
              { label: 'Total Goals',           value: report.totalGoals ?? 0 },
              { label: 'Total Tasks',           value: report.totalTasks ?? 0 },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* weekly_report | monthly_report */}
        {(report.type === 'weekly_report' || report.type === 'monthly_report') && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Period',              value: report.period === 'weekly' ? 'Weekly' : 'Monthly' },
                { label: 'Tasks Completed',     value: report.tasksCompleted ?? 0 },
                { label: 'Milestones Completed',value: report.milestonesCompleted ?? 0 },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
            {report.tasks?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Completed Tasks
                </p>
                {report.tasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{t.title}</span>
                    </div>
                    {t.completedAt && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const {
    reportTypes,
    activeReport,
    loadingTypes,
    loadingReport,
    error,
    fetchReportTypes,
    fetchReport,
    clearReport,
  } = useReports();

  const [activeType, setActiveType] = useState(null);

  const handleGenerate = async (type) => {
    try {
      setActiveType(type);
      await fetchReport(type);
    } catch {
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <Link
          to="/business-execution"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Business Execution</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                Sprint 9
              </span>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Reports
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate structured execution reports
              </p>
            </div>
          </div>

          <button
            onClick={fetchReportTypes}
            disabled={loadingTypes}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            aria-label="Refresh report types"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingTypes ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report type grid */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Available Reports
            </p>

            {loadingTypes ? (
              [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
            ) : reportTypes.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No reports available</div>
            ) : (
              reportTypes.map((r) => (
                <ReportCard
                  key={r.type}
                  report={r}
                  onGenerate={handleGenerate}
                  loading={loadingReport && activeType === r.type}
                  active={activeReport?.type === r.type}
                />
              ))
            )}
          </div>

          {/* Report viewer */}
          <div className="lg:col-span-2">
            {activeReport ? (
              <ReportViewer report={activeReport} onClose={clearReport} />
            ) : (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <BarChart2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Select a report to generate
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Click <strong>Generate Report</strong> on any report type to view detailed insights.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
