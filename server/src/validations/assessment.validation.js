const { z } = require('zod');

// ─── User Skill Schema ────────────────────────────────────────────────────────
// Validates a single skill entry
const UserSkillItemSchema = z.object({
  skillId: z
    .string({ required_error: 'skillId is required.' })
    .min(1, 'skillId cannot be empty.'),
  proficiencyLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'], {
      errorMap: () => ({ message: "proficiencyLevel must be 'Beginner', 'Intermediate', or 'Advanced'." }),
    })
    .default('Beginner'),
});

// POST /api/users/skills — array of skills
const SaveUserSkillsSchema = z.object({
  skills: z
    .array(UserSkillItemSchema)
    .min(1, 'Please select at least one skill.'),
});

// ─── User Interest Schema ─────────────────────────────────────────────────────
const UserInterestItemSchema = z.object({
  interestId: z
    .string({ required_error: 'interestId is required.' })
    .min(1, 'interestId cannot be empty.'),
  preferenceWeight: z
    .number()
    .int()
    .min(1, 'preferenceWeight must be between 1 and 5.')
    .max(5, 'preferenceWeight must be between 1 and 5.')
    .default(3),
});

const SaveUserInterestsSchema = z.object({
  interests: z
    .array(UserInterestItemSchema)
    .min(1, 'Please select at least one interest.'),
});

// ─── Full Assessment Submission Schema ────────────────────────────────────────
// Used by POST /api/assessment to batch-save everything at once
const SubmitAssessmentSchema = z.object({
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Experienced'], {
    errorMap: () => ({ message: "experienceLevel must be 'Beginner', 'Intermediate', or 'Experienced'." }),
  }),
  skills: z.array(UserSkillItemSchema).min(1, 'Please select at least one skill.'),
  interests: z.array(UserInterestItemSchema).min(1, 'Please select at least one interest.'),
});

// ─── Experience Update Schema ─────────────────────────────────────────────────
const UpdateExperienceSchema = z.object({
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Experienced'], {
    errorMap: () => ({ message: "experienceLevel must be 'Beginner', 'Intermediate', or 'Experienced'." }),
  }),
});

// ─── Partial Assessment Update Schema ────────────────────────────────────────
// Used by PUT /api/assessment — all fields optional to support partial/draft updates.
const UpdateAssessmentSchema = z.object({
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Experienced'], {
    errorMap: () => ({ message: "experienceLevel must be 'Beginner', 'Intermediate', or 'Experienced'." }),
  }).optional(),
  skills: z.array(UserSkillItemSchema).optional(),
  interests: z.array(UserInterestItemSchema).optional(),
});

module.exports = {
  SaveUserSkillsSchema,
  SaveUserInterestsSchema,
  SubmitAssessmentSchema,
  UpdateExperienceSchema,
  UpdateAssessmentSchema,
};
