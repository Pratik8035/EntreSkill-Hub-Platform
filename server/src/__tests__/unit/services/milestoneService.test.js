// src/__tests__/unit/services/milestoneService.test.js
// Unit tests for MilestoneService — Sprint 8 Phase 1

const MilestoneService = require('../../../services/milestoneService');
const Milestone = require('../../../models/Milestone');
const BusinessGoal = require('../../../models/BusinessGoal');
const mongoose = require('mongoose');

describe('MilestoneService', () => {
  let userId;
  let goalId;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    const goal = await BusinessGoal.create({
      userId,
      title: 'Test Goal',
      targetDate: new Date('2026-12-31'),
    });
    goalId = goal._id;
  });

  afterEach(async () => {
    await Milestone.deleteMany({});
    await BusinessGoal.deleteMany({});
  });

  describe('listMilestones', () => {
    it('should return an empty array when no milestones exist', async () => {
      const milestones = await MilestoneService.listMilestones(goalId, userId);
      expect(milestones).toEqual([]);
    });

    it('should return milestones for a specific goal', async () => {
      await Milestone.create({
        goalId,
        title: 'Test Milestone',
        targetDate: new Date('2026-12-31'),
      });

      const milestones = await MilestoneService.listMilestones(goalId, userId);
      expect(milestones).toHaveLength(1);
      expect(milestones[0].title).toBe('Test Milestone');
    });

    it('should throw 404 error when goal not found', async () => {
      const nonExistentGoalId = new mongoose.Types.ObjectId();
      
      await expect(MilestoneService.listMilestones(nonExistentGoalId, userId)).rejects.toThrow('Goal not found');
    });

    it('should throw 404 error when goal belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const otherGoal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      await expect(MilestoneService.listMilestones(otherGoal._id, userId)).rejects.toThrow('Goal not found');
    });
  });

  describe('createMilestone', () => {
    it('should create a new milestone', async () => {
      const milestoneData = {
        goalId,
        title: 'New Milestone',
        description: 'New description',
        targetDate: new Date('2026-12-31'),
      };

      const milestone = await MilestoneService.createMilestone(milestoneData, userId);
      expect(milestone).toBeDefined();
      expect(milestone.title).toBe('New Milestone');
      expect(milestone.goalId.toString()).toBe(goalId.toString());
    });

    it('should set default values for optional fields', async () => {
      const milestoneData = {
        goalId,
        title: 'Minimal Milestone',
        targetDate: new Date('2026-12-31'),
      };

      const milestone = await MilestoneService.createMilestone(milestoneData, userId);
      expect(milestone.completed).toBe(false);
      expect(milestone.completedAt).toBeNull();
    });

    it('should throw 404 error when goal not found', async () => {
      const nonExistentGoalId = new mongoose.Types.ObjectId();
      const milestoneData = {
        goalId: nonExistentGoalId,
        title: 'Test Milestone',
        targetDate: new Date('2026-12-31'),
      };

      await expect(MilestoneService.createMilestone(milestoneData, userId)).rejects.toThrow('Goal not found');
    });

    it('should throw 404 error when goal belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const otherGoal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      const milestoneData = {
        goalId: otherGoal._id,
        title: 'Test Milestone',
        targetDate: new Date('2026-12-31'),
      };

      await expect(MilestoneService.createMilestone(milestoneData, userId)).rejects.toThrow('Goal not found');
    });
  });
});
