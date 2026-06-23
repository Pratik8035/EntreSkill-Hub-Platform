import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Landmark,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import useFundingAdvisor from '../hooks/useFundingAdvisor';
import FundingCard       from '../components/funding/FundingCard';
import FundingSummary    from '../components/funding/FundingSummary';
import EligibilityBadge  from '../components/funding/EligibilityBadge';

// ─── Section skeleton ──────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
    </div>
    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
    <div className="h-2 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full" />
  </div>
);

const GridSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
  </div>
);

// ─── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, iconColor = 'text-slate-400', title, message, action }) => (
  <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
    <Icon className={`w-10 h-10 mx-auto ${iconColor}`} aria-hidden="true" />
    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{title}</p>
    <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">{message}</p>
    {action}
  </div>
);

// ─── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon: Icon, iconColor = 'text-primary-600', title, count, children }) => (
  <section aria-labelledby={`section-${title.replace(/\s/g, '-').toLowerCase()}`}>
    <div className="flex items-center space-x-2 mb-4">
      <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />
      <h2
        id={`section-${title.replace(/\s/g, '-').toLowerCase()}`}
        className="text-sm font-bold text-slate-700 dark:text-slate-300"
      >
        {title}
      </h2>
      {count != null && (
        <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
    {children}
  </section>
);

// ─── Error panel ───────────────────────────────────────────────────────────────
const ErrorPanel = ({ error, onRetry }) => (
  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-6 text-center space-y-3">
    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" aria-hidden="true" />
    <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
      {error?.status === 401 || error?.status === 403 ? 'Access Denied' : 'Failed to Load'}
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{error?.message}</p>
    {error?.status !== 401 && error?.status !== 403 && (
      <button
        onClick={onRetry}
        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Retry</span>
      </button>
    )}
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const FundingDashboard = () => {
  const { data, loading, error, refetch } = useFundingAdvisor();
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'partial' | 'recommendations'

  const eligibility    = data?.eligibility    || null;
  const recommendations = data?.recommendations || null;
  const advisorSummary  = data?.advisorSummary  || null;

  const eligibleSchemes          = eligibility?.eligibleSchemes          || [];
  const partiallyEligibleSchemes = eligibility?.partiallyEligibleSchemes || [];
  const notEligibleSchemes       = eligibility?.notEligibleSchemes       || [];
  const topRecs                  = recommendations?.recommendations      || [];
  const totalMatches             = recommendations?.totalMatches         ?? 0;

  const tabs = [
    { id: 'eligible',        label: 'Eligible',        count: eligibleSchemes.length,          icon: CheckCircle2, color: 'emerald' },
    { id: 'partial',         label: 'Partial',          count: partiallyEligibleSchemes.length, icon: AlertCircle,  color: 'amber' },
    { id: 'recommendations', label: 'Recommendations',  count: topRecs.length,                  icon: TrendingUp,   color: 'primary' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Back link ─────────────────────────────────────────────────── */}
        <Link
          to="/schemes"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Schemes & Funding Hub</span>
        </Link>

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20">
              <Landmark className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                AI-Powered
              </span>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Funding Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {totalMatches > 0 && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {totalMatches} match{totalMatches !== 1 ? 'es' : ''} found
              </span>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Refresh funding dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        {error && <ErrorPanel error={error} onRetry={refetch} />}

        {/* ── AI Summary (always visible, uses its own loading) ──────────── */}
        {!error && (
          <FundingSummary
            summary={advisorSummary}
            loading={loading}
            onRefresh={refetch}
          />
        )}

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        {!error && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Eligible',     value: eligibleSchemes.length,          color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' },
              { label: 'Partial',      value: partiallyEligibleSchemes.length, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40' },
              { label: 'Recommended',  value: topRecs.length,                  color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/40' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`border rounded-2xl p-4 text-center ${bg}`}>
                <p className={`text-2xl font-extrabold font-outfit ${loading ? 'opacity-40 animate-pulse' : ''} ${color}`}>
                  {loading ? '—' : value}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        {!error && (
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 flex-1 min-w-[120px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {loading ? '…' : tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Tab content ───────────────────────────────────────────────── */}
        {!error && (
          <div role="tabpanel">
            {activeTab === 'eligible' && (
              <Section icon={CheckCircle2} iconColor="text-emerald-600 dark:text-emerald-400" title="Eligible Schemes & Programs" count={loading ? null : eligibleSchemes.length}>
                {loading ? (
                  <GridSkeleton />
                ) : eligibleSchemes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {eligibleSchemes.map((item, i) => (
                      <FundingCard key={item.schemeId || i} item={item} mode="eligibility" />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={CheckCircle2}
                    iconColor="text-slate-300 dark:text-slate-600"
                    title="No eligible schemes yet"
                    message="Complete your assessment and generate a business plan to unlock eligibility for government schemes."
                    action={
                      <Link
                        to="/assessment"
                        className="inline-block mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Complete Assessment
                      </Link>
                    }
                  />
                )}
              </Section>
            )}

            {activeTab === 'partial' && (
              <Section icon={AlertCircle} iconColor="text-amber-600 dark:text-amber-400" title="Partially Eligible Schemes" count={loading ? null : partiallyEligibleSchemes.length}>
                {loading ? (
                  <GridSkeleton />
                ) : partiallyEligibleSchemes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {partiallyEligibleSchemes.map((item, i) => (
                      <FundingCard key={item.schemeId || i} item={item} mode="eligibility" />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={AlertCircle}
                    iconColor="text-slate-300 dark:text-slate-600"
                    title="No partially eligible schemes"
                    message="You may already be fully eligible or need to add more profile information."
                  />
                )}
              </Section>
            )}

            {activeTab === 'recommendations' && (
              <Section icon={TrendingUp} iconColor="text-primary-600 dark:text-primary-400" title="Top Funding Recommendations" count={loading ? null : topRecs.length}>
                {loading ? (
                  <GridSkeleton />
                ) : topRecs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {topRecs.map((item, i) => (
                      <FundingCard key={item.schemeId || i} item={item} mode="recommendation" />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    iconColor="text-slate-300 dark:text-slate-600"
                    title="No recommendations available"
                    message="Add a business idea and complete your skills assessment to generate personalised funding recommendations."
                    action={
                      <Link
                        to="/recommendations"
                        className="inline-block mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Explore Business Ideas
                      </Link>
                    }
                  />
                )}
              </Section>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default FundingDashboard;
