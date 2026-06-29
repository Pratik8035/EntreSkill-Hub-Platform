// Sprint 12 — useInvoices hook
import { useState, useEffect, useCallback } from 'react';
import {
  listInvoices, createInvoice, updateInvoice, deleteInvoice,
  markInvoicePaid, markInvoiceSent, getInvoiceSummary,
} from '../services/financeService';

export default function useInvoices(params = {}) {
  const [data, setData] = useState({ invoices: [], total: 0, page: 1, pages: 1 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (p = params) => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, summaryRes] = await Promise.all([
        listInvoices(p),
        getInvoiceSummary(),
      ]);
      setData(listRes);
      setSummary(summaryRes);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const add = useCallback(async (formData) => {
    const result = await createInvoice(formData);
    await fetch();
    return result;
  }, [fetch]);

  const update = useCallback(async (id, formData) => {
    const result = await updateInvoice(id, formData);
    await fetch();
    return result;
  }, [fetch]);

  const remove = useCallback(async (id) => {
    await deleteInvoice(id);
    await fetch();
  }, [fetch]);

  const markPaid = useCallback(async (id) => {
    const result = await markInvoicePaid(id);
    await fetch();
    return result;
  }, [fetch]);

  const markSent = useCallback(async (id) => {
    const result = await markInvoiceSent(id);
    await fetch();
    return result;
  }, [fetch]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, summary, loading, error, fetch, add, update, remove, markPaid, markSent };
}
