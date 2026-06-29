import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Users, BookOpen, Award, Lightbulb, Landmark,
  Target, Bell, TrendingUp, CheckCircle, BarChart2, PieChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const StatCard = ({ label, value, icon: Icon, color, bg, subLabel }) => (
  <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex flex-col items-center text-center space-y-2`}>
    <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className={`font-outfit text-2xl font-extrabold ${color}`}>{value ?? '—'}</div>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
    {subLabel && <div className="text-[10px] text-slate-400">{subLabel}</div>}
  </div>
);

const ProgressBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
        <span>{label}</span>
        <span>{value} ({pct}%)</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, dashboardRes] = await Promise.all([
        adminService.getEnhancedAnalytics(),
        adminService.getDashboardStats(),
      ]);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (dashboardRes.success) setDashboard(dashboardRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading && !analytics) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-slate-500 text-sm">Aggregating platform analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div>
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">Enhanced Platform Analytics</h3>
          <p className="text-xs text-slate-400">Multi-domain breakdowns: users, learning, business, funding, execution</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-2xl text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Growth Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={dashboard.totalUsers} icon={Users} color="text-primary-600" bg="bg-primary-50 dark:bg-primary-950/20" />
          <StatCard label="Active (Verified)" value={dashboard.activeUsers} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/20" />
          <StatCard
            label="Weekly Growth"
            value={`${dashboard.weeklyGrowth?.newUsers ?? 0} new`}
            icon={TrendingUp}
            color={dashboard.weeklyGrowth?.growthPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}
            bg={dashboard.weeklyGrowth?.growthPercent >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
            subLabel={`${dashboard.weeklyGrowth?.growthPercent >= 0 ? '+' : ''}${dashboard.weeklyGrowth?.growthPercent ?? 0}% vs prev. week`}
          />
          <StatCard
            label="Monthly Growth"
            value={`${dashboard.monthlyGrowth?.newUsers ?? 0} new`}
            icon={BarChart2}
            color={dashboard.monthlyGrowth?.growthPercent >= 0 ? 'text-sky-600' : 'text-rose-600'}
            bg={dashboard.monthlyGrowth?.growthPercent >= 0 ? 'bg-sky-50' : 'bg-rose-50'}
            subLabel={`${dashboard.monthlyGrowth?.growthPercent >= 0 ? '+' : ''}${dashboard.monthlyGrowth?.growthPercent ?? 0}% vs prev. month`}
          />
        </div>
      )}

      {analytics && (
        <>
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Courses" value={analytics.learningAnalytics?.totalCourses} icon={BookOpen} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-950/20" />
            <StatCard label="Certificates" value={analytics.learningAnalytics?.totalCertificates} icon={Award} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950/20" />
            <StatCard label="Business Ideas" value={analytics.businessAnalytics?.totalBusinessIdeas} icon={Lightbulb} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950/20" />
            <StatCard label="Goals" value={analytics.businessAnalytics?.totalGoals} icon={Target} color="text-rose-600" bg="bg-rose-50 dark:bg-rose-950/20" />
            <StatCard label="Schemes" value={analytics.fundingAnalytics?.totalSchemes} icon={Landmark} color="text-sky-600" bg="bg-sky-50 dark:bg-sky-950/20" />
            <StatCard label="Notifications" value={analytics.executionAnalytics?.totalNotifications} icon={Bell} color="text-violet-600" bg="bg-violet-50 dark:bg-violet-950/20" />
          </div>

          {/* Detail Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* User Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span>User Analytics</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Registration, verification and role distribution</p>
              </div>
              <div className="space-y-3">
                {analytics.userAnalytics?.usersByRole?.map((item) => {
                  const label = item._id === 'admin' ? 'Administrators' : item._id === 'mentor' ? 'Mentors' : 'Entrepreneurs';
                  const color = item._id === 'admin' ? 'bg-rose-500' : item._id === 'mentor' ? 'bg-amber-500' : 'bg-primary-500';
                  return (
                    <ProgressBar key={item._id} label={label} value={item.count} total={analytics.userAnalytics.totalUsers} color={color} />
                  );
                })}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Verification Rate</span>
                  <span className="font-bold text-emerald-600">{analytics.userAnalytics?.verificationRate ?? 0}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">New This Month</span>
                  <span className="font-bold text-primary-600">{analytics.userAnalytics?.newUsersThisMonth ?? 0} users</span>
                </div>
              </div>
            </div>

            {/* Learning Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Learning Analytics</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Courses, enrollments, completions and quiz performance</p>
              </div>
              <div className="space-y-3">
                <ProgressBar
                  label="Published Courses"
                  value={analytics.learningAnalytics?.publishedCourses}
                  total={analytics.learningAnalytics?.totalCourses}
                  color="bg-emerald-500"
                />
                <ProgressBar
                  label="Completed Enrollments"
                  value={analytics.learningAnalytics?.completedEnrollments}
                  total={analytics.learningAnalytics?.totalEnrollments || 1}
                  color="bg-indigo-500"
                />
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Completion Rate</span>
                    <span className="font-bold text-indigo-600">{analytics.learningAnalytics?.learningCompletionRate ?? 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Avg Quiz Score</span>
                    <span className="font-bold text-amber-600">{analytics.learningAnalytics?.avgQuizScore ?? 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Quiz Attempts</span>
                    <span className="font-bold text-slate-600">{analytics.learningAnalytics?.totalQuizAttempts ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-rose-500" />
                  <span>Business Analytics</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Goal progress and business idea distribution</p>
              </div>
              <div className="space-y-3">
                {analytics.businessAnalytics?.goalsByStatus?.map((item) => {
                  const colorMap = { 'Completed': 'bg-emerald-500', 'In Progress': 'bg-amber-500', 'Not Started': 'bg-slate-400' };
                  return (
                    <ProgressBar
                      key={item._id}
                      label={item._id}
                      value={item.count}
                      total={analytics.businessAnalytics.totalGoals || 1}
                      color={colorMap[item._id] || 'bg-slate-400'}
                    />
                  );
                })}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Total Business Ideas</span>
                  <span className="font-bold text-emerald-600">{analytics.businessAnalytics?.totalBusinessIdeas ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Funding Analytics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Landmark className="w-4 h-4 text-sky-500" />
                  <span>Funding Analytics</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Government schemes and commercial funding breakdown</p>
              </div>
              <div className="space-y-3">
                {analytics.fundingAnalytics?.schemesByCategory?.slice(0, 5).map((item) => (
                  <ProgressBar
                    key={item._id || 'other'}
                    label={item._id || 'Uncategorised'}
                    value={item.count}
                    total={analytics.fundingAnalytics.totalSchemes || 1}
                    color="bg-sky-500"
                  />
                ))}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Total Funding Programs</span>
                  <span className="font-bold text-sky-600">{analytics.fundingAnalytics?.totalFundingPrograms ?? 0}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
