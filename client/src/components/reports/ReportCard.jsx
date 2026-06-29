import React from 'react';
import { FileText, ArrowRight, Loader2 } from 'lucide-react';

/**
 * ReportCard — Sprint 9
 *
 * Props:
 *   report      {object}   — { type, label, description }
 *   onGenerate  {fn}       — called with report.type when generate button clicked
 *   loading     {boolean}  — true while this report is being fetched
 *   active      {boolean}  — true when this report is currently active
 */
const ReportCard = ({ report, onGenerate, loading = false, active = false }) => (
  <div
    className={`bg-white dark:bg-slate-900/40 border rounded-2xl p-4 flex flex-col gap-2 transition-all ${
      active
        ? 'border-primary-400 dark:border-primary-600 ring-1 ring-primary-200 dark:ring-primary-800'
        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
        <FileText className="w-4 h-4 text-primary-500 dark:text-primary-400" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{report.label}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {report.description}
        </p>
      </div>
    </div>

    <button
      onClick={() => onGenerate(report.type)}
      disabled={loading}
      className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label={`Generate ${report.label}`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
      ) : (
        <ArrowRight className="w-3 h-3" aria-hidden="true" />
      )}
      {loading ? 'Generating…' : 'Generate Report'}
    </button>
  </div>
);

export default ReportCard;
