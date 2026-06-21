import React, { useState } from 'react';
import { Shield, Users, Award, Lightbulb, Landmark, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import UserManagement from '../components/admin/UserManagement';
import MentorManagement from '../components/admin/MentorManagement';
import BusinessIdeaManagement from '../components/admin/BusinessIdeaManagement';
import SchemeManagement from '../components/admin/SchemeManagement';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const TABS = [
  { id: 'overview', label: 'System Overview', icon: BarChart3 },
  { id: 'users', label: 'User Directory', icon: Users },
  { id: 'mentors', label: 'Mentor Configuration', icon: Award },
  { id: 'ideas', label: 'Business Model Forge', icon: Lightbulb },
  { id: 'schemes', label: 'Schemes & Funding', icon: Landmark }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminAnalytics />;
      case 'users':
        return <UserManagement />;
      case 'mentors':
        return <MentorManagement />;
      case 'ideas':
        return <BusinessIdeaManagement />;
      case 'schemes':
        return <SchemeManagement />;
      default:
        return <AdminAnalytics />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back link */}
        <Link
          to="/dashboard"
          className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors space-x-1 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-[100px] -z-10" />
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-primary-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Platform Administration</span>
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 animate-fade-in">
                Admin Control Center
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Configure system configurations, manage registrations, curate funding grants, and track platform diagnostics.
          </p>
        </div>

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Navigation Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 space-y-1 shadow-sm lg:sticky lg:top-8">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3.5 block mb-2 font-outfit">Navigation Panels</span>
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center space-x-3 cursor-pointer ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/15'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Core Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {renderTabContent()}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
