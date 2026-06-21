import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, ArrowRight, HeartHandshake, Compass, BookOpen, Target, Users,
  Scissors, Paintbrush, Utensils, Hammer, Monitor, Home as HomeIcon, Sparkles
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const skills = [
    { name: 'Tailoring & Design', icon: Scissors, desc: 'Boutiques, sewing alterations, local apparel brands.', color: 'from-pink-500 to-rose-600' },
    { name: 'Handicrafts & Decor', icon: Paintbrush, desc: 'Eco-friendly crafts, pottery, souvenir art lines.', color: 'from-amber-500 to-orange-600' },
    { name: 'Food Prep & Catering', icon: Utensils, desc: 'Home bakeries, meal prepping, culinary catering.', color: 'from-emerald-500 to-teal-600' },
    { name: 'Repair Services', icon: Hammer, desc: 'Appliance repairs, carpentry, automotive tune-ups.', color: 'from-blue-500 to-indigo-600' },
    { name: 'Digital Freelancing', icon: Monitor, desc: 'Graphic design, editing, localized social marketing.', color: 'from-violet-500 to-purple-600' },
    { name: 'Home-Based Services', icon: HomeIcon, desc: 'Daycare setups, plant nurseries, house maintenance.', color: 'from-cyan-500 to-blue-600' }
  ];

  const steps = [
    { title: 'Define Your Skills', desc: 'Catalog your unique strengths and resources.', icon: Compass },
    { title: 'Match Opportunities', desc: 'Review curated micro-business concepts aligned with your skills.', icon: Target },
    { title: 'Follow the Roadmap', desc: 'Complete step-by-step milestones (licensing, sourcing, launching).', icon: BookOpen },
    { title: 'Get Mentor Guidance', desc: 'Connect with expert trainers to audit your progress.', icon: Users }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-secondary-500/10 rounded-full blur-[120px] -z-10"></div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:text-left lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 px-3 py-1 rounded-full text-primary-700 text-xs font-semibold animate-fade-in shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>Sprint 1 Enabled • Authentication Sandbox</span>
            </div>
            <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Transform Your <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-500 bg-clip-text text-transparent">Practical Skills</span> Into a Micro-Business
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              EntreSkill Hub gives you structured step-by-step startup roadmaps, tailored resources, and mentor matching to build a sustainable independent income from what you already know how to do.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-200 transition-all duration-200 flex items-center justify-center space-x-2 hover:-translate-y-0.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg shadow-primary-200 transition-all duration-200 flex items-center justify-center space-x-2 hover:-translate-y-0.5"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium shadow-sm transition-all duration-200 flex items-center justify-center"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Visual Panel (Glass Card Mockup) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md p-6 rounded-3xl dark-glass text-slate-100 shadow-2xl relative border border-slate-700 flex flex-col justify-between h-[380px] overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[80px] opacity-35 -z-10 group-hover:opacity-50 transition-opacity"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="bg-slate-800 p-2.5 rounded-2xl border border-slate-700 shadow-inner">
                    <Rocket className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className="text-xs bg-primary-500/20 text-primary-300 border border-primary-500/30 px-2.5 py-1 rounded-full font-semibold">
                    New Venture
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-outfit text-xl font-bold">Boutique Tailoring Setup</h3>
                  <p className="text-xs text-slate-400">Launch a home-based apparel alterations shop</p>
                </div>

                {/* Progress bar mock */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">Launch Roadmap</span>
                    <span className="text-primary-400">60% Complete</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="w-[60%] h-full bg-gradient-to-r from-primary-400 to-secondary-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Steps checklist mock */}
              <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded bg-primary-500/20 border border-primary-500 text-primary-400 flex items-center justify-center font-bold">✓</div>
                  <span>Buy primary sewing machine</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded bg-primary-500/20 border border-primary-500 text-primary-400 flex items-center justify-center font-bold">✓</div>
                  <span>Source locally recycled fabric samples</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center"></div>
                  <span>Create simple pricing catalog</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Skills Section */}
      <section className="bg-white border-y border-slate-100 py-20" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-slate-900">
            What Skills Do You Bring?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            We help you configure custom business routes depending on what practical expertise you currently possess.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
            {skills.map((skill, index) => {
              const IconComponent = skill.icon;
              return (
                <div 
                  key={index} 
                  className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 text-left group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${skill.color} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-outfit text-lg font-bold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {skill.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps Flow (How it works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4" id="about">
        <h2 className="font-outfit text-3xl sm:text-4xl font-extrabold text-slate-900">
          How EntreSkill Hub Works
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
          Our four-stage process is tailored to take absolute beginners from skill discovery to launch.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-12 relative">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="relative space-y-4 p-4 rounded-xl text-center group">
                <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-xs font-semibold text-secondary-500 tracking-wider uppercase">
                  Step {index + 1}
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Partner Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex p-3 bg-primary-600/50 rounded-2xl border border-primary-500/30">
            <HeartHandshake className="w-8 h-8 text-primary-300" />
          </div>
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold">
            Are You an Experienced Mentor or Trainer?
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Support local micro-entrepreneurs by volunteering your knowledge in marketing, finance, licensing, or hands-on trades. Partner with us to make a difference.
          </p>
          <div className="pt-2">
            <Link
              to="/register?role=mentor"
              className="inline-flex px-8 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-white font-medium rounded-xl shadow-lg shadow-secondary-900/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              Apply as a Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
