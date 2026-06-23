// src/components/ai/ContextPanel.jsx
// Displays the AI session context — profile, business info, recommendations, mentors, resources

import React from 'react';
import {
  BrainCircuit,
  User,
  Briefcase,
  Lightbulb,
  Users,
  BookOpen,
  TrendingUp,
  IndianRupee,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  GraduationCap,
  Zap,
} from 'lucide-react';
import ContextPanelSkeleton from './ContextPanelSkeleton';

// ─── Reusable Section Wrapper ──────────────────────────────────────────────────
const Section = ({ icon: Icon, title, iconColor = 'text-primary-600', children }) => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
    <div className="flex items-center space-x-2">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color = 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300' }) => (
  <div className={`rounded-xl px-3 py-2 ${color}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
    <p className="text-sm font-bold mt-0.5">{value ?? '—'}</p>
  </div>
);

// ─── Tag Chip ──────────────────────────────────────────────────────────────────
const Tag = ({ label }) => (
  <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
    {label}
  </span>
);

// ─── Empty placeholder ─────────────────────────────────────────────────────────
const Empty = ({ message }) => (
  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">{message}</p>
);

// ─── Risk badge helper ─────────────────────────────────────────────────────────
const riskColor = (score) => {
  if (score === null || score === undefined) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  if (score <= 3) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400';
  if (score <= 6) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
  return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400';
};

const riskLabel = (score) => {
  if (score === null || score === undefined) return 'N/A';
  if (score <= 3) return `${score} — Low`;
  if (score <= 6) return `${score} — Medium`;
  return `${score} — High`;
};

// ─── Format currency range ─────────────────────────────────────────────────────
const formatCurrency = (val) => {
  if (!val && val !== 0) return null;
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

// ─── Error panel ───────────────────────────────────────────────────────────────
const ContextError = ({ error, onRetry }) => {
  const isAuth = error.status === 401 || error.status === 403;
  return (
    <div className="p-4 flex flex-col items-center justify-center space-y-3 h-full min-h-[200px] text-center">
      <AlertCircle className={`w-8 h-8 ${isAuth ? 'text-amber-500' : 'text-rose-500'}`} />
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {isAuth ? 'Access Denied' : 'Context Unavailable'}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[180px] leading-relaxed">
        {error.message}
      </p>
      {!isAuth && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

// ─── Main ContextPanel ─────────────────────────────────────────────────────────
const ContextPanel = ({ sessionId, context, loading, error, onRefetch }) => {
  if (!sessionId) {
    return (
      <div className="p-4 flex flex-col items-center justify-center space-y-2 h-full min-h-[200px] text-center">
        <BrainCircuit className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Select a session to view context
        </p>
      </div>
    );
  }

  if (loading) return <ContextPanelSkeleton />;

  if (error) return <ContextError error={error} onRetry={onRefetch} />;

  if (!context) return null;

  // Server returns a flat contextSnapshot — map to local variables
  const experienceLevel = context.experienceLevel ?? null;
  const assessmentScore = context.assessmentScore ?? null;
  const skills          = context.skills          ?? [];
  const interests       = context.interests       ?? [];

  // Business idea fields
  const ideaTitle        = context.businessIdeaName     ?? null;
  const ideaDesc         = context.executiveSummary     ?? null;
  const riskScore        = context.riskScore            ?? null;
  const missingSkills    = context.missingSkillNames    ?? [];
  // startupCostRange comes as a string from server ("50000-200000" or null)
  const startupCostRaw   = context.startupCostRange     ?? null;

  // Recommendations — roadmap milestones as steps, topRecommendations as schemes
  const roadmap  = context.milestoneCount > 0
    ? Array.from({ length: context.milestoneCount }, (_, i) => `Milestone ${i + 1}`)
    : [];
  const schemes  = context.topRecommendations ?? [];

  // Mentors and resources
  const mentors          = context.topMentors       ?? [];
  const learningResources = context.resources       ?? [];

  // ── Profile Section ────────────────────────────────────────────────────────
  const renderProfile = () => (
    <Section icon={User} title="Profile" iconColor="text-violet-600 dark:text-violet-400">
      <div className="grid grid-cols-2 gap-2">
        <StatPill
          label="Experience"
          value={experienceLevel ? experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1) : '—'}
          color="bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"
        />
        <StatPill
          label="Assessment"
          value={assessmentScore != null ? `${assessmentScore}%` : '—'}
          color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
        />
      </div>

      {/* Skills */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          Skills
        </p>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s, i) => (
              <Tag key={i} label={typeof s === 'object' ? s.name || s.skill || JSON.stringify(s) : s} />
            ))}
          </div>
        ) : (
          <Empty message="No skills recorded" />
        )}
      </div>

      {/* Interests */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
          Interests
        </p>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {interests.map((interest, i) => (
              <Tag key={i} label={typeof interest === 'object' ? interest.name || interest.interest || JSON.stringify(interest) : interest} />
            ))}
          </div>
        ) : (
          <Empty message="No interests recorded" />
        )}
      </div>
    </Section>
  );

  // ── Business Context Section ───────────────────────────────────────────────
  const renderBusinessContext = () => (
    <Section icon={Briefcase} title="Business Context" iconColor="text-amber-600 dark:text-amber-400">
      {ideaTitle ? (
        <>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
              {ideaTitle}
            </p>
            {ideaDesc && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                {ideaDesc}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Startup cost */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 flex items-start space-x-2">
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Startup Cost
                </p>
                {startupCostRaw ? (
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {startupCostRaw}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">Not set</p>
                )}
              </div>
            </div>

            {/* Risk score */}
            <div className={`rounded-xl p-2.5 flex items-start space-x-2 ${riskColor(riskScore)}`}>
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Risk Score</p>
                <p className="text-xs font-bold mt-0.5">{riskLabel(riskScore)}</p>
              </div>
            </div>
          </div>

          {/* Missing skills */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Missing Skills
            </p>
            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-block bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                  >
                    {typeof s === 'object' ? s.name || s.skill || JSON.stringify(s) : s}
                  </span>
                ))}
              </div>
            ) : (
              <Empty message="No skill gaps identified" />
            )}
          </div>
        </>
      ) : (
        <Empty message="No business idea linked to this session" />
      )}
    </Section>
  );

  // ── Recommendations Section ────────────────────────────────────────────────
  const renderRecommendations = () => (
    <Section icon={Lightbulb} title="Recommendations" iconColor="text-emerald-600 dark:text-emerald-400">
      {/* Roadmap */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center space-x-1">
          <TrendingUp className="w-3 h-3" />
          <span>Roadmap Steps</span>
        </p>
        {roadmap.length > 0 ? (
          <ul className="space-y-1.5">
            {roadmap.slice(0, 4).map((step, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed line-clamp-2">
                  {typeof step === 'object' ? step.title || step.step || step.description || JSON.stringify(step) : step}
                </span>
              </li>
            ))}
            {roadmap.length > 4 && (
              <li className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold flex items-center space-x-1">
                <ChevronRight className="w-3 h-3" />
                <span>+{roadmap.length - 4} more steps</span>
              </li>
            )}
          </ul>
        ) : (
          <Empty message="No roadmap found" />
        )}
      </div>

      {/* Schemes */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center space-x-1">
          <Star className="w-3 h-3" />
          <span>Matched Schemes</span>
        </p>
        {schemes.length > 0 ? (
          <ul className="space-y-1.5">
            {schemes.slice(0, 3).map((scheme, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                    {typeof scheme === 'object' ? scheme.name ?? 'Recommendation' : scheme}
                  </span>
                </div>
                {scheme.matchScore != null && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-2 shrink-0">
                    {scheme.matchScore}%
                  </span>
                )}
              </li>
            ))}
            {schemes.length > 3 && (
              <li className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold flex items-center space-x-1 pl-1">
                <ChevronRight className="w-3 h-3" />
                <span>+{schemes.length - 3} more schemes</span>
              </li>
            )}
          </ul>
        ) : (
          <Empty message="No recommendations available" />
        )}
      </div>
    </Section>
  );

  // ── Mentors Section ────────────────────────────────────────────────────────
  const renderMentors = () => (
    <Section icon={Users} title="Mentors" iconColor="text-sky-600 dark:text-sky-400">
      {mentors.length > 0 ? (
        <ul className="space-y-2">
          {mentors.slice(0, 3).map((mentor, i) => {
            // Server shape: { expertise: string[], industries: string[], matchScore: number }
            const expertiseList = Array.isArray(mentor.expertise) ? mentor.expertise : [];
            const name = expertiseList.length > 0 ? expertiseList[0] : 'Mentor';
            const subtitle = expertiseList.slice(1).join(', ') || (mentor.industries?.[0] ?? null);
            const initials = name.slice(0, 2).toUpperCase();

            return (
              <li key={i} className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-primary-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                  {subtitle && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>
                  )}
                  {mentor.matchScore != null && (
                    <p className="text-[10px] text-primary-500 dark:text-primary-400 font-semibold">{mentor.matchScore}% match</p>
                  )}
                </div>
              </li>
            );
          })}
          {mentors.length > 3 && (
            <li className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold flex items-center space-x-1">
              <ChevronRight className="w-3 h-3" />
              <span>+{mentors.length - 3} more mentors</span>
            </li>
          )}
        </ul>
      ) : (
        <Empty message="No mentors available" />
      )}
    </Section>
  );

  // ── Learning Resources Section ─────────────────────────────────────────────
  const renderResources = () => (
    <Section icon={BookOpen} title="Learning Resources" iconColor="text-teal-600 dark:text-teal-400">
      {learningResources.length > 0 ? (
        <ul className="space-y-1.5">
          {learningResources.slice(0, 4).map((resource, i) => {
            const title = typeof resource === 'object'
              ? resource.title || resource.name || resource.topic || 'Resource'
              : resource;
            const type = typeof resource === 'object'
              ? resource.type || resource.format || null
              : null;

            return (
              <li
                key={i}
                className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2"
              >
                <GraduationCap className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{title}</p>
                  {type && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{type}</p>
                  )}
                </div>
              </li>
            );
          })}
          {learningResources.length > 4 && (
            <li className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold flex items-center space-x-1 pl-1">
              <ChevronRight className="w-3 h-3" />
              <span>+{learningResources.length - 4} more resources</span>
            </li>
          )}
        </ul>
      ) : (
        <Empty message="No learning resources available" />
      )}
    </Section>
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {/* Panel header */}
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Session Context
        </h2>
        <button
          onClick={onRefetch}
          className="ml-auto p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="Refresh context"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {renderProfile()}
      {renderBusinessContext()}
      {renderRecommendations()}
      {renderMentors()}
      {renderResources()}
    </div>
  );
};

export default ContextPanel;
