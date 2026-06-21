import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import ChatSidebar from '../../components/ai/ChatSidebar';
import ChatMessage from '../../components/ai/ChatMessage';
import ChatInput from '../../components/ai/ChatInput';
import TypingIndicator from '../../components/ai/TypingIndicator';
import SuggestedQuestions from '../../components/ai/SuggestedQuestions';
import { Rocket, BrainCircuit } from 'lucide-react';
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
      <ChatSidebar
        sessions={sessions}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
      />

      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50">
        {loadingSessions ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-slate-500 animate-pulse text-sm font-medium">Loading mentor workspace...</div>
          </div>
        ) : (
          <>
            {currentSession && (
              <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-outfit text-base font-bold text-slate-800">{currentSession.title}</h2>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                      <span>AI Mentor Online</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-slate-500 animate-pulse text-xs">Retrieving conversation context...</div>
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
                    <h1 className="font-outfit text-2xl font-extrabold text-slate-900 tracking-tight">
                      EntreSkill AI Mentor
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Consult our specialized AI advisor to refine your startup strategy, understand local laws, or perform cost-benefit analysis.
                    </p>
                  </div>

                  <SuggestedQuestions onSelect={handleSendMessage} />
                </div>
              )}
            </div>

            <div className="bg-white border-t border-slate-100 p-4 shadow-md shrink-0">
              <div className="max-w-4xl mx-auto">
                <ChatInput onSend={handleSendMessage} disabled={sending} />
                <p className="text-[10px] text-slate-400 text-center mt-2.5">
                  AI Mentor leverages Llama-3/Gemini reasoning. Always verify critical accounting and licensing advice with local authorities.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatPage;
