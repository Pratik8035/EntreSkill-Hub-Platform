// src/__tests__/unit/services/taskService.test.js
// Unit tests for TaskService — Sprint 8 Phase 1

const TaskService = require('../../../services/taskService');
const Task = require('../../../models/Task');
const Milestone = require('../../../models/Milestone');
const BusinessGoal = require('../../../models/BusinessGoal');
const mongoose = require('mongoose');

describe('TaskService', () => {
  let userId;
  let goalId;
  let milestoneId;

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

    const milestone = await Milestone.create({
      goalId,
      title: 'Test Milestone',
      targetDate: new Date('2026-12-31'),
    });
    milestoneId = milestone._id;
  });

  afterEach(async () => {
    await Task.deleteMany({});
    await Milestone.deleteMany({});
    await BusinessGoal.deleteMany({});
  });

  describe('listTasks', () => {
    it('should return an empty array when no tasks exist', async () => {
      const tasks = await TaskService.listTasks(milestoneId, userId);
      expect(tasks).toEqual([]);
    });

    it('should return tasks for a specific milestone', async () => {
      await Task.create({
        milestoneId,
        title: 'Test Task',
        dueDate: new Date('2026-12-31'),
      });

      const tasks = await TaskService.listTasks(milestoneId, userId);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Test Task');
    });

    it('should throw 404 error when milestone not found', async () => {
      const nonExistentMilestoneId = new mongoose.Types.ObjectId();
      
      await expect(TaskService.listTasks(nonExistentMilestoneId, userId)).rejects.toThrow('Milestone not found');
    });

    it('should throw 404 error when milestone belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const otherGoal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      const otherMilestone = await Milestone.create({
        goalId: otherGoal._id,
        title: 'Other Milestone',
        targetDate: new Date('2026-12-31'),
      });

      await expect(TaskService.listTasks(otherMilestone._id, userId)).rejects.toThrow('Goal not found');
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        milestoneId,
        title: 'New Task',
        description: 'New description',
        dueDate: new Date('2026-12-31'),
      };

      const task = await TaskService.createTask(taskData, userId);
      expect(task).toBeDefined();
      expect(task.title).toBe('New Task');
      expect(task.milestoneId.toString()).toBe(milestoneId.toString());
    });

    it('should set default values for optional fields', async () => {
      const taskData = {
        milestoneId,
        title: 'Minimal Task',
        dueDate: new Date('2026-12-31'),
      };

      const task = await TaskService.createTask(taskData, userId);
      expect(task.status).toBe('Pending');
      expect(task.completedAt).toBeNull();
    });

    it('should throw 404 error when milestone not found', async () => {
      const nonExistentMilestoneId = new mongoose.Types.ObjectId();
      const taskData = {
        milestoneId: nonExistentMilestoneId,
        title: 'Test Task',
        dueDate: new Date('2026-12-31'),
      };

      await expect(TaskService.createTask(taskData, userId)).rejects.toThrow('Milestone not found');
    });

    it('should throw 404 error when milestone belongs to different user', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      const otherGoal = await BusinessGoal.create({
        userId: otherUserId,
        title: 'Other User Goal',
        targetDate: new Date('2026-12-31'),
      });

      const otherMilestone = await Milestone.create({
        goalId: otherGoal._id,
        title: 'Other Milestone',
        targetDate: new Date('2026-12-31'),
      });

      const taskData = {
        milestoneId: otherMilestone._id,
        title: 'Test Task',
        dueDate: new Date('2026-12-31'),
      };

      await expect(TaskService.createTask(taskData, userId)).rejects.toThrow('Goal not found');
    });
  });
});
