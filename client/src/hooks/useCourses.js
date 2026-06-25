// src/hooks/useCourses.js
// Hook to fetch and manage courses data

import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/courseService';

const useCourses = (params = {}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await courseService.getCourses(params);
      setCourses(data.courses || []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view courses.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to courses.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load courses. Please try again.' });
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

export default useCourses;
