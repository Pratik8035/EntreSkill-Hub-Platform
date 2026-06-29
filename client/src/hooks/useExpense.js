// Sprint 12 — useExpense hook
import { useState, useEffect, useCallback } from 'react';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../services/financeService';

export default function useExpense(params = {}) {
  const [data, setData] = useState({ expenses: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (p = params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await listExpenses(p);
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const add = useCallback(async (formData) => {
    const result = await createExpense(formData);
    await fetch();
    return result;
  }, [fetch]);

  const update = useCallback(async (id, formData) => {
    const result = await updateExpense(id, formData);
    await fetch();
    return result;
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await deleteExpense(id);
    await fetch();
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, fetch, add, update, remove };
}
