// src/validations/businessExecution.validation.js
// Zod validation schemas for Business Execution Tracking — Sprint 8 Phase 1

const { z } = require('zod');

// BusinessGoal validation schema
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date format',
  }),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date format',
  }).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

// Milestone validation schema
const createMilestoneSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date format',
  }),
  completed: z.boolean().optional(),
});

const updateMilestoneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  targetDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid target date format',
  }).optional(),
  completed: z.boolean().optional(),
});

// Task validation schema
const createTaskSchema = z.object({
  milestoneId: z.string().min(1, 'Milestone ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  assignedTo: z.string().max(100, 'Assigned to cannot exceed 100 characters').optional(),
});

// KPI validation schema
const createKPISchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters'),
  targetValue: z.number('Target value must be a number').positive('Target value must be positive'),
  currentValue: z.number('Current value must be a number').min(0, 'Current value cannot be negative').optional(),
  unit: z.string().max(50, 'Unit cannot exceed 50 characters').optional(),
});

const updateKPISchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name cannot exceed 200 characters').optional(),
  targetValue: z.number('Target value must be a number').positive('Target value must be positive').optional(),
  currentValue: z.number('Current value must be a number').min(0, 'Current value cannot be negative').optional(),
  unit: z.string().max(50, 'Unit cannot exceed 50 characters').optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  assignedTo: z.string().max(100, 'Assigned to cannot exceed 100 characters').optional(),
});

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  createTaskSchema,
  updateTaskSchema,
  createKPISchema,
  updateKPISchema,
};
