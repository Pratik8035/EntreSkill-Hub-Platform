'use strict';
// src/services/milestoneService.js — Sprint 8 Phase 1

const Milestone    = require('../models/Milestone');
const BusinessGoal = require('../models/BusinessGoal');
const AppError     = require('../utils/AppError');

class MilestoneService {

  static async listMilestones(goalId, userId) {
    const goal = await BusinessGoal.findOne({ _id: goalId, userId });
    if (!goal) throw new AppError('Goal not found', 404);
    return Milestone.find({ goalId }).sort({ targetDate: 1 });
  }

  static async createMilestone(milestoneData, userId) {
    const goal = await BusinessGoal.findOne({ _id: milestoneData.goalId, userId });
    if (!goal) throw new AppError('Goal not found', 404);
    const milestone = new Milestone(milestoneData);
    await milestone.save();
    return milestone;
  }

  static async updateMilestone(milestoneId, updateData, userId) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId, userId });
    if (!goal)      throw new AppError('Milestone not found', 404);
    Object.assign(milestone, updateData);
    await milestone.save();
    return milestone;
  }

  static async completeMilestone(milestoneId, userId) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) throw new AppError('Milestone not found', 404);
    const goal = await BusinessGoal.findOne({ _id: milestone.goalId, userId });
    if (!goal)      throw new AppError('Milestone not found', 404);
    milestone.completed   = true;
    milestone.completedAt = new Date();
    await milestone.save();
    return milestone;
  }
}

module.exports = MilestoneService;
