import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="min-h-[40vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
    <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm">
      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
      <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {message && <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  </div>
);

export default ErrorState;
