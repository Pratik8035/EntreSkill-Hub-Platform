import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import recommendationService from '../services/recommendationService';
import { Compass, Sparkles, AlertCircle, TrendingUp, DollarSign, BrainCircuit, ArrowRight, FileText, Map, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await recommendationService.getRecommendations();
        setRecommendations(res.data || []);
      } catch (err) {
        // If assessment not completed or other error
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse text-sm font-medium">Finding optimal business opportunities for you...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-transparent py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-[80px] -z-10"></div>
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Business Recommendations
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Based on your skills assessment, interests weightings, and experience level.
            </p>
          </div>
          <Link
            to="/assessment"
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all shadow-sm border border-transparent dark:border-slate-700"
          >
            Retake Skills Assessment
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">No Recommendations Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please complete your Skills Assessment first to analyze your expertise and generate customized micro-business ideas.
            </p>
            <Link
              to="/assessment"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-100 transition-all"
            >
              <span>Take Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((item, idx) => {
              const { businessIdea, matchScore, matchedSkills, matchedInterests, explanation } = item;
              return (
                <div
                  key={businessIdea._id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md">
                          {businessIdea.category}
                        </span>
                        <h3 className="font-outfit text-lg font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">
                          {businessIdea.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                          matchScore >= 80 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                            : matchScore >= 50
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-400'
                        }`}>
                          {matchScore}% Match
                        </span>
                      </div>
                    </div>
 
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {businessIdea.description}
                    </p>
 
                    {/* Cost and income info */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl">
                      <div className="flex items-center space-x-2 text-xs">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-medium block text-[9px] uppercase">Est. Monthly Income</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{businessIdea.estimatedMonthlyIncome}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <TrendingUp className="w-4 h-4 text-primary-500" />
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 font-medium block text-[9px] uppercase">Startup Cost Range</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{businessIdea.startupCostRange}</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill matching tags */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wide">Match Explanation</p>
                      <p className="text-xs text-slate-600 dark:text-slate-350 font-medium">{explanation}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {matchedSkills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg font-medium">
                            ✓ {s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/roadmap/${businessIdea._id}`}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Map className="w-4 h-4 text-indigo-500" />
                        <span>Roadmap</span>
                      </Link>
                      <Link
                        to={`/resources/${businessIdea._id}`}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                      >
                        <BookOpen className="w-4 h-4 text-violet-500" />
                        <span>Resources</span>
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/ai-mentor?businessIdeaId=${businessIdea._id}`}
                        className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                      >
                        <BrainCircuit className="w-4 h-4" />
                        <span>AI Mentor</span>
                      </Link>
                      <Link
                        to={`/business-plan/${businessIdea._id}`}
                        className="px-3 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Business Plan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
