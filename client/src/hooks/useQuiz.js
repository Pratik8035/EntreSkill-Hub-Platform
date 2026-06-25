// src/hooks/useQuiz.js
// Hook to fetch and manage quiz data

import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/courseService';

const useQuiz = (quizId) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuiz = useCallback(async () => {
    if (!quizId) {
      setQuiz(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await courseService.getQuizById(quizId);
      setQuiz(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view quiz.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to this quiz.' });
      } else if (status === 404) {
        setError({ status: 404, message: 'Quiz not found.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load quiz. Please try again.' });
      }
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  return { quiz, loading, error, refetch: fetchQuiz };
};

export default useQuiz;
