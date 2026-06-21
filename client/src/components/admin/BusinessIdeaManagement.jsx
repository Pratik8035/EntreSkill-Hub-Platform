import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import skillService from '../../services/skillService';
import interestService from '../../services/interestService';

const CATEGORIES = ['All', 'Technology', 'Healthcare', 'Agriculture', 'E-commerce', 'Services', 'Retail', 'Education', 'Food & Beverage'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Experienced'];

const BusinessIdeaManagement = () => {
  const [ideas, setIdeas] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  // Master lists for dropdowns
  const [masterSkills, setMasterSkills] = useState([]);
  const [masterInterests, setMasterInterests] = useState([]);

  // Modal State
  const [editingIdea, setEditingIdea] = useState(null); // null = not open, 'new' = create, {idea} = edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [startupCostRange, setStartupCostRange] = useState('');
  const [estimatedMonthlyIncome, setEstimatedMonthlyIncome] = useState('');
  const [tags, setTags] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]); // [{skillId, weight}]
  const [selectedInterests, setSelectedInterests] = useState([]); // [{interestId, weight}]
  const [roadmapAvailable, setRoadmapAvailable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getBusinessIdeas({
        search,
        category: categoryFilter,
        page,
        limit: 10
      });
      if (res.success) {
        setIdeas(res.data.ideas || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch business ideas');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  const fetchMasterData = useCallback(async () => {
    try {
      const [skillsRes, interestsRes] = await Promise.all([
        skillService.getSkills(),
        interestService.getInterests()
      ]);
      setMasterSkills(skillsRes.data || []);
      setMasterInterests(interestsRes.data || []);
    } catch (err) {
      console.error('Failed to load master metadata', err);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business idea? This cannot be undone.')) {
      return;
    }
    try {
      const res = await adminService.deleteBusinessIdea(id);
      if (res.success) {
        toast.success('Business idea deleted successfully');
        fetchIdeas();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete business idea');
    }
  };

  const handleOpenNew = () => {
    setEditingIdea('new');
    setName('');
    setDescription('');
    setCategory('Technology');
    setDifficultyLevel('Beginner');
    setStartupCostRange('$500-$1500');
    setEstimatedMonthlyIncome('$2000');
    setTags('');
    setSelectedSkills([]);
    setSelectedInterests([]);
    setRoadmapAvailable(false);
    setIsActive(true);
  };

  const handleOpenEdit = (idea) => {
    setEditingIdea(idea);
    setName(idea.name || '');
    setDescription(idea.description || '');
    setCategory(idea.category || 'Technology');
    setDifficultyLevel(idea.difficultyLevel || 'Beginner');
    setStartupCostRange(idea.startupCostRange || '');
    setEstimatedMonthlyIncome(idea.estimatedMonthlyIncome || '');
    setTags(idea.tags?.join(', ') || '');
    setSelectedSkills(idea.requiredSkills || []);
    setSelectedInterests(idea.relatedInterests || []);
    setRoadmapAvailable(idea.roadmapAvailable || false);
    setIsActive(idea.isActive !== undefined ? idea.isActive : true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagsArr = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const payload = {
        name,
        description,
        category,
        difficultyLevel,
        startupCostRange,
        estimatedMonthlyIncome,
        tags: tagsArr,
        requiredSkills: selectedSkills,
        relatedInterests: selectedInterests,
        roadmapAvailable,
        isActive
      };

      let res;
      if (editingIdea === 'new') {
        res = await adminService.createBusinessIdea(payload);
      } else {
        res = await adminService.updateBusinessIdea(editingIdea._id, payload);
      }

      if (res.success) {
        toast.success(editingIdea === 'new' ? 'Business idea created' : 'Business idea updated');
        setEditingIdea(null);
        fetchIdeas();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save business idea');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skillId) => {
    if (!skillId) return;
    if (selectedSkills.some(s => s.skillId === skillId)) return;
    setSelectedSkills([...selectedSkills, { skillId, weight: 1 }]);
  };

  const removeSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter(s => s.skillId !== skillId));
  };

  const updateSkillWeight = (skillId, weight) => {
    setSelectedSkills(selectedSkills.map(s => s.skillId === skillId ? { ...s, weight: Number(weight) } : s));
  };

  const addInterest = (interestId) => {
    if (!interestId) return;
    if (selectedInterests.some(i => i.interestId === interestId)) return;
    setSelectedInterests([...selectedInterests, { interestId, weight: 1 }]);
  };

  const removeInterest = (interestId) => {
    setSelectedInterests(selectedInterests.filter(i => i.interestId !== interestId));
  };

  const updateInterestWeight = (interestId, weight) => {
    setSelectedInterests(selectedInterests.map(i => i.interestId === interestId ? { ...i, weight: Number(weight) } : i));
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search business ideas by name/description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="w-full md:w-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-350 focus:outline-none font-semibold cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
          <button
            onClick={handleOpenNew}
            className="flex items-center space-x-1.5 px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-colors w-full md:w-auto text-center justify-center whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Idea</span>
          </button>
        </div>
      </div>

      {/* Ideas Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Idea Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Startup Cost</th>
                <th className="px-6 py-4">Monthly Income</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-2" />
                    <span>Loading business ideas...</span>
                  </td>
                </tr>
              ) : ideas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No business ideas found.
                  </td>
                </tr>
              ) : (
                ideas.map((i) => (
                  <tr key={i._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-outfit">{i.name}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-sm">{i.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize">
                      {i.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        i.difficultyLevel === 'Beginner'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-250'
                          : i.difficultyLevel === 'Intermediate'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-250'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 border-rose-250'
                      }`}>
                        {i.difficultyLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-655 dark:text-slate-350">
                      {i.startupCostRange}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-655 dark:text-slate-350">
                      {i.estimatedMonthlyIncome}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(i)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-primary-650 dark:text-slate-400 dark:hover:text-primary-405 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(i._id)}
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
              Showing Page {page} of {pages} ({total} Ideas total)
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

      {/* Create / Edit Modal */}
      {editingIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingIdea(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl z-10 p-6 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-outfit">Business Model Forge</span>
                <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {editingIdea === 'new' ? 'Forge New Business Idea' : `Tweak Settings for ${name}`}
                </h3>
              </div>
              <button onClick={() => setEditingIdea(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Business Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Online Art Agency"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Short Pitch / Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the business model, scaling mechanics, and target market..."
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Difficulty Level</label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    {DIFFICULTY_LEVELS.map(dl => (
                      <option key={dl} value={dl}>{dl}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Cost Range</label>
                  <input
                    type="text"
                    required
                    value={startupCostRange}
                    onChange={(e) => setStartupCostRange(e.target.value)}
                    placeholder="e.g. $500-$1500"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Monthly Income</label>
                  <input
                    type="text"
                    required
                    value={estimatedMonthlyIncome}
                    onChange={(e) => setEstimatedMonthlyIncome(e.target.value)}
                    placeholder="e.g. $3000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Art, E-commerce, remote"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center space-x-6 pt-5">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-750 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roadmapAvailable}
                      onChange={(e) => setRoadmapAvailable(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-755 text-primary-650"
                    />
                    <span>Roadmap Available</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-755 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-755 text-primary-650"
                    />
                    <span>Active Entity</span>
                  </label>
                </div>
              </div>

              {/* Skills Mapping Section */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Required Skills Weighting</h4>
                  <select
                    onChange={(e) => { addSkill(e.target.value); e.target.value = ''; }}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="">+ Add Skill Requirement</option>
                    {masterSkills.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedSkills.map((sk) => {
                    const matched = masterSkills.find(ms => ms._id === sk.skillId);
                    return (
                      <div key={sk.skillId} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{matched?.name || 'Loading skill...'}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Weight:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={sk.weight}
                              onChange={(e) => updateSkillWeight(sk.skillId, e.target.value)}
                              className="w-12 text-center bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded px-1 text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSkill(sk.skillId)}
                            className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {selectedSkills.length === 0 && (
                    <span className="text-[11px] text-slate-400 text-center py-2">No skills mapped yet. Add above.</span>
                  )}
                </div>
              </div>

              {/* Interests Mapping Section */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Related Interests Weighting</h4>
                  <select
                    onChange={(e) => { addInterest(e.target.value); e.target.value = ''; }}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 focus:outline-none cursor-pointer"
                  >
                    <option value="">+ Add Interest Relation</option>
                    {masterInterests.map(i => (
                      <option key={i._id} value={i._id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedInterests.map((int) => {
                    const matched = masterInterests.find(mi => mi._id === int.interestId);
                    return (
                      <div key={int.interestId} className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{matched?.name || 'Loading interest...'}</span>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">Weight:</span>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={int.weight}
                              onChange={(e) => updateInterestWeight(int.interestId, e.target.value)}
                              className="w-12 text-center bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded px-1 text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeInterest(int.interestId)}
                            className="text-rose-500 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {selectedInterests.length === 0 && (
                    <span className="text-[11px] text-slate-400 text-center py-2">No interests mapped yet. Add above.</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => setEditingIdea(null)}
                  className="flex-1 py-2.5 border border-slate-250 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Business Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessIdeaManagement;
