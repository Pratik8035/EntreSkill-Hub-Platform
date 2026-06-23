import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import useAIContext from '../../hooks/useAIContext';
import ChatSidebar from '../../components/ai/ChatSidebar';
import ChatMessage from '../../components/ai/ChatMessage';
import ChatInput from '../../components/ai/ChatInput';
import TypingIndicator from '../../components/ai/TypingIndicator';
import SuggestedQuestions from '../../components/ai/SuggestedQuestions';
import ContextPanel from '../../components/ai/ContextPanel';
import { Rocket, BrainCircuit, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AIChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessIdeaId = searchParams.get('businessIdeaId');

  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Context panel: open state for mobile drawer
  const [contextOpen, setContextOpen] = useState(false);

  // AI context hook
  const { context, loading: contextLoading, error: contextError, refetch: refetchContext } = useAIContext(sessionId);

  const messagesEndRef = useRef(null);
  const sessionsLoadedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const loadMessages = async (id) => {
    try {
      setLoadingMessages(true);
      const res = await aiService.getMessages(id, 1, 100);
      setMessages(res.data?.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const activateSession = async (id, loadedSessions) => {
    const sessionDetail = loadedSessions.find((s) => s._id === id);
    if (sessionDetail) {
      setCurrentSession(sessionDetail);
      await loadMessages(id);
      return;
    }

    try {
      const detailRes = await aiService.getSessionDetails(id);
      setCurrentSession(detailRes.data);
      await loadMessages(id);
    } catch (err) {
      toast.error('Chat session not found');
      if (loadedSessions.length > 0) {
        navigate(`/ai-mentor/${loadedSessions[0]._id}`, { replace: true });
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initSessions = async () => {
      try {
        setLoadingSessions(true);
        const res = await aiService.getSessions();
        if (cancelled) return;

        const loadedSessions = res.data || [];
        setSessions(loadedSessions);
        sessionsLoadedRef.current = true;

        if (businessIdeaId) {
          const existing = loadedSessions.find(
            (s) => s.businessIdeaId?.toString() === businessIdeaId
          );
          if (existing) {
            navigate(`/ai-mentor/${existing._id}`, { replace: true });
            return;
          }

          const newSessionRes = await aiService.createSession(businessIdeaId);
          if (cancelled) return;

          const newSession = newSessionRes.data;
          setSessions((prev) => [newSession, ...prev]);
          navigate(`/ai-mentor/${newSession._id}`, { replace: true });
          return;
        }

        if (sessionId) {
          await activateSession(sessionId, loadedSessions);
        } else if (loadedSessions.length > 0) {
          navigate(`/ai-mentor/${loadedSessions[0]._id}`, { replace: true });
        }
      } catch (err) {
        toast.error('Failed to load chat history');
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    };

    initSessions();

    return () => {
      cancelled = true;
    };
  }, [businessIdeaId]);

  useEffect(() => {
    if (!sessionId || businessIdeaId || !sessionsLoadedRef.current) return;

    const session = sessions.find((s) => s._id === sessionId);
    if (session) {
      setCurrentSession(session);
    }
    loadMessages(sessionId);
  }, [sessionId]);

  const handleCreateSession = async (ideaId = null) => {
    try {
      const res = await aiService.createSession(ideaId);
      const newSession = res.data;
      setSessions((prev) => [newSession, ...prev]);
      navigate(`/ai-mentor/${newSession._id}`);
      toast.success('New session started');
    } catch (err) {
      toast.error('Failed to start new chat');
    }
  };

  const handleSelectSession = (id) => {
    navigate(`/ai-mentor/${id}`);
    setContextOpen(false);
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    try {
      await aiService.deleteSession(id);
      toast.success('Session deleted');
      const updated = sessions.filter((s) => s._id !== id);
      setSessions(updated);
      if (sessionId === id) {
        if (updated.length > 0) {
          navigate(`/ai-mentor/${updated[0]._id}`);
        } else {
          setCurrentSession(null);
          setMessages([]);
          navigate('/ai-mentor');
        }
      }
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const handleSendMessage = async (text) => {
    if (!sessionId) {
      try {
        setSending(true);
        const res = await aiService.createSession(businessIdeaId || null);
        const newSession = res.data;
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSession(newSession);

        const userMsg = { _id: 'temp-user', role: 'user', content: text, createdAt: new Date() };
        setMessages([userMsg]);

        const msgRes = await aiService.sendMessage(newSession._id, text);
        setMessages([msgRes.data.userMessage, msgRes.data.aiMessage]);
        navigate(`/ai-mentor/${newSession._id}`);
      } catch (err) {
        toast.error('Failed to send message');
      } finally {
        setSending(false);
      }
      return;
    }

    try {
      setSending(true);
      const userMsg = { _id: Date.now().toString(), role: 'user', content: text, createdAt: new Date() };
      setMessages((prev) => [...prev, userMsg]);

      const res = await aiService.sendMessage(sessionId, text);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m._id !== userMsg._id);
        return [...filtered, res.data.userMessage, res.data.aiMessage];
      });

      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId ? { ...s, lastMessage: res.data.aiMessage.content } : s
        )
      );
    } catch (err) {
      toast.error('Failed to get AI mentor response');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-grow flex h-full min-h-0 overflow-hidden">
      {/* ── Left sidebar: session list ─────────────────────────────────────── */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* ── Main chat area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {loadingSessions ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-slate-500 animate-pulse text-sm font-medium">
              Loading mentor workspace...
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            {currentSession && (
              <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-100">
                      {currentSession.title}
                    </h2>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                      <span>AI Mentor Online</span>
                    </p>
                  </div>
                </div>

                {/* Context panel toggle (visible on lg and below) */}
                <button
                  onClick={() => setContextOpen((prev) => !prev)}
                  className="xl:hidden flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-700 dark:hover:text-primary-300 rounded-xl transition-all cursor-pointer"
                  aria-label="Toggle context panel"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Context</span>
                </button>
              </div>
            )}

            {/* Chat body + desktop context panel */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Messages column */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-slate-500 animate-pulse text-xs">
                        Retrieving conversation context...
                      </div>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="max-w-4xl mx-auto space-y-6">
                      {messages.map((message) => (
                        <ChatMessage key={message._id} message={message} />
                      ))}
                      {sending && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center space-y-8 py-10">
                      <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center shadow-lg shadow-primary-100">
                          <Rocket className="w-8 h-8 animate-bounce" />
                        </div>
                        <h1 className="font-outfit text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                          EntreSkill AI Mentor
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                          Consult our specialized AI advisor to refine your startup strategy, understand
                          local laws, or perform cost-benefit analysis.
                        </p>
                      </div>
                      <SuggestedQuestions onSelect={handleSendMessage} />
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 shadow-md shrink-0">
                  <div className="max-w-4xl mx-auto">
                    <ChatInput onSend={handleSendMessage} disabled={sending} />
                    <p className="text-[10px] text-slate-400 text-center mt-2.5">
                      AI Mentor leverages Llama-3/Gemini reasoning. Always verify critical accounting
                      and licensing advice with local authorities.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Desktop context panel (xl+) ─────────────────────────── */}
              <div className="hidden xl:flex w-72 2xl:w-80 flex-col border-l border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 h-full overflow-hidden shrink-0">
                <ContextPanel
                  sessionId={sessionId}
                  context={context}
                  loading={contextLoading}
                  error={contextError}
                  onRefetch={refetchContext}
                />
              </div>

              {/* ── Tablet context panel (md–xl) ────────────────────────── */}
              <div className="hidden md:flex xl:hidden w-56 flex-col border-l border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 h-full overflow-hidden shrink-0">
                <ContextPanel
                  sessionId={sessionId}
                  context={context}
                  loading={contextLoading}
                  error={contextError}
                  onRefetch={refetchContext}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Mobile context drawer (below md) ───────────────────────────────── */}
      {contextOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setContextOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="w-80 max-w-[90vw] bg-white dark:bg-slate-900 h-full overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Session Context
              </span>
              <button
                onClick={() => setContextOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-slate-500 dark:text-slate-400"
                aria-label="Close context panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ContextPanel
                sessionId={sessionId}
                context={context}
                loading={contextLoading}
                error={contextError}
                onRefetch={refetchContext}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatPage;
