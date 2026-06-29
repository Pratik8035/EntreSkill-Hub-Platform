import { useState, useEffect, useCallback } from 'react';
import { listReportTypes, getReport } from '../services/reportService';

/**
 * useReports — Sprint 9
 *
 * Manages report types list and on-demand report generation.
 */
export default function useReports() {
  const [reportTypes, setReportTypes] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch report type registry ────────────────────────────────────────────

  const fetchReportTypes = useCallback(async () => {
    try {
      setLoadingTypes(true);
      setError(null);
      const data = await listReportTypes();
      setReportTypes(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load report types');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // ── Generate a specific report ────────────────────────────────────────────

  const fetchReport = useCallback(async (type) => {
    try {
      setLoadingReport(true);
      setError(null);
      const data = await getReport(type);
      setActiveReport(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate report');
      throw err;
    } finally {
      setLoadingReport(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setActiveReport(null);
    setError(null);
  }, []);

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  return {
    reportTypes,
    activeReport,
    loadingTypes,
    loadingReport,
    error,
    fetchReportTypes,
    fetchReport,
    clearReport,
  };
}
