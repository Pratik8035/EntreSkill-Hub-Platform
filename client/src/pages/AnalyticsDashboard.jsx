import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import analyticsService from '../services/analyticsService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  BarChart3, Target, Award, Heart, Compass, Map, Send, TrendingUp, ArrowRight,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, suffix = '', accent = 'primary' }) => {
  const accents = {
    primary: 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accents[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
          {value}{suffix}
        </p>
      </div>
    </div>
  );
};

const ProgressBar = ({ label, value, color = 'bg-primary-500' }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs font-semibold">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-slate-800 dark:text-slate-200">{value}%</span>
    </div>
    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getDashboard();
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingState message="Loading your analytics..." />;

  if (error || !stats) {
    return (
      <ErrorState
        title="Analytics Unavailable"
        message={error}
        onRetry={fetchAnalytics}
      />
    );
  }

  const strengthLabel =
    stats.profileStrength >= 80 ? 'Strong' : stats.profileStrength >= 50 ? 'Growing' : 'Getting Started';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 dark:bg-primary-950/30 rounded-full blur-[80px] opacity-40 -z-10" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Track your profile growth and platform engagement.
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">Profile Strength</p>
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">{stats.profileStrength}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{strengthLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={Target} label="Profile Completion" value={stats.profileCompletion} suffix="%" accent="primary" />
          <StatCard icon={Award} label="Skills Added" value={stats.skillCount} accent="indigo" />
          <StatCard icon={Heart} label="Interests Set" value={stats.interestCount} accent="rose" />
          <StatCard icon={Compass} label="Recommendations" value={stats.recommendationsCount} accent="amber" />
          <StatCard icon={Map} label="Roadmaps Viewed" value={stats.roadmapsViewed} accent="indigo" />
          <StatCard icon={Send} label="Mentor Requests" value={stats.mentorRequests} accent="primary" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <span>Profile Breakdown</span>
            </h2>
            <ProgressBar label="Overall Completion" value={stats.profileCompletion} />
            <ProgressBar label="Skills Progress" value={stats.skillPct || 0} color="bg-indigo-500" />
            <ProgressBar label="Interests Progress" value={stats.interestPct || 0} color="bg-rose-500" />
            <ProgressBar label="Profile Strength Score" value={stats.profileStrength} color="bg-emerald-500" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100">Quick Actions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Boost your profile strength by completing assessments, exploring recommendations, and connecting with mentors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to="/assessment"
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between"
              >
                <span>Complete Assessment</span>
                <ArrowRight className="w-4 h-4 text-primary-500" />
              </Link>
              <Link
                to="/recommendations"
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between"
              >
                <span>View Recommendations</span>
                <ArrowRight className="w-4 h-4 text-primary-500" />
              </Link>
              <Link
                to="/mentors"
                className="px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-between"
              >
                <span>Find a Mentor</span>
                <ArrowRight className="w-4 h-4 text-primary-500" />
              </Link>
              <Link
                to="/ai-mentor"
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between"
              >
                <span>Ask AI Mentor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
