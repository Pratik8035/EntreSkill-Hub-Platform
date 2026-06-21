import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import resourceService from '../services/resourceService';
import recommendationService from '../services/recommendationService';
import ResourceCard from '../components/resources/ResourceCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { BookOpen, ArrowLeft, Filter } from 'lucide-react';

const FILTERS = ['All', 'Article', 'Video', 'Course'];

const ResourcesPage = () => {
  const { businessIdeaId } = useParams();
  const [resources, setResources] = useState([]);
  const [ideaName, setIdeaName] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      const [resourcesRes, recsRes] = await Promise.all([
        resourceService.getResources(businessIdeaId),
        recommendationService.getRecommendations().catch(() => ({ data: [] })),
      ]);

      setResources(resourcesRes.data || []);
      const idea = (recsRes.data || []).find(
        (r) => r.businessIdea?._id === businessIdeaId
      )?.businessIdea;
      if (idea) setIdeaName(idea.name);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [businessIdeaId]);

  const filteredResources = useMemo(() => {
    if (activeFilter === 'All') return resources;
    return resources.filter((r) => r.type === activeFilter);
  }, [resources, activeFilter]);

  if (loading) return <LoadingState message="Loading learning resources..." />;

  if (error) {
    return (
      <ErrorState
        title="Resources Unavailable"
        message={error}
        onRetry={fetchResources}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <Link
            to={`/roadmap/${businessIdeaId}`}
            className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors space-x-1 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Roadmap</span>
          </Link>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Learning Hub</span>
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {ideaName ? `${ideaName} Resources` : 'Learning Resources'}
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {resources.length} resource{resources.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary-200'
              }`}
            >
              {filter === 'All' ? 'All Types' : `${filter}s`}
            </button>
          ))}
        </div>

        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource._id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">No Resources Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeFilter === 'All'
                ? 'No learning resources have been added for this business idea yet.'
                : `No ${activeFilter.toLowerCase()} resources match this filter.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;
