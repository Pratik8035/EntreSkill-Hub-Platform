// Sprint 12 — useFinancialAdvisor hook
import { useState, useCallback } from 'react';
import { getFinancialAdvice } from '../services/financeService';

export default function useFinancialAdvisor() {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAdvice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFinancialAdvice();
      setAdvice(data);
      return data;
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to get financial advice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAdvice = useCallback(() => {
    setAdvice(null);
    setError(null);
  }, []);

  return { advice, loading, error, fetchAdvice, clearAdvice };
}
