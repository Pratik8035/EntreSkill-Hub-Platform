import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, Compass, User, Mail, Shield, CheckCircle2, AlertTriangle, 
  MapPin, Phone, FileText, Plus, Check, Award, Layout, BookOpen, Target, Settings, MessageSquare, Landmark, Network
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState(user?.profile?.skills || ['tailoring', 'handicrafts']);
  const [newSkill, setNewSkill] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim().toLowerCase())) {
      const updated = [...skills, newSkill.trim().toLowerCase()];
      setSkills(updated);
      setNewSkill('');
      setSuccessMsg('Skill added locally! (Will sync in Sprint 2)');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-slate-50 dark:bg-transparent py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Header Profile Banner */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px] -z-10"></div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-2xl font-outfit shadow-md shadow-primary-500/20">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Hello, {user.name}
                </h1>
                <span className="bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                Welcome back to your workspace. Let's see your startup development.
              </p>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex-1 md:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/10 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Control Center</span>
              </Link>
            )}
            <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-1.5 cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Dashboards Sections by Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Profile info (4 Cols on large) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Account Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm">
                  <User className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">Full Name</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{user.name}</span>
                  </div>
                </div>
 
                <div className="flex items-start space-x-3 text-sm">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">Email Address</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <Shield className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block">Security Status</span>
                    <span className="text-emerald-600 font-semibold flex items-center space-x-1 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 mr-0.5" />
                      <span>Authenticated Session</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entrepreneur Skill Management (Only for user role) */}
            {user.role === 'user' && (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">Your Skills Inventory</h2>
                  <p className="text-xs text-slate-500">List what trades, talents, or facilities you own.</p>
                </div>

                {successMsg && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-lg text-xs flex items-center space-x-1.5">
                    <Check className="w-4 h-4" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1"
                      >
                        <span className="capitalize">{skill}</span>
                        <button 
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-rose-500 font-bold ml-1 text-slate-400 hover:text-rose-450"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No skills added yet.</span>
                  )}
                </div>

                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Baking, Sewing"
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Action modules (8 Cols on large) */}
          <div className="lg:col-span-8 space-y-6">
                        {/* ROLE: Entrepreneur (User) */}
            {user.role === 'user' && (
              <div className="space-y-6">
                {/* Visual Roadmap overview */}
                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current Startup Goal</span>
                      <h3 className="font-outfit text-xl font-bold text-slate-900 dark:text-white">Boutique Tailoring & Alterations</h3>
                    </div>
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50 text-xs font-bold px-3 py-1 rounded-full">
                      Sprint 2 Roadmap Preview
                    </span>
                  </div>
 
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Progress Checklist</span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">3 of 5 Steps (60%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="w-[60%] h-full bg-primary-500 rounded-full"></div>
                    </div>
                  </div>
 
                  {/* Checklist */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 text-sm">
                    <div className="py-3 flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs">✓</div>
                      <span>Identify primary skills & workspace</span>
                    </div>
                    <div className="py-3 flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs">✓</div>
                      <span>Write standard service pricing menu</span>
                    </div>
                    <div className="py-3 flex items-center space-x-3 text-slate-800 dark:text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-xs">✓</div>
                      <span>Connect with a Mentor / Trainer</span>
                    </div>
                    <div className="py-3 flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                      <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"></div>
                      <span>Source sewing tools & equipment locally</span>
                    </div>
                    <div className="py-3 flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                      <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"></div>
                      <span>Register local micro-business status</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link to="/recommendations" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">Business Recommendations</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Explore startup business ideas generated based on your skills assessment and interests.
                    </p>
                  </Link>
                  <Link to="/mentors" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">Mentor Directory</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Browse recommended trainers and request one-on-one guidance for your startup journey.
                    </p>
                  </Link>
                  <Link to="/analytics" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Layout className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">Analytics Dashboard</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Track profile completion, skills, recommendations, and mentor engagement.
                    </p>
                  </Link>
                  <Link to="/ai-mentor" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">AI Mentor Workspace</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Consult with our interactive AI Mentor assistant about business plans, licenses, or marketing.
                    </p>
                  </Link>
                  <Link to="/schemes" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">Schemes & Funding</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Discover public grants, subsidies, and credit funding options suitable for your business.
                    </p>
                  </Link>
                  <Link to="/networking" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3 hover:shadow-md transition-all group block">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-950/40 text-secondary-600 dark:text-secondary-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Network className="w-5 h-5" />
                    </div>
                    <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">Networking Hub</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Connect with entrepreneurs and mentors. Propose business collaborations and grow your network.
                    </p>
                  </Link>
                </div>
              </div>
            )}
 
            {/* ROLE: Mentor / Trainer */}
            {user.role === 'mentor' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">Mentor Verification Status</h3>
                    <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Pending Verification
                    </span>
                  </div>
 
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                      Welcome to EntreSkill Hub! Mentor registrations require manual verification by our administrators. Once your application is reviewed, you will receive email access to match with emerging entrepreneurs.
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="divide-y divide-slate-100 pt-2 text-sm text-slate-700">
                    <div className="py-3 flex justify-between items-center">
                      <span className="font-medium">1. Account signup created</span>
                      <span className="text-xs text-emerald-600 font-semibold">Complete</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="font-medium">2. Admin profile review</span>
                      <span className="text-xs text-amber-600 font-semibold">Under Review</span>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <span className="font-medium text-slate-400">3. Connect with first mentee</span>
                      <span className="text-xs text-slate-400">Locked</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white">Expertise Profile Catalog</h3>
                  <p className="text-xs text-slate-500">Provide topics you want to guide: Business licensing, accounting, food safety, sewing techniques.</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-secondary-50 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-300 border border-secondary-100 dark:border-secondary-900/55 text-xs px-2.5 py-1 rounded-lg font-semibold">Tailoring</span>
                    <span className="bg-secondary-50 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-300 border border-secondary-100 dark:border-secondary-900/55 text-xs px-2.5 py-1 rounded-lg font-semibold">Local Marketing</span>
                  </div>
                </div>
              </div>
            )}

            {/* ROLE: System Admin */}
            {user.role === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">Platform Verification Overview</h3>
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-rose-600/10 cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Open Admin Control Center</span>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-2xl font-extrabold text-primary-700 dark:text-primary-400 block">12</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Active Users</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-2xl font-extrabold text-secondary-700 dark:text-secondary-400 block">3</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Pending Mentors</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300 block">24</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Roadmaps Runs</span>
                    </div>
                  </div>
 
                  {/* Checklist */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium block text-slate-800 dark:text-slate-200">Johnathan Mentor (Apparel Trade)</span>
                        <span className="text-xs text-slate-450">johnathan@design.com</span>
                      </div>
                      <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 cursor-pointer">
                        Verify Mentor
                      </button>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <div>
                        <span className="font-medium block text-slate-800 dark:text-slate-200">Sarah Baker (Food Preparation)</span>
                        <span className="text-xs text-slate-450">sarah@bakery.com</span>
                      </div>
                      <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 cursor-pointer">
                        Verify Mentor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
