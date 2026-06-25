// src/hooks/useCourseProgress.js
// Hook to fetch and manage course progress data

import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/courseService';

const useCourseProgress = (courseId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!courseId) {
      setProgress(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await courseService.getCourseProgress(courseId);
      setProgress(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view progress.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to this course.' });
      } else if (status === 404) {
        setError({ status: 404, message: 'Course not found.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load progress. Please try again.' });
      }
      setProgress(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
};

export default useCourseProgress;
