// src/__tests__/unit/services/goalService.test.js
// Unit tests for GoalService — Sprint 8 Phase 1

const GoalService = require('../../../services/goalService');
const BusinessGoal = require('../../../models/BusinessGoal');
const mongoose = require('mongoose');

describe('GoalService', () => {
  let userId;
  let goalId;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await BusinessGoal.deleteMany({});
  });

  describe('listGoals', () => {
    it('should return an empty array when no goals exist', async () => {
      const goals = await GoalService.listGoals(userId);
      expect(goals).toEqual([]);
    });

    it('should return goals for a specific user', async () => {
      const goalData = {
        userId,
        title: 'Test Goal',
        description: 'Test description',
        targetDate: new Date('2026-12-31'),
        status: 'Not Started',
        priority: 'High',
      };
      await BusinessGoal.create(goalData);

      const goals = await GoalService.listGoals(userId);
      expect(goals).toHaveLength(1);
      expect(goals[0].title).toBe('Test Goal');
    });

    it('should not return goals from other users', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      
      await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      await BusinessGoal.create({
        userId,
        title: 'My Goal',
        targetDate: new Date('2026-12-31'),
      });

      const goals = await GoalService.listGoals(userId);
      expect(goals).toHaveLength(1);
      expect(goals[0].title).toBe('My Goal');
    });
  });

  describe('getGoalById', () => {
    it('should return a goal by ID', async () => {
      const goal = await BusinessGoal.create({
        userId,
        title: 'Test Goal',
        targetDate: new Date('2026-12-31'),
      });
      goalId = goal._id;

      const foundGoal = await GoalService.getGoalById(goalId, userId);
      expect(foundGoal).toBeDefined();
      expect(foundGoal.title).toBe('Test Goal');
    });

    it('should throw 404 error when goal not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(GoalService.getGoalById(nonExistentId, userId)).rejects.toThrow('Goal not found');
    });

    it('should throw 404 error when goal belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const goal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      await expect(GoalService.getGoalById(goal._id, userId)).rejects.toThrow('Goal not found');
    });
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'New Goal',
        description: 'New description',
        targetDate: new Date('2026-12-31'),
        status: 'In Progress',
        priority: 'Medium',
      };

      const goal = await GoalService.createGoal(goalData, userId);
      expect(goal).toBeDefined();
      expect(goal.title).toBe('New Goal');
      expect(goal.userId.toString()).toBe(userId.toString());
    });

    it('should set default values for optional fields', async () => {
      const goalData = {
        title: 'Minimal Goal',
        targetDate: new Date('2026-12-31'),
      };

      const goal = await GoalService.createGoal(goalData, userId);
      expect(goal.status).toBe('Not Started');
      expect(goal.priority).toBe('Medium');
    });
  });

  describe('updateGoal', () => {
    it('should update an existing goal', async () => {
      const goal = await BusinessGoal.create({
        userId,
        title: 'Original Title',
        targetDate: new Date('2026-12-31'),
      });
      goalId = goal._id;

      const updateData = {
        title: 'Updated Title',
        status: 'Completed',
      };

      const updatedGoal = await GoalService.updateGoal(goalId, updateData, userId);
      expect(updatedGoal.title).toBe('Updated Title');
      expect(updatedGoal.status).toBe('Completed');
    });

    it('should throw 404 error when goal not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      await expect(GoalService.updateGoal(nonExistentId, { title: 'Updated' }, userId)).rejects.toThrow('Goal not found');
    });

    it('should throw 404 error when goal belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const goal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      await expect(GoalService.updateGoal(goal._id, { title: 'Updated' }, userId)).rejects.toThrow('Goal not found');
    });
  });
});
