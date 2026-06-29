// src/hooks/useBusinessGoals.js
// Sprint 8 — Goals list + CRUD actions

import { useState, useEffect, useCallback } from 'react';
import businessExecutionService from '../services/businessExecutionService';
import toast from 'react-hot-toast';

const useBusinessGoals = () => {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessExecutionService.getGoals();
      setGoals(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const createGoal = async (data) => {
    const res = await businessExecutionService.createGoal(data);
    setGoals((prev) => [res.data, ...prev]);
    toast.success('Goal created');
    return res.data;
  };

  const updateGoal = async (id, data) => {
    const res = await businessExecutionService.updateGoal(id, data);
    setGoals((prev) => prev.map((g) => (g._id === id ? res.data : g)));
    toast.success('Goal updated');
    return res.data;
  };

  const deleteGoal = async (id) => {
    await businessExecutionService.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g._id !== id));
    toast.success('Goal deleted');
  };

  return { goals, loading, error, refetch: fetchGoals, createGoal, updateGoal, deleteGoal };
};

export default useBusinessGoals;
