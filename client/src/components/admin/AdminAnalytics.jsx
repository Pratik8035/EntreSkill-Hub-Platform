import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users, Shield, Award, Landmark, Lightbulb, Compass, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAdminAnalytics();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch platform metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading && !stats) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Aggregating platform metrics...</p>
        </div>
      </div>
    );
  }

  const getPercentage = (count, total) => {
    if (!total || !count) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header Row */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div>
          <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white">Platform System Health</h3>
          <p className="text-xs text-slate-400">Platform-wide aggregation and engagement breakdowns</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-2xl text-slate-650 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {stats && (
        <>
          {/* Top Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-primary-600', icon: Users, bg: 'bg-primary-50 dark:bg-primary-950/20' },
              { label: 'Total Mentors', value: stats.totalMentors, color: 'text-amber-600', icon: Award, bg: 'bg-amber-50 dark:bg-amber-950/20' },
              { label: 'Business Ideas', value: stats.totalIdeas, color: 'text-emerald-600', icon: Lightbulb, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
              { label: 'Gov Schemes', value: stats.totalSchemes, color: 'text-sky-600', icon: Landmark, bg: 'bg-sky-50 dark:bg-sky-950/20' },
              { label: 'Funding Programs', value: stats.totalFunding, color: 'text-indigo-600', icon: Compass, bg: 'bg-indigo-50 dark:bg-indigo-950/20' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-sm flex flex-col items-center text-center space-y-2 group hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className={`font-outfit text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Roles Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200">User Role Distribution</h4>
                <p className="text-[11px] text-slate-400">Ratio of system memberships (Admin, Mentors, Entrepreneurs)</p>
              </div>
              <div className="space-y-4">
                {stats.usersByRole?.map((item) => {
                  const label = item._id === 'admin' ? 'Administrator' : item._id === 'mentor' ? 'Industry Mentor' : 'Entrepreneur';
                  const pct = getPercentage(item.count, stats.totalUsers);
                  const color = item._id === 'admin' ? 'bg-rose-500' : item._id === 'mentor' ? 'bg-amber-500' : 'bg-primary-500';
                  
                  return (
                    <div key={item._id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                        <span>{label}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verification Status Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-855 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h4 className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-200">Account KYC Verification</h4>
                <p className="text-[11px] text-slate-400">Ratio of verified vs unverified platform registrations</p>
              </div>
              <div className="space-y-4">
                {stats.usersByVerified?.map((item) => {
                  const label = item._id ? 'Verified Members' : 'Pending Verification';
                  const pct = getPercentage(item.count, stats.totalUsers);
                  const color = item._id ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600';
                  
                  return (
                    <div key={item._id ? 'v' : 'uv'} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                        <span>{label}</span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
