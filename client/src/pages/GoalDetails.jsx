import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, Calendar, Flag, Edit2, CheckCircle2,
  Plus, RefreshCw, AlertCircle, TrendingUp, Circle,
} from 'lucide-react';
import useGoalDetails from '../hooks/useGoalDetails';
import MilestoneCard from '../components/execution/MilestoneCard';
import businessExecutionService from '../services/businessExecutionService';
import toast from 'react-hot-toast';

// ─── Skeletons ────────────────────────────────────────────────────────────────
const Sk = ({ w = 'w-full', h = 'h-4' }) => (
  <div className={`${w} ${h} bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse`} />
);

const MilestoneSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
    <div className="flex space-x-3">
      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-2"><Sk w="w-2/3" /><Sk w="w-1/3" h="h-3" /></div>
    </div>
    <Sk h="h-2" />
  </div>
);

// ─── Edit Goal Modal ──────────────────────────────────────────────────────────
const EditGoalModal = ({ goal, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       goal.title       || '',
    description: goal.description || '',
    targetDate:  goal.targetDate  ? goal.targetDate.slice(0, 10) : '',
    priority:    goal.priority    || 'Medium',
    status:      goal.status      || 'Not Started',
  });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10">
        <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">Edit Goal</h2>
        <form onSubmit={submit} className="space-y-3">
          <input name="title" value={form.title} onChange={handle} placeholder="Goal title *" required
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <textarea name="description" value={form.description} onChange={handle} placeholder="Description" rows={2}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100 resize-none" />
          <input name="targetDate" type="date" value={form.targetDate} onChange={handle}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <div className="grid grid-cols-2 gap-2">
            <select name="priority" value={form.priority} onChange={handle}
              className="text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none text-slate-800 dark:text-slate-100">
              {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
            </select>
            <select name="status" value={form.status} onChange={handle}
              className="text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none text-slate-800 dark:text-slate-100">
              {['Not Started', 'In Progress', 'Completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex space-x-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold cursor-pointer disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save Changes'}
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

// ─── Create Milestone Modal ───────────────────────────────────────────────────
const CreateMilestoneModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.targetDate) return;
    setSaving(true);
    try { await onCreate(form); onClose(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to add milestone'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 z-10">
        <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">Add Milestone</h2>
        <form onSubmit={submit} className="space-y-3">
          <input name="title" value={form.title} onChange={handle} placeholder="Milestone title *" required
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <textarea name="description" value={form.description} onChange={handle} placeholder="Description (optional)" rows={2}
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100 resize-none" />
          <input name="targetDate" type="date" value={form.targetDate} onChange={handle} required
            className="w-full text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-500 text-slate-800 dark:text-slate-100" />
          <div className="flex space-x-2 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold cursor-pointer disabled:opacity-60 transition-colors">
              {saving ? 'Adding…' : 'Add Milestone'}
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

// ─── Main Page ────────────────────────────────────────────────────────────────
const GoalDetails = () => {
  const { goalId } = useParams();
  const navigate   = useNavigate();

  const {
    goal, milestones, progress, tasks, loading, error, refetch,
    fetchTasksForMilestone,
    createMilestone, completeMilestone,
    createTask, completeTask,
  } = useGoalDetails(goalId);

  const [showEdit, setShowEdit]               = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [loadingTasks, setLoadingTasks]         = useState({});

  // ── Goal update ────────────────────────────────────────────────────────────
  const handleUpdateGoal = async (data) => {
    await businessExecutionService.updateGoal(goalId, data);
    toast.success('Goal updated');
    refetch();
  };

  // ── Expand milestone — lazy-load tasks ────────────────────────────────────
  const handleExpandMilestone = async (milestoneId) => {
    if (tasks[milestoneId]) return; // already loaded
    setLoadingTasks((p) => ({ ...p, [milestoneId]: true }));
    await fetchTasksForMilestone(milestoneId);
    setLoadingTasks((p) => ({ ...p, [milestoneId]: false }));
  };

  // ── Status colour ─────────────────────────────────────────────────────────
  const statusColor = {
    'Not Started': 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    'In Progress':  'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    'Completed':    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  };

  const priorityColor = {
    High:   'text-rose-600 dark:text-rose-400',
    Medium: 'text-amber-600 dark:text-amber-400',
    Low:    'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <Link to="/business-execution"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /><span>Business Execution</span>
        </Link>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && !loading && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-5 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* ── Goal Header ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-4 animate-pulse">
            <div className="flex space-x-3"><div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" /><div className="flex-1 space-y-2 pt-1"><Sk w="w-1/2" h="h-5" /><Sk w="w-1/3" /></div></div>
            <Sk /><Sk w="w-3/4" />
          </div>
        ) : goal ? (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-outfit text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{goal.title}</h1>
                  {goal.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{goal.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button onClick={() => refetch()} disabled={loading}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors cursor-pointer" aria-label="Refresh">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setShowEdit(true)}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Edit</span>
                </button>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[goal.status] || statusColor['Not Started']}`}>
                {goal.status}
              </span>
              <span className={`flex items-center space-x-1 text-xs font-semibold ${priorityColor[goal.priority] || priorityColor.Medium}`}>
                <Flag className="w-3 h-3" /><span>{goal.priority} Priority</span>
              </span>
              {goal.targetDate && (
                <span className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>Due {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </span>
              )}
            </div>

            {/* Progress bar */}
            {progress != null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5" /><span>Progress</span>
                  </span>
                  <span className="text-primary-600 dark:text-primary-400">{progress.progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progress.progress >= 100 ? 'bg-emerald-500' : 'bg-primary-500'}`}
                    style={{ width: `${progress.progress}%` }}
                    role="progressbar" aria-valuenow={progress.progress} aria-valuemin={0} aria-valuemax={100}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  {progress.completedTasks} of {progress.totalTasks} tasks completed
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* ── Milestones ────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Milestones {!loading && milestones.length > 0 && `(${milestones.length})`}
            </h2>
            {goal && (
              <button onClick={() => setShowAddMilestone(true)}
                className="flex items-center space-x-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                <Plus className="w-3.5 h-3.5" /><span>Add Milestone</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <MilestoneSkeleton key={i} />)}
            </div>
          ) : milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((ms) => (
                <MilestoneCard
                  key={ms._id}
                  milestone={ms}
                  tasks={tasks[ms._id] || []}
                  loadingTasks={loadingTasks[ms._id]}
                  onComplete={completeMilestone}
                  onCreateTask={createTask}
                  onCompleteTask={completeTask}
                  onExpand={() => handleExpandMilestone(ms._id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Circle className="w-9 h-9 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No milestones yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Break this goal into milestones to track progress.</p>
              {goal && (
                <button onClick={() => setShowAddMilestone(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
                  <Plus className="w-3.5 h-3.5" /><span>Add Milestone</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showEdit && goal && (
        <EditGoalModal goal={goal} onClose={() => setShowEdit(false)} onSave={handleUpdateGoal} />
      )}
      {showAddMilestone && (
        <CreateMilestoneModal onClose={() => setShowAddMilestone(false)} onCreate={createMilestone} />
      )}
    </div>
  );
};

export default GoalDetails;
