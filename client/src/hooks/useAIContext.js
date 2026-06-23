// src/hooks/useAIContext.js
// Hook to fetch and manage AI session context data

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useAIContext = (sessionId) => {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContext = useCallback(async () => {
    if (!sessionId) {
      setContext(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/ai/sessions/${sessionId}/context`);
      const data = response.data;
      setContext(data.data || data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view context.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to this session.' });
      } else if (status === 404) {
        setError({ status: 404, message: 'Session context not found.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load context. Please try again.' });
      }
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return { context, loading, error, refetch: fetchContext };
};

export default useAIContext;
