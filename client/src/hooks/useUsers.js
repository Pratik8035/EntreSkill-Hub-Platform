// src/hooks/useUsers.js
// Hook to manage admin user list with search, filter, and pagination

import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useUsers = (initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [params, setParams] = useState({
    search: '',
    role: 'All',
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers(params);
      if (res.success) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } else {
        setError(res.message || 'Failed to load users');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    users,
    total,
    pages,
    loading,
    error,
    params,
    updateParams,
    refetch: fetchUsers,
  };
};

export default useUsers;
