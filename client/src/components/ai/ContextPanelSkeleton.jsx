// src/components/ai/ContextPanelSkeleton.jsx
// Skeleton loader displayed while context data is being fetched

import React from 'react';

const SkeletonLine = ({ width = 'w-full', height = 'h-3' }) => (
  <div className={`${width} ${height} bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse`} />
);

const SkeletonSection = ({ rows = 3, label = true }) => (
  <div className="space-y-2.5">
    {label && <SkeletonLine width="w-24" height="h-2.5" />}
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonLine key={i} width={i % 2 === 0 ? 'w-full' : 'w-4/5'} />
    ))}
  </div>
);

const ContextPanelSkeleton = () => {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <SkeletonLine width="w-28" height="h-4" />
      </div>

      {/* Profile section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <SkeletonLine width="w-16" height="h-2.5" />
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-3/4" />
            <SkeletonLine width="w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <SkeletonSection rows={2} label={true} />
      </div>

      {/* Business context section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <SkeletonLine width="w-28" height="h-2.5" />
        <SkeletonSection rows={3} label={false} />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Recommendations section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <SkeletonLine width="w-32" height="h-2.5" />
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Mentors section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <SkeletonLine width="w-20" height="h-2.5" />
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonLine width="w-3/4" />
              <SkeletonLine width="w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* Resources section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <SkeletonLine width="w-28" height="h-2.5" />
        {[1, 2].map((i) => (
          <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
};

export default ContextPanelSkeleton;
