import React from 'react';

const LoadingState = ({ message = 'Loading...' }) => (
  <div className="min-h-[40vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin dark:border-primary-900 dark:border-t-primary-400" />
      <p className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-medium">{message}</p>
    </div>
  </div>
);

export default LoadingState;
