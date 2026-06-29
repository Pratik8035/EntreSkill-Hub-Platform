// src/hooks/useExecutionDashboard.js
// Sprint 8 — Dashboard summary + analytics combined

import { useState, useEffect, useCallback } from 'react';
import businessExecutionService from '../services/businessExecutionService';

const useExecutionDashboard = () => {
  const [summary, setSummary]     = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [kpis, setKpis]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, analyticsRes, kpiRes] = await Promise.all([
        businessExecutionService.getDashboardSummary(),
        businessExecutionService.getAnalytics(),
        businessExecutionService.getKPIs(),
      ]);
      setSummary(sumRes.data || null);
      setAnalytics(analyticsRes.data || null);
      setKpis(kpiRes.data || []);
    } catch (err) {
      const status = err.response?.status;
      setError({
        status,
        message: err.response?.data?.message || 'Failed to load execution dashboard.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { summary, analytics, kpis, loading, error, refetch: fetchAll };
};

export default useExecutionDashboard;
