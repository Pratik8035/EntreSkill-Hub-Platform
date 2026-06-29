// Sprint 12 — useBudget hook
import { useState, useEffect, useCallback } from 'react';
import { listBudgets, createBudget, updateBudget, deleteBudget, getBudgetUtilization } from '../services/financeService';

export default function useBudget() {
  const [data, setData] = useState({ budgets: [], total: 0 });
  const [utilization, setUtilization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [budgetsRes, utilRes] = await Promise.all([
        listBudgets(),
        getBudgetUtilization(),
      ]);
      setData(budgetsRes);
      setUtilization(utilRes);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  const add = useCallback(async (formData) => {
    const result = await createBudget(formData);
    await fetch();
    return result;
  }, [fetch]);

  const update = useCallback(async (id, formData) => {
    const result = await updateBudget(id, formData);
    await fetch();
    return result;
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await deleteBudget(id);
    await fetch();
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, utilization, loading, error, fetch, add, update, remove };
}
