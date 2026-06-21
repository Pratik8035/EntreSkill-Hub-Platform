import React, { useState, useEffect } from 'react';
import { Landmark, Search, Filter, Compass, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import schemeService from '../services/schemeService';
import SchemeCard from '../components/schemes/SchemeCard';
import FundingCard from '../components/schemes/FundingCard';
import EligibilityChecker from '../components/schemes/EligibilityChecker';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

const STATES = ['All', 'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh', 'Telangana'];
const SCHEME_CATEGORIES = ['All', 'Grants & Seed Funding', 'Subsidy Loan', 'Low Interest Loan', 'Special Credit Loan', 'Credit Guarantee', 'Grants & Incubation', 'State Grant'];
const FUNDING_INDUSTRIES = ['All', 'Manufacturing', 'Agriculture', 'Digital Services'];

const GovernmentSchemesPage = () => {
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes' | 'funding'
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'recommended'
  
  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [industry, setIndustry] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  // Lists
  const [schemes, setSchemes] = useState([]);
  const [recommendedSchemes, setRecommendedSchemes] = useState([]);
  const [funding, setFunding] = useState([]);
  const [recommendedFunding, setRecommendedFunding] = useState([]);

  // States for UX
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Eligibility Checker
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'schemes') {
        if (viewMode === 'all') {
          const res = await schemeService.getSchemes({
            search,
            category,
            state: stateFilter
          });
          setSchemes(res.data || []);
        } else {
          const res = await schemeService.getRecommendedSchemes();
          setRecommendedSchemes(res.data || []);
        }
      } else {
        if (viewMode === 'all') {
          const res = await schemeService.getFundingPrograms({
            search,
            industry
          });
          setFunding(res.data || []);
        } else {
          const res = await schemeService.getRecommendedFunding();
          setRecommendedFunding(res.data || []);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to fetch data for ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, viewMode, category, industry, stateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setIndustry('All');
    setStateFilter('All');
    // useEffect will auto-fetch since dependencies change
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingState message={`Fetching ${activeTab === 'schemes' ? 'schemes' : 'funding opportunities'}...`} />;
    }

    if (error) {
      return (
        <ErrorState
          title={`Error loading ${activeTab}`}
          message={error}
          onRetry={fetchData}
        />
      );
    }

    if (activeTab === 'schemes') {
      const items = viewMode === 'all' ? schemes : recommendedSchemes;
      
      // Perform local search filtering for recommended view since recommend backend provides static list
      const displayedItems = viewMode === 'all' 
        ? items 
        : items.filter(item => {
            const matchesSearch = !search || 
              item.scheme.name.toLowerCase().includes(search.toLowerCase()) || 
              item.scheme.description.toLowerCase().includes(search.toLowerCase());
            
            const matchesCategory = category === 'All' || item.scheme.category === category;
            const matchesState = stateFilter === 'All' || item.scheme.state === stateFilter || item.scheme.state === 'All';
            
            return matchesSearch && matchesCategory && matchesState;
          });

      if (displayedItems.length === 0) {
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto" />
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">No Schemes Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              We couldn't find any government schemes matching your current criteria. Try resetting filters or completing your trade assessment profile to get custom matches!
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, idx) => (
            <SchemeCard
              key={viewMode === 'all' ? item._id : item.scheme._id}
              schemeData={item}
              isRecommendedMode={viewMode === 'recommended'}
              onCheckEligibility={(id) => setSelectedSchemeId(id)}
            />
          ))}
        </div>
      );
    } else {
      const items = viewMode === 'all' ? funding : recommendedFunding;
      
      const displayedItems = viewMode === 'all'
        ? items
        : items.filter(item => {
            const matchesSearch = !search || 
              item.program.name.toLowerCase().includes(search.toLowerCase()) || 
              item.program.provider.toLowerCase().includes(search.toLowerCase());
            
            const matchesIndustry = industry === 'All' || item.program.industry === industry || item.program.industry === 'All';
            return matchesSearch && matchesIndustry;
          });

      if (displayedItems.length === 0) {
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-slate-350 dark:text-slate-600 mx-auto" />
            <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">No Funding Programs Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              No commercial credit or bank programs matched your criteria. Try adjusting your category requirements or check back later.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item, idx) => (
            <FundingCard
              key={viewMode === 'all' ? item._id : item.program._id}
              fundingData={item}
              isRecommendedMode={viewMode === 'recommended'}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col gap-4">
          <Link
            to="/dashboard"
            className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-455 hover:text-primary-605 transition-colors space-x-1 w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -z-10"></div>
            
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-primary-500/20">
                <Landmark className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Financial Engine</span>
                <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Schemes & Funding Hub
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Discover public grant schemes, credit assistance, and bank funding options customized for your trade.
            </p>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
          
          {/* Main Tabs */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => { setActiveTab('schemes'); handleResetFilters(); }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schemes'
                  ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-300'
              }`}
            >
              Government Schemes
            </button>
            <button
              onClick={() => { setActiveTab('funding'); handleResetFilters(); }}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'funding'
                  ? 'bg-white dark:bg-slate-850 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-300'
              }`}
            >
              Commercial Loans & Funding
            </button>
          </div>

          {/* Mode Selector (All vs Recommended) */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => setViewMode('recommended')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                viewMode === 'recommended'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Recommended For You</span>
            </button>
          </div>

        </div>

        {/* Filters Controls Panel */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'schemes' ? "Search Startup India, PMEGP, Mudra..." : "Search SBI, HDFC, NABARD loans..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-3.5">
              
              {/* Category dropdown (only for schemes tab) */}
              {activeTab === 'schemes' && (
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none pr-4 font-semibold"
                  >
                    {SCHEME_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-white dark:bg-slate-900">{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Industry dropdown (only for funding tab) */}
              {activeTab === 'funding' && (
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none pr-4 font-semibold"
                  >
                    {FUNDING_INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} className="bg-white dark:bg-slate-900">{ind}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* State filter dropdown (only for schemes tab) */}
              {activeTab === 'schemes' && (
                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="bg-transparent border-none text-slate-700 dark:text-slate-350 focus:outline-none pr-4 font-semibold"
                  >
                    {STATES.map(st => (
                      <option key={st} value={st} className="bg-white dark:bg-slate-900">{st === 'All' ? 'All States' : st}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search button trigger */}
              <button 
                type="submit"
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Apply
              </button>

            </div>

          </form>
        </div>

        {/* Dynamic Display Area */}
        <div className="space-y-6">
          {renderContent()}
        </div>

      </div>

      {/* Eligibility Checker overlay modal */}
      {selectedSchemeId && (
        <EligibilityChecker
          schemeId={selectedSchemeId}
          onClose={() => setSelectedSchemeId(null)}
        />
      )}

    </div>
  );
};

export default GovernmentSchemesPage;
