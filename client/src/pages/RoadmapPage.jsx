import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import roadmapService from '../services/roadmapService';
import recommendationService from '../services/recommendationService';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  Map, ArrowLeft, CheckCircle2, AlertTriangle, Users, Calendar, Target, BookOpen,
} from 'lucide-react';

const RoadmapPage = () => {
  const { businessIdeaId } = useParams();
  const [roadmap, setRoadmap] = useState(null);
  const [ideaName, setIdeaName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roadmapRes, recsRes] = await Promise.all([
        roadmapService.getRoadmap(businessIdeaId),
        recommendationService.getRecommendations().catch(() => ({ data: [] })),
      ]);

      setRoadmap(roadmapRes.data);
      const idea = (recsRes.data || []).find(
        (r) => r.businessIdea?._id === businessIdeaId
      )?.businessIdea;
      if (idea) setIdeaName(idea.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roadmap');
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [businessIdeaId]);

  if (loading) return <LoadingState message="Loading startup roadmap..." />;

  if (error || !roadmap) {
    return (
      <ErrorState
        title="Roadmap Not Available"
        message={error || 'No roadmap exists for this business idea yet.'}
        onRetry={fetchRoadmap}
      />
    );
  }

  const skillLabel = (entry) => entry.skillId?.name || 'Skill';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <Link
            to="/recommendations"
            className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors space-x-1 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recommendations</span>
          </Link>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 dark:bg-primary-950/30 rounded-full blur-[80px] opacity-40 -z-10" />
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase">Startup Roadmap</span>
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {ideaName || 'Business Roadmap'}
                </h1>
              </div>
            </div>
            {roadmap.timeline && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-2">
                <Calendar className="w-4 h-4" />
                <span>Estimated timeline: {roadmap.timeline}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary-500" />
                <span>Milestones Timeline</span>
              </h2>

              {(roadmap.milestones || []).length > 0 ? (
                <div className="relative pl-6 border-l-2 border-primary-200 dark:border-primary-900 space-y-8">
                  {roadmap.milestones.map((milestone, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[1.6rem] top-1 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-slate-900" />
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{milestone.title}</h3>
                        {milestone.dueDate && (
                          <p className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase">
                            Target: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No milestones defined yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Required Skills</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(roadmap.requiredSkills || []).map((entry, idx) => (
                  <span key={idx} className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-medium">
                    {skillLabel(entry)}
                  </span>
                ))}
                {(roadmap.requiredSkills || []).length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">None listed</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Missing Skills</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(roadmap.missingSkills || []).map((entry, idx) => (
                  <span key={idx} className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg font-medium">
                    {skillLabel(entry)}
                  </span>
                ))}
                {(roadmap.missingSkills || []).length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">You have all required skills</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Mentor Categories</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(roadmap.mentorCategories || []).map((cat, idx) => (
                  <span key={idx} className="text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg font-medium">
                    {cat}
                  </span>
                ))}
                {(roadmap.mentorCategories || []).length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">General business mentors</p>
                )}
              </div>
              <Link
                to="/mentors"
                className="block w-full py-2.5 text-center bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl text-xs font-bold transition-all"
              >
                Browse Mentors
              </Link>
            </div>

            <Link
              to={`/resources/${businessIdeaId}`}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-bold shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Learning Resources</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
