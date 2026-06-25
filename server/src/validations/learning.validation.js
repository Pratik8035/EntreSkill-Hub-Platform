const { z } = require('zod');

// ─── Course Schemas ───────────────────────────────────────────────────────────

const CreateCourseSchema = z.object({
  title: z
    .string({ required_error: 'Course title is required.' })
    .trim()
    .min(3, 'Course title must be at least 3 characters long.')
    .max(200, 'Course title cannot exceed 200 characters.'),

  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters.')
    .optional(),

  category: z
    .enum(['Entrepreneurship', 'Business Planning', 'Digital Marketing', 'Financial Management', 'Government Schemes', 'Other'], {
      errorMap: () => ({ message: 'Invalid category.' }),
    })
    .optional(),

  difficultyLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'], {
      errorMap: () => ({ message: 'Invalid difficulty level.' }),
    })
    .optional()
    .default('Beginner'),

  thumbnail: z
    .string()
    .url('Thumbnail must be a valid URL.')
    .optional(),

  estimatedDuration: z
    .number()
    .int('Duration must be an integer.')
    .positive('Duration must be positive.')
    .optional(),

  isPublished: z
    .boolean()
    .optional()
    .default(false),
});

const UpdateCourseSchema = CreateCourseSchema.partial();

// ─── Module Schemas ────────────────────────────────────────────────────────────

const CreateModuleSchema = z.object({
  courseId: z
    .string({ required_error: 'Course ID is required.' })
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: 'Invalid course ID format.',
    }),

  title: z
    .string({ required_error: 'Module title is required.' })
    .trim()
    .min(3, 'Module title must be at least 3 characters long.')
    .max(200, 'Module title cannot exceed 200 characters.'),

  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters.')
    .optional(),

  order: z
    .number({ required_error: 'Order is required.' })
    .int('Order must be an integer.')
    .positive('Order must be positive.'),
});

const UpdateModuleSchema = CreateModuleSchema.partial();

// ─── Lesson Schemas ───────────────────────────────────────────────────────────

const CreateLessonSchema = z.object({
  moduleId: z
    .string({ required_error: 'Module ID is required.' })
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: 'Invalid module ID format.',
    }),

  title: z
    .string({ required_error: 'Lesson title is required.' })
    .trim()
    .min(3, 'Lesson title must be at least 3 characters long.')
    .max(200, 'Lesson title cannot exceed 200 characters.'),

  content: z
    .string()
    .trim()
    .max(10000, 'Content cannot exceed 10000 characters.')
    .optional(),

  videoUrl: z
    .string()
    .url('Video URL must be a valid URL.')
    .optional(),

  duration: z
    .number()
    .int('Duration must be an integer.')
    .positive('Duration must be positive.')
    .optional(),

  order: z
    .number({ required_error: 'Order is required.' })
    .int('Order must be an integer.')
    .positive('Order must be positive.'),
});

const UpdateLessonSchema = CreateLessonSchema.partial();

// ─── Quiz Schemas ─────────────────────────────────────────────────────────────

const QuizQuestionSchema = z.object({
  question: z
    .string({ required_error: 'Question is required.' })
    .trim()
    .min(5, 'Question must be at least 5 characters long.')
    .max(500, 'Question cannot exceed 500 characters.'),

  options: z
    .array(z.string().trim().min(1).max(200))
    .min(2, 'At least 2 options are required.')
    .max(6, 'Maximum 6 options allowed.'),

  correctAnswer: z
    .number({ required_error: 'Correct answer index is required.' })
    .int('Correct answer must be an integer.')
    .min(0, 'Correct answer index must be non-negative.'),
});

const CreateQuizSchema = z.object({
  lessonId: z
    .string({ required_error: 'Lesson ID is required.' })
    .refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
      message: 'Invalid lesson ID format.',
    }),

  title: z
    .string({ required_error: 'Quiz title is required.' })
    .trim()
    .min(3, 'Quiz title must be at least 3 characters long.')
    .max(200, 'Quiz title cannot exceed 200 characters.'),

  questions: z
    .array(QuizQuestionSchema)
    .min(1, 'At least 1 question is required.')
    .max(20, 'Maximum 20 questions allowed.'),
});

const UpdateQuizSchema = CreateQuizSchema.partial();

// ─── Query Schemas ─────────────────────────────────────────────────────────────

const CourseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100)),

  category: z
    .string()
    .optional(),

  difficultyLevel: z
    .string()
    .optional(),

  isPublished: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

module.exports = {
  CreateCourseSchema,
  UpdateCourseSchema,
  CreateModuleSchema,
  UpdateModuleSchema,
  CreateLessonSchema,
  UpdateLessonSchema,
  CreateQuizSchema,
  UpdateQuizSchema,
  CourseQuerySchema,
};
