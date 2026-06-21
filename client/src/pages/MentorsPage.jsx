import React, { useEffect, useState } from 'react';
import mentorService from '../services/mentorService';
import MentorCard from '../components/mentors/MentorCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { Users, Sparkles, Search } from 'lucide-react';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allRes, recRes] = await Promise.all([
        mentorService.getMentors(),
        mentorService.getRecommendedMentors(),
      ]);
      setMentors(allRes.data || []);
      setRecommended(recRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleRequest = async (mentorId, message) => {
    await mentorService.requestMentor(mentorId, message);
  };

  const filteredMentors = mentors.filter((mentor) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const name = mentor.userId?.name?.toLowerCase() || '';
    const expertise = (mentor.expertise || []).join(' ').toLowerCase();
    const industries = (mentor.industries || []).join(' ').toLowerCase();
    return name.includes(term) || expertise.includes(term) || industries.includes(term);
  });

  if (loading) return <LoadingState message="Loading mentor directory..." />;

  if (error) {
    return (
      <ErrorState
        title="Mentors Unavailable"
        message={error}
        onRetry={fetchMentors}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-100 dark:bg-secondary-950/20 rounded-full blur-[80px] opacity-40 -z-10" />
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-950/40 text-secondary-600 dark:text-secondary-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  Mentor Directory
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Connect with verified trainers and industry experts.
                </p>
              </div>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mentors..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100">Recommended For You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.slice(0, 3).map(({ mentor, matchScore }) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  matchScore={matchScore}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-slate-100">
            All Mentors ({filteredMentors.length})
          </h2>

          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor._id}
                  mentor={mentor}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3 shadow-sm">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">
                {search ? 'No mentors match your search' : 'No mentors registered yet'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {search
                  ? 'Try a different search term or browse all mentors.'
                  : 'Mentor profiles will appear here once trainers join the platform.'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MentorsPage;
