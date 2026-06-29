import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, TrendingUp, Activity, Calendar, Clock, RefreshCw,
  Plus, ArrowLeft, AlertCircle, CheckCircle2, BarChart2, Zap,
} from 'lucide-react';
import useExecutionDashboard from '../hooks/useExecutionDashboard';
import useBusinessGoals from '../hooks/useBusinessGoals';
import GoalCard from '../components/execution/GoalCard';
import KPIWidget from '../components/execution/KPIWidget';
import ProgressChart from '../components/execution/ProgressChart';
import AnalyticsCard from '../components/execution/AnalyticsCard';
import toast from 'react-hot-toast';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${w} ${h} bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse`} />
);
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
    <div className="flex space-x-3"><div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" /><div className="flex-1 space-y-2"><Skeleton w="w-2/3" /><Skeleton w="w-1/3" h="h-3" /></div></div>
    <Skeleton h="h-3" /><Skeleton w="w-3/4" h="h-3" />
  </div>
);

// ─── Create Goal Modal ─────────────────────────────────────────────────────────
const CreateGoalModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '', targetDate: '', priority: 'Medium' });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetDate) return;
    setSaving(true);
    try { await onCreate(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create goal'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10">
        <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">New Goal</h2>
        <form onSubmit={submit} className="space-y-3">
          <input name="title" value={form.title} onChange={handle} placeholder="Goal title *" required
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <textarea name="description" value={form.description} onChange={handle} placeholder="Description (optional)" rows={2}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100 resize-none" />
          <input name="targetDate" type="date" value={form.targetDate} onChange={handle} required
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <select name="priority" value={form.priority} onChange={handle}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100">
            {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <div className="flex space-x-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer disabled:opacity-60">
              {saving ? 'Creating…' : 'Create Goal'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const BusinessExecutionDashboard = () => {
  const { summary, analytics, kpis, loading: dashLoading, error: dashError, refetch: refetchDash } = useExecutionDashboard();
  const { goals, loading: goalsLoading, error: goalsError, refetch: refetchGoals, createGoal, deleteGoal } = useBusinessGoals();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab]   = useState('goals'); // 'goals' | 'analytics'

  const loading = dashLoading || goalsLoading;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal and all its milestones/tasks?')) return;
    try { await deleteGoal(id); }
    catch { toast.error('Failed to delete goal'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /><span>Dashboard</span>
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Sprint 8</span>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Business Execution</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button onClick={() => { refetchDash(); refetchGoals(); }} disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /><span>New Goal</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {(dashError || goalsError) && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{dashError?.message || goalsError}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Goals',     value: loading ? '…' : summary?.totalGoals ?? 0,     color: 'text-slate-800 dark:text-slate-100', icon: Target },
            { label: 'Completed',       value: loading ? '…' : summary?.completedGoals ?? 0,  color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
            { label: 'Avg Progress',    value: loading ? '…' : `${summary?.averageProgress ?? 0}%`, color: 'text-primary-600 dark:text-primary-400', icon: TrendingUp },
            { label: 'Health Score',    value: loading ? '…' : `${analytics?.businessHealthScore ?? 0}`, color: 'text-violet-600 dark:text-violet-400', icon: Zap },
          ].map((s) => (
            <AnalyticsCard key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full sm:w-auto">
          {[{ id: 'goals', label: 'Goals', icon: Target }, { id: 'analytics', label: 'Analytics', icon: BarChart2 }].map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                role="tab" aria-selected={activeTab === tab.id}>
                <Icon className="w-3.5 h-3.5" /><span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Goals Tab ────────────────────────────────────────────────────── */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* KPI Widgets */}
            {kpis.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">KPIs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {kpis.slice(0, 4).map((k) => <KPIWidget key={k._id} kpi={k} />)}
                </div>
              </div>
            )}

            {/* Upcoming deadlines */}
            {!loading && summary?.upcomingDeadlines?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Upcoming Deadlines</p>
                </div>
                <ul className="space-y-1">
                  {summary.upcomingDeadlines.map((d) => (
                    <li key={d.id} className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                      <span className="font-medium truncate">{d.title}</span>
                      <span className="text-amber-500 dark:text-amber-400 ml-2 flex-shrink-0">
                        {new Date(d.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Overdue tasks */}
            {!loading && summary?.overdueTasks?.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Overdue Tasks</p>
                </div>
                <ul className="space-y-1">
                  {summary.overdueTasks.slice(0, 5).map((t) => (
                    <li key={t._id} className="flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                      <span className="font-medium truncate">{t.title}</span>
                      <span className="text-rose-500 ml-2 flex-shrink-0">
                        {new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Goals grid */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Your Goals</h2>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
              ) : goals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {goals.map((g) => <GoalCard key={g._id} goal={g} onDelete={handleDelete} />)}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                  <Target className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No goals yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Create your first business goal to start tracking execution.</p>
                  <button onClick={() => setShowCreate(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                    <Plus className="w-3.5 h-3.5" /><span>Create Goal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Completion rates */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Goal Completion',      value: loading ? '…' : `${analytics?.goalCompletionRate ?? 0}%`,      color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Task Completion',       value: loading ? '…' : `${analytics?.taskCompletionRate ?? 0}%`,      color: 'text-primary-600 dark:text-primary-400' },
                { label: 'Milestone Completion',  value: loading ? '…' : `${analytics?.milestoneCompletionRate ?? 0}%`, color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Readiness Score',       value: loading ? '…' : `${analytics?.businessReadinessScore ?? 0}`,  color: 'text-amber-600 dark:text-amber-400', icon: Activity },
              ].map((s) => <AnalyticsCard key={s.label} label={s.label} value={s.value} color={s.color} icon={s.icon} />)}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <ProgressChart
                  data={analytics?.monthlyProgress || []}
                  labelKey="month" valueKey="count"
                  title="Monthly Progress (Tasks Completed)"
                  color="bg-primary-500"
                />
              </div>
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                <ProgressChart
                  data={analytics?.weeklyProgress || []}
                  labelKey="week" valueKey="count"
                  title="Weekly Progress (Tasks Completed)"
                  color="bg-violet-500"
                />
              </div>
            </div>

            {/* Top KPIs */}
            {analytics?.topKPIs?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Top KPIs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {analytics.topKPIs.map((k) => <KPIWidget key={k.id} kpi={k} />)}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {analytics?.recentActivity?.length > 0 && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recent Activity</h2>
                <ul className="space-y-2">
                  {analytics.recentActivity.slice(0, 8).map((a) => (
                    <li key={a.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{a.title}</span>
                      </div>
                      {a.completedAt && (
                        <span className="text-slate-400 flex-shrink-0 ml-2">
                          {new Date(a.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Upcoming Tasks */}
            {analytics?.upcomingTasks?.length > 0 && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upcoming Tasks</h2>
                <ul className="space-y-2">
                  {analytics.upcomingTasks.slice(0, 8).map((t) => (
                    <li key={t.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{t.title}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <span className="text-slate-400">
                          {new Date(t.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state */}
            {!loading && !analytics && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-10 text-center">
                <BarChart2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No analytics yet</p>
                <p className="text-xs text-slate-400 mt-1">Create goals and complete tasks to see analytics.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {showCreate && (
        <CreateGoalModal onClose={() => setShowCreate(false)} onCreate={createGoal} />
      )}
    </div>
  );
};

export default BusinessExecutionDashboard;
