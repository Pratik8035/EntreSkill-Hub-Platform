'use strict';
// src/services/taskService.js — Sprint 8 Phase 1

const Task         = require('../models/Task');
const Milestone    = require('../models/Milestone');
const BusinessGoal = require('../models/BusinessGoal');
const AppError     = require('../utils/AppError');

class TaskService {

  static async listTasks(milestoneId, userId) {
    const milestone = await Milestone.findById(milestoneId).populate('goalId');
    if (!milestone || !milestone.goalId) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId._id, userId });
    if (!goal) throw new AppError('Goal not found', 404);
    return Task.find({ milestoneId }).sort({ dueDate: 1 });
  }

  static async createTask(taskData, userId) {
    const milestone = await Milestone.findById(taskData.milestoneId).populate('goalId');
    if (!milestone || !milestone.goalId) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId._id, userId });
    if (!goal) throw new AppError('Goal not found', 404);
    const task = new Task(taskData);
    await task.save();
    return task;
  }

  static async updateTask(taskId, updateData, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    const milestone = await Milestone.findById(task.milestoneId).populate('goalId');
    if (!milestone) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId._id, userId });
    if (!goal) throw new AppError('Task not found', 404);
    Object.assign(task, updateData);
    await task.save();
    return task;
  }

  static async completeTask(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) throw new AppError('Task not found', 404);
    const milestone = await Milestone.findById(task.milestoneId).populate('goalId');
    if (!milestone) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId._id, userId });
    if (!goal) throw new AppError('Task not found', 404);
    task.status      = 'Completed';
    task.completedAt = new Date();
    await task.save();
    // Fire-and-forget progress cascade
    const ProgressEngine = require('./progressEngine');
    ProgressEngine.calculateMilestoneProgress(task.milestoneId)
      .then(() => ProgressEngine.calculateGoalProgress(milestone.goalId._id))
      .catch((err) => console.error('[TaskService] Progress cascade failed:', err.message));
    return task;
  }
}

module.exports = TaskService;
