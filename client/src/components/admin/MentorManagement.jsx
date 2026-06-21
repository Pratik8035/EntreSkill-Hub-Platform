import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, Trash2, X, Star, RefreshCw, ChevronLeft, ChevronRight, Award, Compass, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const MentorManagement = () => {
  const [mentors, setMentors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [editingMentor, setEditingMentor] = useState(null);
  const [editExpertise, setEditExpertise] = useState('');
  const [editIndustries, setEditIndustries] = useState('');
  const [editAvailability, setEditAvailability] = useState('OnDemand');
  const [editRating, setEditRating] = useState(5);
  const [saving, setSaving] = useState(false);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getMentors({
        search,
        availability: availFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setMentors(res.data.profiles || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch mentors');
    } finally {
      setLoading(false);
    }
  }, [search, availFilter, page]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mentor profile? The user will be demoted to Entrepreneur role, but their account will remain.')) {
      return;
    }
    try {
      const res = await adminService.deleteMentor(id);
      if (res.success) {
        toast.success('Mentor profile deleted successfully');
        fetchMentors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete profile');
    }
  };

  const handleEditOpen = (mentor) => {
    setEditingMentor(mentor);
    setEditExpertise(mentor.expertise?.join(', ') || '');
    setEditIndustries(mentor.industries?.join(', ') || '');
    setEditAvailability(mentor.availability || 'OnDemand');
    setEditRating(mentor.rating || 5);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const expertiseArr = editExpertise.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const industriesArr = editIndustries.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const res = await adminService.updateMentor(editingMentor._id, {
        expertise: expertiseArr,
        industries: industriesArr,
        availability: editAvailability,
        rating: Number(editRating)
      });
      if (res.success) {
        toast.success('Mentor profile updated');
        setEditingMentor(null);
        fetchMentors();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search mentors by user name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={availFilter}
            onChange={(e) => { setAvailFilter(e.target.value); setPage(1); }}
            className="w-full md:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-350 focus:outline-none font-semibold cursor-pointer"
          >
            <option value="All">All Availability</option>
            <option value="FullTime">Full Time</option>
            <option value="PartTime">Part Time</option>
            <option value="OnDemand">On Demand</option>
          </select>
          <button
            onClick={fetchMentors}
            className="p-3 bg-slate-150 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Mentor Name</th>
                <th className="px-6 py-4">Expertise</th>
                <th className="px-6 py-4">Industries</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-2" />
                    <span>Loading mentor profiles...</span>
                  </td>
                </tr>
              ) : mentors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No mentor profiles found.
                  </td>
                </tr>
              ) : (
                mentors.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-outfit">{m.userId?.name || 'Deleted User'}</div>
                        <div className="text-xs text-slate-400">{m.userId?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {m.expertise?.length > 0 ? (
                          m.expertise.map((exp, idx) => (
                            <span key={idx} className="text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/30 text-primary-750 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50 px-2 py-0.5 rounded-full capitalize">
                              {exp}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {m.industries?.length > 0 ? (
                          m.industries.map((ind, idx) => (
                            <span key={idx} className="text-[10px] font-semibold bg-sky-50 dark:bg-sky-950/30 text-sky-750 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50 px-2 py-0.5 rounded-full capitalize font-outfit">
                              {ind}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                      {m.availability}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-xs font-bold">{m.rating?.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleEditOpen(m)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-primary-650 dark:text-slate-400 dark:hover:text-primary-405 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Showing Page {page} of {pages} ({total} Mentors total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 hover:bg-white dark:hover:bg-slate-900 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 hover:bg-white dark:hover:bg-slate-900 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Mentor Modal */}
      {editingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingMentor(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl z-10 p-6 flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-outfit">Mentor Configuration</span>
                <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Tweak Profile for {editingMentor.userId?.name}
                </h3>
              </div>
              <button onClick={() => setEditingMentor(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Expertise Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editExpertise}
                  onChange={(e) => setEditExpertise(e.target.value)}
                  placeholder="e.g. Scaling, Fundraising, Marketing"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Industries (Comma-separated)</label>
                <input
                  type="text"
                  value={editIndustries}
                  onChange={(e) => setEditIndustries(e.target.value)}
                  placeholder="e.g. FinTech, SaaS, Healthcare"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Availability</label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="FullTime">Full Time</option>
                    <option value="PartTime">Part Time</option>
                    <option value="OnDemand">On Demand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Rating (0 - 5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="flex-1 py-2.5 border border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorManagement;
