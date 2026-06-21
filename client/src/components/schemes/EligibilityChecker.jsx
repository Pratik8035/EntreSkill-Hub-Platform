import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import schemeService from '../../services/schemeService';

const EligibilityChecker = ({ schemeId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!schemeId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await schemeService.checkEligibility(schemeId);
        if (data && data.success) {
          setReport(data.data);
        } else {
          setError(data.message || 'Failed to check eligibility');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error occurred while checking eligibility');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [schemeId]);

  const handleAction = (criterionName) => {
    onClose();
    if (criterionName.includes('Business Plan')) {
      navigate('/recommendations');
    } else if (criterionName.includes('Profile')) {
      navigate('/dashboard');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'met':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'unmet':
        return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case 'warning':
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'met':
        return 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30';
      case 'unmet':
        return 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30';
      case 'warning':
      default:
        return 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl z-10 p-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Eligibility Assessor</span>
            <h3 className="font-outfit text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {report ? report.schemeName : 'Scheme Requirements'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto py-6 space-y-6 min-h-[200px] max-h-[50vh]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Analyzing criteria...</span>
            </div>
          ) : error ? (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 p-4 rounded-2xl text-center text-sm text-rose-700 dark:text-rose-450">
              {error}
            </div>
          ) : report ? (
            <div className="space-y-6">
              
              {/* Verdict Banner */}
              <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 ${report.isEligible ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50'}`}>
                {report.isEligible ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-outfit text-sm font-bold text-slate-900 dark:text-white">
                    {report.isEligible ? 'Passed: Fully Eligible' : 'Action Required: Gaps Detected'}
                  </h4>
                  <p className="text-xs text-slate-655 dark:text-slate-400 mt-0.5 leading-relaxed">
                    You have met {report.eligibleCount} of the {report.totalCount} platform-verified requirements.
                  </p>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Detailed Checklist:
                </span>
                {report.checklist.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex items-start space-x-3 transition-colors ${getStatusBg(item.status)}`}
                  >
                    {getStatusIcon(item.status)}
                    <div className="flex-grow space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {item.criterion}
                        </span>
                        {item.status !== 'met' && (
                          <button
                            onClick={() => handleAction(item.criterion)}
                            className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center space-x-0.5 cursor-pointer ml-2"
                          >
                            <span>Resolve</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center text-sm text-slate-500">No report generated</div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-250 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Check
          </button>
        </div>

      </div>
    </div>
  );
};

export default EligibilityChecker;
