// src/hooks/useFundingAdvisor.js
// Fetches the full funding advisor payload (eligibility + recommendations + AI summary)

import { useState, useEffect, useCallback } from 'react';
import fundingAdvisorService from '../services/fundingAdvisorService';

const useFundingAdvisor = () => {
  const [data, setData]       = useState(null);   // { eligibility, recommendations, advisorSummary }
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fundingAdvisorService.getAdvisor();
      setData(res.data || null);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view your funding advisor.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to this resource.' });
      } else if (status === 404) {
        setError({ status: 404, message: 'Funding advisor data not found.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load funding advisor. Please try again.' });
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useFundingAdvisor;
