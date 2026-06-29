// src/hooks/useAdminAnalytics.js
// Hook to fetch basic and enhanced admin analytics

import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminAnalytics = (mode = 'basic') => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res =
        mode === 'enhanced'
          ? await adminService.getEnhancedAnalytics()
          : await adminService.getAdminAnalytics();

      if (res.success) {
        setAnalytics(res.data);
      } else {
        setError(res.message || 'Failed to load analytics');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

export default useAdminAnalytics;
