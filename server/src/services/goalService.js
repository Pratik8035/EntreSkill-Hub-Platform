'use strict';
// src/services/goalService.js — Sprint 8 Phase 1

const BusinessGoal = require('../models/BusinessGoal');
const AppError     = require('../utils/AppError');

class GoalService {

  static async listGoals(userId) {
    return BusinessGoal.find({ userId }).sort({ priority: -1, createdAt: -1 });
  }

  static async getGoalById(goalId, userId) {
    const goal = await BusinessGoal.findOne({ _id: goalId, userId });
    if (!goal) throw new AppError('Goal not found', 404);
    return goal;
  }

  static async createGoal(goalData, userId) {
    const goal = new BusinessGoal({ ...goalData, userId });
    await goal.save();
    return goal;
  }

  static async updateGoal(goalId, updateData, userId) {
    const goal = await BusinessGoal.findOneAndUpdate(
      { _id: goalId, userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!goal) throw new AppError('Goal not found', 404);
    return goal;
  }

  static async deleteGoal(goalId, userId) {
    const goal = await BusinessGoal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) throw new AppError('Goal not found', 404);

    const Milestone = require('../models/Milestone');
    const Task      = require('../models/Task');
    const milestones    = await Milestone.find({ goalId }).lean();
    const milestoneIds  = milestones.map((m) => m._id);
    await Promise.all([
      Milestone.deleteMany({ goalId }),
      Task.deleteMany({ milestoneId: { $in: milestoneIds } }),
    ]);
    return true;
  }
}

module.exports = GoalService;
