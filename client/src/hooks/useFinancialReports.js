// Sprint 12 — useFinancialReports hook
import { useState, useEffect, useCallback } from 'react';
import { listFinancialReportTypes, getFinancialReport } from '../services/financeService';

export default function useFinancialReports() {
  const [reportTypes, setReportTypes] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportTypes = useCallback(async () => {
    try {
      setLoadingTypes(true);
      setError(null);
      const data = await listFinancialReportTypes();
      setReportTypes(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load report types');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  const fetchReport = useCallback(async (type) => {
    try {
      setLoadingReport(true);
      setError(null);
      const data = await getFinancialReport(type);
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

  useEffect(() => { fetchReportTypes(); }, [fetchReportTypes]);

  return {
    reportTypes, activeReport,
    loadingTypes, loadingReport,
    error, fetchReportTypes, fetchReport, clearReport,
  };
}
