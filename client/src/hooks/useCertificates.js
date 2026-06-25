// src/hooks/useCertificates.js
// Hook to fetch and manage certificates data

import { useState, useEffect, useCallback } from 'react';
import courseService from '../services/courseService';

const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await courseService.getUserCertificates();
      setCertificates(data || []);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError({ status: 401, message: 'Please sign in to view certificates.' });
      } else if (status === 403) {
        setError({ status: 403, message: 'You do not have access to certificates.' });
      } else {
        setError({ status: status || 500, message: 'Failed to load certificates. Please try again.' });
      }
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return { certificates, loading, error, refetch: fetchCertificates };
};

export default useCertificates;
