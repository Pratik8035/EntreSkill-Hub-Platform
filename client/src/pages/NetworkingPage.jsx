import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Filter, Link2, Inbox, Briefcase,
  AlertTriangle, ArrowLeft, RefreshCw, Network,
  ChevronLeft, ChevronRight, X, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import networkingService from '../services/networkingService';
import ConnectionCard from '../components/networking/ConnectionCard';
import CollaborationCard from '../components/networking/CollaborationCard';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

const TABS = [
  { id: 'entrepreneurs', label: 'Entrepreneurs', icon: Users },
  { id: 'mentors', label: 'Mentors', icon: Users },
  { id: 'connections', label: 'My Connections', icon: Link2 },
  { id: 'requests', label: 'Requests', icon: Inbox },
];

const STATES = ['All', 'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Gujarat', 'Uttar Pradesh'];
const PAGE_SIZE = 9;

// ── Collaboration Proposal Modal ───────────────────────────────────────────────
const CollaborationModal = ({ targetUser, onClose, onSubmit }) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim() || !description.trim()) return;
    setLoading(true);
    try {
      await onSubmit(targetUser._id, projectTitle.trim(), description.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl z-10 p-6 flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">New Proposal</span>
            <h3 className="font-outfit text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              Collaborate with {targetUser.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. Local Artisan Marketplace App"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Project Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe the collaboration opportunity, your goals, and what you're looking for..."
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !projectTitle.trim() || !description.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              <Briefcase className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, message, onReset }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm col-span-full">
    <Icon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
    <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-200">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{message}</p>
    {onReset && (
      <button
        onClick={onReset}
        className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Reset Filters</span>
      </button>
    )}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const NetworkingPage = () => {
  const [activeTab, setActiveTab] = useState('entrepreneurs');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState({ connectionRequests: [], collaborationRequestsReceived: [], collaborationRequestsSent: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collaboration modal
  const [collaborateTarget, setCollaborateTarget] = useState(null);

  // ── Fetchers ────────────────────────────────────────────────────────────────
  const fetchDirectory = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await networkingService.getDirectoryUsers();
      setDirectoryUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await networkingService.getConnections();
      setConnections(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await networkingService.getRequests();
      setRequests(res.data || { connectionRequests: [], collaborationRequestsReceived: [], collaborationRequestsSent: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === 'entrepreneurs' || activeTab === 'mentors') fetchDirectory();
    else if (activeTab === 'connections') fetchConnections();
    else if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleConnect = async (receiverId) => {
    try {
      await networkingService.sendConnection(receiverId);
      toast.success('Connection request sent!');
      await fetchDirectory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send request');
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await networkingService.acceptRequest(requestId);
      toast.success('Request accepted!');
      if (activeTab === 'requests') await fetchRequests();
      else await fetchDirectory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not accept');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await networkingService.rejectRequest(requestId);
      toast.success('Request rejected');
      if (activeTab === 'requests') await fetchRequests();
      else await fetchDirectory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject');
    }
  };

  const handleCollaborate = async (receiverId, projectTitle, description) => {
    try {
      await networkingService.sendCollaboration(receiverId, projectTitle, description);
      toast.success('Collaboration proposal sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send proposal');
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStateFilter('All');
    setCurrentPage(1);
  };

  // ── Filtering & Pagination (directory tabs) ──────────────────────────────────
  const getFilteredUsers = () => {
    let users = directoryUsers;

    // Filter by role tab
    if (activeTab === 'entrepreneurs') users = users.filter(u => u.role === 'user');
    else if (activeTab === 'mentors') users = users.filter(u => u.role === 'mentor');

    // Search
    if (search) {
      const term = search.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        (u.profile?.bio && u.profile.bio.toLowerCase().includes(term)) ||
        (u.profile?.skills && u.profile.skills.some(s => s.toLowerCase().includes(term)))
      );
    }

    // State filter
    if (stateFilter !== 'All') {
      users = users.filter(u => u.profile?.location && u.profile.location.toLowerCase().includes(stateFilter.toLowerCase()));
    }

    return users;
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalIncoming = (requests.connectionRequests?.length || 0) + (requests.collaborationRequestsReceived?.length || 0);

  // ── Tab content ─────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return <LoadingState message={`Loading ${activeTab}...`} />;
    if (error) return <ErrorState title="Something went wrong" message={error} onRetry={() => {
      if (activeTab === 'entrepreneurs' || activeTab === 'mentors') fetchDirectory();
      else if (activeTab === 'connections') fetchConnections();
      else fetchRequests();
    }} />;

    // ── Directory tabs ─────────────────────────────────────────────────────────
    if (activeTab === 'entrepreneurs' || activeTab === 'mentors') {
      if (paginatedUsers.length === 0) {
        return (
          <EmptyState
            icon={Users}
            title={`No ${activeTab === 'entrepreneurs' ? 'Entrepreneurs' : 'Mentors'} Found`}
            message="Try adjusting your search or filter criteria to discover more people on EntreSkill Hub."
            onReset={handleResetFilters}
          />
        );
      }
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedUsers.map(user => (
              <ConnectionCard
                key={user._id}
                user={user}
                onConnect={handleConnect}
                onAccept={handleAccept}
                onReject={handleReject}
                onCollaborate={setCollaborateTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      );
    }

    // ── Connections tab ────────────────────────────────────────────────────────
    if (activeTab === 'connections') {
      if (connections.length === 0) {
        return (
          <EmptyState
            icon={Link2}
            title="No Connections Yet"
            message="Start building your network! Browse the Entrepreneur and Mentor directories and send connection requests."
          />
        );
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {connections.map(c => (
            <ConnectionCard
              key={c.connectionId}
              user={{ ...c.contact, connectionStatus: 'connected', connectionId: c.connectionId }}
              onConnect={handleConnect}
              onAccept={handleAccept}
              onReject={handleReject}
              onCollaborate={setCollaborateTarget}
            />
          ))}
        </div>
      );
    }

    // ── Requests tab ───────────────────────────────────────────────────────────
    if (activeTab === 'requests') {
      const noData =
        !requests.connectionRequests?.length &&
        !requests.collaborationRequestsReceived?.length &&
        !requests.collaborationRequestsSent?.length;

      if (noData) {
        return (
          <EmptyState
            icon={Inbox}
            title="No Requests"
            message="Your inbox is empty. When others connect or propose collaboration, requests will appear here."
          />
        );
      }

      return (
        <div className="space-y-8">
          {/* Incoming connection requests */}
          {requests.connectionRequests?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Link2 className="w-3.5 h-3.5" />
                <span>Incoming Connection Requests ({requests.connectionRequests.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {requests.connectionRequests.map(req => (
                  <ConnectionCard
                    key={req._id}
                    user={{ ...req.senderId, connectionStatus: 'pending_received', connectionId: req._id }}
                    onConnect={handleConnect}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onCollaborate={setCollaborateTarget}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Received collaboration proposals */}
          {requests.collaborationRequestsReceived?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Collaboration Proposals Received ({requests.collaborationRequestsReceived.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {requests.collaborationRequestsReceived.map(collab => (
                  <CollaborationCard
                    key={collab._id}
                    collab={collab}
                    mode="received"
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sent collaboration proposals */}
          {requests.collaborationRequestsSent?.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Collaboration Proposals Sent ({requests.collaborationRequestsSent.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {requests.collaborationRequestsSent.map(collab => (
                  <CollaborationCard
                    key={collab._id}
                    collab={collab}
                    mode="sent"
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }
  };

  const isDirectoryTab = activeTab === 'entrepreneurs' || activeTab === 'mentors';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors space-x-1 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-500/10 rounded-full blur-[100px] -z-10" />
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-secondary-600 to-primary-500 text-white flex items-center justify-center shadow-md shadow-secondary-500/20">
              <Network className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-secondary-600 dark:text-secondary-400 uppercase tracking-widest">Sprint 3 · Part 4</span>
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Networking Hub
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Build your entrepreneurial network. Connect with fellow founders and mentors, and propose business collaborations.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Connections', value: connections.length || '—', color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Pending Requests', value: totalIncoming || '—', color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Platform Members', value: directoryUsers.length || '—', color: 'text-primary-600 dark:text-primary-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 shadow-sm text-center">
              <div className={`font-outfit text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === 'requests' && totalIncoming > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-xs font-bold transition-all cursor-pointer rounded-t-xl flex items-center space-x-1.5 border-b-2 ${
                  isActive
                    ? 'border-primary-600 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {showBadge && (
                  <span className="ml-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {totalIncoming}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters (only for directory tabs) */}
        {isDirectoryTab && (
          <div className="bg-white dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                />
              </div>
              {/* State filter */}
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none text-slate-700 dark:text-slate-300 focus:outline-none pr-3 font-semibold"
                >
                  {STATES.map(s => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900">{s === 'All' ? 'All States' : s}</option>
                  ))}
                </select>
              </div>
              {/* Result count */}
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-semibold px-2">
                {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div>{renderContent()}</div>

      </div>

      {/* Collaboration Modal */}
      {collaborateTarget && (
        <CollaborationModal
          targetUser={collaborateTarget}
          onClose={() => setCollaborateTarget(null)}
          onSubmit={handleCollaborate}
        />
      )}
    </div>
  );
};

export default NetworkingPage;
