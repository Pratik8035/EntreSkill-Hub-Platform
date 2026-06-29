// src/hooks/useGoalDetails.js
// Sprint 8 — Goal detail with milestones, tasks, progress

import { useState, useEffect, useCallback } from 'react';
import businessExecutionService from '../services/businessExecutionService';
import toast from 'react-hot-toast';

const useGoalDetails = (goalId) => {
  const [goal, setGoal]             = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [progress, setProgress]     = useState(null);
  const [tasks, setTasks]           = useState({});   // milestoneId → Task[]
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const fetchAll = useCallback(async () => {
    if (!goalId) return;
    setLoading(true);
    setError(null);
    try {
      const [goalRes, msRes, progRes] = await Promise.all([
        businessExecutionService.getGoalById(goalId),
        businessExecutionService.getMilestones(goalId),
        businessExecutionService.getGoalProgress(goalId),
      ]);
      setGoal(goalRes.data);
      setMilestones(msRes.data || []);
      setProgress(progRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goal details.');
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchTasksForMilestone = async (milestoneId) => {
    try {
      const res = await businessExecutionService.getTasks(milestoneId);
      setTasks((prev) => ({ ...prev, [milestoneId]: res.data || [] }));
    } catch { /* silent */ }
  };

  const createMilestone = async (data) => {
    const res = await businessExecutionService.createMilestone({ ...data, goalId });
    setMilestones((prev) => [...prev, res.data]);
    toast.success('Milestone added');
    return res.data;
  };

  const completeMilestone = async (milestoneId) => {
    const res = await businessExecutionService.completeMilestone(milestoneId);
    setMilestones((prev) => prev.map((m) => (m._id === milestoneId ? res.data : m)));
    toast.success('Milestone completed');
    await fetchAll();
  };

  const createTask = async (milestoneId, data) => {
    const res = await businessExecutionService.createTask({ ...data, milestoneId });
    setTasks((prev) => ({
      ...prev,
      [milestoneId]: [...(prev[milestoneId] || []), res.data],
    }));
    toast.success('Task added');
    return res.data;
  };

  const completeTask = async (taskId, milestoneId) => {
    const res = await businessExecutionService.completeTask(taskId);
    setTasks((prev) => ({
      ...prev,
      [milestoneId]: (prev[milestoneId] || []).map((t) =>
        t._id === taskId ? res.data : t
      ),
    }));
    toast.success('Task completed');
    // Refresh progress
    const progRes = await businessExecutionService.getGoalProgress(goalId);
    setProgress(progRes.data);
  };

  return {
    goal, milestones, progress, tasks, loading, error,
    refetch: fetchAll,
    fetchTasksForMilestone,
    createMilestone, completeMilestone,
    createTask, completeTask,
  };
};

export default useGoalDetails;
