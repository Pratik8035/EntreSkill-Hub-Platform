// Sprint 12 — useIncome hook
import { useState, useEffect, useCallback } from 'react';
import { listIncome, createIncome, updateIncome, deleteIncome } from '../services/financeService';

export default function useIncome(params = {}) {
  const [data, setData] = useState({ income: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (p = params) => {
    try {
      setLoading(true);
      setError(null);
      const res = await listIncome(p);
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load income records');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const add = useCallback(async (formData) => {
    const result = await createIncome(formData);
    await fetch();
    return result;
  }, [fetch]);

  const update = useCallback(async (id, formData) => {
    const result = await updateIncome(id, formData);
    await fetch();
    return result;
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await deleteIncome(id);
    await fetch();
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, fetch, add, update, remove };
}
