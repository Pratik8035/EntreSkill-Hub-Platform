import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Search, RefreshCw, Landmark, HelpCircle, AlertCircle, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';

const SCHEME_CATEGORIES = ['All', 'Agriculture', 'SME Funding', 'Technology', 'Women Entrepreneurs', 'Subsidies', 'Credit Guarantee', 'Tax Schemes'];
const STATES = ['All', 'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'National'];

const SchemeManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('schemes'); // 'schemes' | 'funding'
  const [loading, setLoading] = useState(false);

  // ── Schemes State ──────────────────────────────────────────────────────────
  const [schemes, setSchemes] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('All');
  const [schemeState, setSchemeState] = useState('All');

  // Schemes Modals
  const [editingScheme, setEditingScheme] = useState(null); // null, 'new', {scheme}
  const [sName, setSName] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sElig, setSElig] = useState('');
  const [sCat, setSCat] = useState('Technology');
  const [sBenefits, setSBenefits] = useState('');
  const [sLink, setSLink] = useState('');
  const [sState, setSState] = useState('National');
  const [sIndustry, setSIndustry] = useState('All');
  const [sFundingAmt, setSFundingAmt] = useState('');
  const [sDeadline, setSDeadline] = useState('');

  // ── Funding State ──────────────────────────────────────────────────────────
  const [funding, setFunding] = useState([]);
  const [fundSearch, setFundSearch] = useState('');
  const [fundIndustry, setFundIndustry] = useState('All');

  // Funding Modals
  const [editingFund, setEditingFund] = useState(null); // null, 'new', {fund}
  const [fName, setFName] = useState('');
  const [fProvider, setFProvider] = useState('');
  const [fAmount, setFAmount] = useState('');
  const [fIntRate, setFIntRate] = useState('');
  const [fElig, setFElig] = useState('');
  const [fIndustry, setFIndustry] = useState('All');
  const [fLink, setFLink] = useState('');

  const [saving, setSaving] = useState(false);

  // Fetch Data
  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getSchemes({
        search: schemeSearch,
        category: schemeCategory,
        state: schemeState
      });
      if (res.success) {
        setSchemes(res.data?.schemes || res.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  }, [schemeSearch, schemeCategory, schemeState]);

  const fetchFunding = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getFunding({
        search: fundSearch,
        industry: fundIndustry
      });
      if (res.success) {
        setFunding(res.data?.programs || res.data || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch funding programs');
    } finally {
      setLoading(false);
    }
  }, [fundSearch, fundIndustry]);

  useEffect(() => {
    if (activeSubTab === 'schemes') fetchSchemes();
    else fetchFunding();
  }, [activeSubTab, fetchSchemes, fetchFunding]);

  // Schemes Handlers
  const handleOpenNewScheme = () => {
    setEditingScheme('new');
    setSName('');
    setSDesc('');
    setSElig('');
    setSCat('Technology');
    setSBenefits('');
    setSLink('');
    setSState('National');
    setSIndustry('All');
    setSFundingAmt('');
    setSDeadline('');
  };

  const handleOpenEditScheme = (scheme) => {
    setEditingScheme(scheme);
    setSName(scheme.name || '');
    setSDesc(scheme.description || '');
    setSElig(scheme.eligibility || '');
    setSCat(scheme.category || 'Technology');
    setSBenefits(scheme.benefits || '');
    setSLink(scheme.officialLink || '');
    setSState(scheme.state || 'National');
    setSIndustry(scheme.industry || 'All');
    setSFundingAmt(scheme.fundingAmount || '');
    setSDeadline(scheme.deadline ? new Date(scheme.deadline).toISOString().substring(0, 10) : '');
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: sName,
        description: sDesc,
        eligibility: sElig,
        category: sCat,
        benefits: sBenefits,
        officialLink: sLink,
        state: sState,
        industry: sIndustry,
        fundingAmount: sFundingAmt ? Number(sFundingAmt) : undefined,
        deadline: sDeadline ? new Date(sDeadline) : undefined
      };

      let res;
      if (editingScheme === 'new') {
        res = await adminService.createScheme(payload);
      } else {
        res = await adminService.updateScheme(editingScheme._id, payload);
      }

      if (res.success) {
        toast.success(editingScheme === 'new' ? 'Government scheme created' : 'Government scheme updated');
        setEditingScheme(null);
        fetchSchemes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save scheme');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScheme = async (id) => {
    if (!window.confirm('Are you sure you want to delete this government scheme?')) return;
    try {
      const res = await adminService.deleteScheme(id);
      if (res.success) {
        toast.success('Scheme deleted successfully');
        fetchSchemes();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete scheme');
    }
  };

  // Funding Handlers
  const handleOpenNewFund = () => {
    setEditingFund('new');
    setFName('');
    setFProvider('');
    setFAmount('');
    setFIntRate('');
    setFElig('');
    setFIndustry('All');
    setFLink('');
  };

  const handleOpenEditFund = (fund) => {
    setEditingFund(fund);
    setFName(fund.name || '');
    setFProvider(fund.provider || '');
    setFAmount(fund.amount || '');
    setFIntRate(fund.interestRate || '');
    setFElig(fund.eligibility || '');
    setFIndustry(fund.industry || 'All');
    setFLink(fund.applicationLink || '');
  };

  const handleSaveFund = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: fName,
        provider: fProvider,
        amount: fAmount ? Number(fAmount) : undefined,
        interestRate: fIntRate ? Number(fIntRate) : undefined,
        eligibility: fElig,
        industry: fIndustry,
        applicationLink: fLink
      };

      let res;
      if (editingFund === 'new') {
        res = await adminService.createFunding(payload);
      } else {
        res = await adminService.updateFunding(editingFund._id, payload);
      }

      if (res.success) {
        toast.success(editingFund === 'new' ? 'Funding program created' : 'Funding program updated');
        setEditingFund(null);
        fetchFunding();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save funding program');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFund = async (id) => {
    if (!window.confirm('Are you sure you want to delete this funding program?')) return;
    try {
      const res = await adminService.deleteFunding(id);
      if (res.success) {
        toast.success('Funding program deleted successfully');
        fetchFunding();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete program');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs bar */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-0">
        <button
          onClick={() => setActiveSubTab('schemes')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'schemes'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400 bg-primary-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Government Schemes ({schemes.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('funding')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center space-x-1.5 cursor-pointer ${
            activeSubTab === 'funding'
              ? 'border-primary-600 text-primary-700 dark:text-primary-400 bg-primary-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Funding Programs ({funding.length})</span>
        </button>
      </div>

      {/* ── GOVERNMENT SCHEMES VIEW ─────────────────────────────────────────── */}
      {activeSubTab === 'schemes' && (
        <div className="space-y-6">
          {/* Search + Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search government schemes..."
                value={schemeSearch}
                onChange={(e) => setSchemeSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                value={schemeCategory}
                onChange={(e) => setSchemeCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-750 focus:outline-none cursor-pointer"
              >
                {SCHEME_CATEGORIES.map(sc => (
                  <option key={sc} value={sc}>{sc === 'All' ? 'All Categories' : sc}</option>
                ))}
              </select>
              <select
                value={schemeState}
                onChange={(e) => setSchemeState(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-750 focus:outline-none cursor-pointer"
              >
                {STATES.map(st => (
                  <option key={st} value={st}>{st === 'All' ? 'All States' : st}</option>
                ))}
              </select>
              <button
                onClick={handleOpenNewScheme}
                className="flex items-center space-x-1.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scheme</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Scheme Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">State</th>
                    <th className="px-6 py-4">Funding Amount</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">Loading schemes...</td>
                    </tr>
                  ) : schemes.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">No schemes found.</td>
                    </tr>
                  ) : (
                    schemes.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white font-outfit">{s.name}</div>
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-sm">{s.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500 capitalize">{s.category}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{s.state}</td>
                        <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                          {s.fundingAmount ? `₹${s.fundingAmount.toLocaleString()}` : 'Varies'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-450">
                          {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'Ongoing'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditScheme(s)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-primary-650 hover:bg-slate-150 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteScheme(s._id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-rose-600 hover:bg-slate-150 cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ── COMMERCIAL FUNDING PROGRAMS VIEW ────────────────────────────────── */}
      {activeSubTab === 'funding' && (
        <div className="space-y-6">
          {/* Search + Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search commercial loans / funding offerings..."
                value={fundSearch}
                onChange={(e) => setFundSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={fundIndustry}
                onChange={(e) => setFundIndustry(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-750 focus:outline-none cursor-pointer"
              >
                <option value="All">All Industries</option>
                <option value="SaaS">SaaS</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Services">Services</option>
                <option value="Hardware">Hardware</option>
                <option value="Retail">Retail</option>
              </select>
              <button
                onClick={handleOpenNewFund}
                className="flex items-center space-x-1.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Funding</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">Funding Program</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Amount Limit</th>
                    <th className="px-6 py-4">Interest Rate</th>
                    <th className="px-6 py-4">Target Industry</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">Loading funding...</td>
                    </tr>
                  ) : funding.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">No funding programs found.</td>
                    </tr>
                  ) : (
                    funding.map((f) => (
                      <tr key={f._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 dark:text-white font-outfit">{f.name}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">{f.provider}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-655">
                          {f.amount ? `₹${f.amount.toLocaleString()}` : 'Varies'}
                        </td>
                        <td className="px-6 py-4 text-xs font-extrabold text-indigo-650 dark:text-indigo-400">
                          {f.interestRate ? `${f.interestRate}% p.a.` : '—'}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 capitalize">{f.industry}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditFund(f)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-primary-650 hover:bg-slate-150 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFund(f._id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-650 hover:text-rose-600 hover:bg-slate-150 cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ── GOVERNMENT SCHEME MODAL ────────────────────────────────────────── */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingScheme(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl z-10 p-6 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-outfit">Scheme Entry Form</span>
                <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {editingScheme === 'new' ? 'Register New Public Scheme' : `Update ${sName}`}
                </h3>
              </div>
              <button onClick={() => setEditingScheme(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  placeholder="e.g. PMEGP Credit Scheme"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  placeholder="Key features of the public grant..."
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  value={sElig}
                  onChange={(e) => setSElig(e.target.value)}
                  placeholder="e.g. Minimum age 18, manufacturing sector, micro enterprise..."
                  rows="2"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={sCat}
                    onChange={(e) => setSCat(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  >
                    {SCHEME_CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Industry</label>
                  <input
                    type="text"
                    value={sIndustry}
                    onChange={(e) => setSIndustry(e.target.value)}
                    placeholder="e.g. Manufacturing, All"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State / Scope</label>
                  <select
                    value={sState}
                    onChange={(e) => setSState(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  >
                    {STATES.filter(st => st !== 'All').map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Funding Amount (₹)</label>
                  <input
                    type="number"
                    value={sFundingAmt}
                    onChange={(e) => setSFundingAmt(e.target.value)}
                    placeholder="e.g. 2500000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application URL</label>
                  <input
                    type="text"
                    value={sLink}
                    onChange={(e) => setSLink(e.target.value)}
                    placeholder="https://officialscheme.gov.in"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={sDeadline}
                    onChange={(e) => setSDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Benefits Info Summary</label>
                <input
                  type="text"
                  value={sBenefits}
                  onChange={(e) => setSBenefits(e.target.value)}
                  placeholder="e.g. 35% subsidy for rural sectors, low-interest collateral free loans..."
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMMERCIAL FUNDING MODAL ───────────────────────────────────────── */}
      {editingFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingFund(null)} />
          <div className="relative bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl z-10 p-6 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-outfit">Funding Entry Form</span>
                <h3 className="font-outfit text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {editingFund === 'new' ? 'Register New Funding Program' : `Update ${fName}`}
                </h3>
              </div>
              <button onClick={() => setEditingFund(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFund} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Funding Program / Loan Name</label>
                <input
                  type="text"
                  required
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  placeholder="e.g. SIDBI Standup India Loan"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Provider / Financial Institution</label>
                <input
                  type="text"
                  required
                  value={fProvider}
                  onChange={(e) => setFProvider(e.target.value)}
                  placeholder="e.g. SIDBI, State Bank of India"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Funding Limit (₹)</label>
                  <input
                    type="number"
                    value={fAmount}
                    onChange={(e) => setFAmount(e.target.value)}
                    placeholder="e.g. 10000000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fIntRate}
                    onChange={(e) => setFIntRate(e.target.value)}
                    placeholder="e.g. 8.5"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Industry</label>
                  <input
                    type="text"
                    value={fIndustry}
                    onChange={(e) => setFIndustry(e.target.value)}
                    placeholder="e.g. SaaS, Retail, Manufacturing"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Application URL</label>
                  <input
                    type="text"
                    value={fLink}
                    onChange={(e) => setFLink(e.target.value)}
                    placeholder="https://provider.com/loans"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Eligibility Criteria</label>
                <textarea
                  value={fElig}
                  onChange={(e) => setFElig(e.target.value)}
                  placeholder="e.g. Profitable for 2 years, minimum turnover 25 Lakhs..."
                  rows="3"
                  className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFund(null)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Funding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeManagement;
