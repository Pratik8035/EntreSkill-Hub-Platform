import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, X, Search, RefreshCw,
  BookOpen, ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const CATEGORIES = ['All', 'Entrepreneurship', 'Business Planning', 'Digital Marketing', 'Financial Management', 'Government Schemes', 'Other'];
const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [editingCourse, setEditingCourse] = useState(null); // null | 'new' | {course}
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cCategory, setCCategory] = useState('Entrepreneurship');
  const [cDifficulty, setCDifficulty] = useState('Beginner');
  const [cThumbnail, setCThumbnail] = useState('');
  const [cDuration, setCDuration] = useState('');
  const [cPublished, setCPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getCourses({
        search,
        category: categoryFilter,
        isPublished: publishedFilter,
        page,
        limit: 10,
      });
      if (res.success) {
        setCourses(res.data.courses || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, publishedFilter, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const openNew = () => {
    setEditingCourse('new');
    setCTitle('');
    setCDesc('');
    setCCategory('Entrepreneurship');
    setCDifficulty('Beginner');
    setCThumbnail('');
    setCDuration('');
    setCPublished(false);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setCTitle(course.title || '');
    setCDesc(course.description || '');
    setCCategory(course.category || 'Entrepreneurship');
    setCDifficulty(course.difficultyLevel || 'Beginner');
    setCThumbnail(course.thumbnail || '');
    setCDuration(course.estimatedDuration || '');
    setCPublished(course.isPublished || false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: cTitle,
        description: cDesc,
        category: cCategory,
        difficultyLevel: cDifficulty,
        thumbnail: cThumbnail || undefined,
        estimatedDuration: cDuration ? Number(cDuration) : undefined,
        isPublished: cPublished,
      };

      let res;
      if (editingCourse === 'new') {
        res = await adminService.createCourse(payload);
      } else {
        res = await adminService.updateCourse(editingCourse._id, payload);
      }

      if (res.success) {
        toast.success(editingCourse === 'new' ? 'Course created' : 'Course updated');
        setEditingCourse(null);
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    try {
      const res = await adminService.deleteCourse(id);
      if (res.success) {
        toast.success('Course deleted');
        fetchCourses();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const difficultyColor = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
          <select
            value={publishedFilter}
            onChange={(e) => { setPublishedFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          <button
            onClick={fetchCourses}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-2xl text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openNew}
            className="flex items-center space-x-1.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin mb-2" />
                    <span>Loading courses...</span>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No courses found.</p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white font-outfit">{course.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">{course.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{course.category || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColor[course.difficultyLevel] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {course.difficultyLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {course.estimatedDuration ? `${course.estimatedDuration} min` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {course.isPublished ? (
                        <span className="flex items-center space-x-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Eye className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <EyeOff className="w-3 h-3" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => openEdit(course)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-primary-650 hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-rose-600 hover:bg-slate-100 cursor-pointer transition-colors"
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
              Page {page} of {pages} ({total} courses total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 hover:bg-white cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 hover:bg-white cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingCourse(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl z-10 p-6 flex flex-col max-h-[90vh]">

            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-outfit">Course Editor</span>
                <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {editingCourse === 'new' ? 'Create New Course' : `Edit "${cTitle}"`}
                </h3>
              </div>
              <button onClick={() => setEditingCourse(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  placeholder="e.g. Business Planning Fundamentals"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  placeholder="What will students learn in this course?"
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={cCategory}
                    onChange={(e) => setCCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={cDifficulty}
                    onChange={(e) => setCDifficulty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  >
                    {DIFFICULTY_LEVELS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={cDuration}
                    onChange={(e) => setCDuration(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Publication Status</label>
                  <select
                    value={cPublished ? 'true' : 'false'}
                    onChange={(e) => setCPublished(e.target.value === 'true')}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="false">Draft</option>
                    <option value="true">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail URL</label>
                <input
                  type="text"
                  value={cThumbnail}
                  onChange={(e) => setCThumbnail(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingCourse === 'new' ? 'Create Course' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
