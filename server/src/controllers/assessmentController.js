const UserAssessment = require('../models/UserAssessment');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');
const Skill = require('../models/Skill');
const { sendSuccess } = require('../utils/responseHandler');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Calculate completion percentage and score based on wizard steps
const calculateCompletion = (skillsCount, interestsCount, hasExperience) => {
  let completed = 0;
  if (skillsCount > 0) completed += 33;
  if (interestsCount > 0) completed += 33;
  if (hasExperience) completed += 34;
  return Math.min(completed, 100);
};

const calculateAssessmentScore = (skillsCount, interestsCount, proficiencyLevels) => {
  const proficiencyMap = { Beginner: 1, Intermediate: 2, Advanced: 3 };
  const proficiencyScore = proficiencyLevels.reduce((sum, level) => sum + (proficiencyMap[level] || 1), 0);
  return Math.min((skillsCount * 10) + (interestsCount * 8) + proficiencyScore, 100);
};

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    Submit full assessment (batch: skills + interests + experience)
// @route   POST /api/assessment
// @access  Private
const submitAssessment = async (req, res, next) => {
  try {
    const { experienceLevel, skills, interests } = req.body;
    const userId = req.user._id;

    // 1. Batch upsert skills
    if (skills && skills.length > 0) {
      const skillOps = skills.map(({ skillId, proficiencyLevel }) => ({
        updateOne: {
          filter: { userId, skillId },
          update: { $set: { userId, skillId, proficiencyLevel } },
          upsert: true,
        },
      }));
      await UserSkill.bulkWrite(skillOps);
      // Increment popularity
      await Skill.updateMany({ _id: { $in: skills.map((s) => s.skillId) } }, { $inc: { popularityScore: 1 } });
    }

    // 2. Batch upsert interests
    if (interests && interests.length > 0) {
      const interestOps = interests.map(({ interestId, preferenceWeight }) => ({
        updateOne: {
          filter: { userId, interestId },
          update: { $set: { userId, interestId, preferenceWeight } },
          upsert: true,
        },
      }));
      await UserInterest.bulkWrite(interestOps);
    }

    // 3. Calculate scores
    const userSkills = await UserSkill.find({ userId });
    const userInterests = await UserInterest.find({ userId });
    const proficiencies = userSkills.map((s) => s.proficiencyLevel);
    const completionPercentage = calculateCompletion(userSkills.length, userInterests.length, !!experienceLevel);
    const assessmentScore = calculateAssessmentScore(userSkills.length, userInterests.length, proficiencies);
    const isCompleted = completionPercentage === 100;

    // 4. Upsert the UserAssessment document
    const assessment = await UserAssessment.findOneAndUpdate(
      { userId },
      {
        $set: {
          userId,
          experienceLevel,
          completionPercentage,
          assessmentScore,
          isCompleted,
          lastUpdatedAt: new Date(),
          ...(isCompleted && { completedAt: new Date() }),
        },
      },
      { new: true, upsert: true }
    );

    return sendSuccess(res, assessment, 'Assessment submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's full assessment details
// @route   GET /api/assessment
// @access  Private
const getAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [assessment, userSkills, userInterests] = await Promise.all([
      UserAssessment.findOne({ userId }),
      UserSkill.find({ userId }).populate({
        path: 'skillId',
        select: 'name description tags categoryId',
        populate: { path: 'categoryId', select: 'name icon' },
      }),
      UserInterest.find({ userId }).populate({
        path: 'interestId',
        select: 'name description tags categoryId',
        populate: { path: 'categoryId', select: 'name' },
      }),
    ]);

    return sendSuccess(
      res,
      {
        assessment,
        skills: userSkills,
        interests: userInterests,
      },
      'Assessment retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update assessment (partial update for draft/resume later)
// @route   PUT /api/assessment
// @access  Private
const updateAssessment = async (req, res, next) => {
  try {
    const { experienceLevel, skills, interests } = req.body;
    const userId = req.user._id;

    if (skills && skills.length > 0) {
      const skillOps = skills.map(({ skillId, proficiencyLevel }) => ({
        updateOne: {
          filter: { userId, skillId },
          update: { $set: { proficiencyLevel } },
          upsert: true,
        },
      }));
      await UserSkill.bulkWrite(skillOps);
    }

    if (interests && interests.length > 0) {
      const interestOps = interests.map(({ interestId, preferenceWeight }) => ({
        updateOne: {
          filter: { userId, interestId },
          update: { $set: { preferenceWeight } },
          upsert: true,
        },
      }));
      await UserInterest.bulkWrite(interestOps);
    }

    const userSkills = await UserSkill.find({ userId });
    const userInterests = await UserInterest.find({ userId });
    const proficiencies = userSkills.map((s) => s.proficiencyLevel);
    const completionPercentage = calculateCompletion(userSkills.length, userInterests.length, !!experienceLevel);
    const assessmentScore = calculateAssessmentScore(userSkills.length, userInterests.length, proficiencies);
    const isCompleted = completionPercentage === 100;

    const assessment = await UserAssessment.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(experienceLevel && { experienceLevel }),
          completionPercentage,
          assessmentScore,
          isCompleted,
          lastUpdatedAt: new Date(),
          ...(isCompleted && { completedAt: new Date() }),
        },
      },
      { new: true, upsert: true }
    );

    return sendSuccess(res, assessment, 'Assessment updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get lightweight assessment status for redirect logic
// @route   GET /api/assessment/status
// @access  Private
const getAssessmentStatus = async (req, res, next) => {
  try {
    const assessment = await UserAssessment.findOne({ userId: req.user._id }).select(
      'isCompleted completionPercentage experienceLevel lastUpdatedAt'
    );

    return sendSuccess(
      res,
      {
        isCompleted: assessment?.isCompleted ?? false,
        completionPercentage: assessment?.completionPercentage ?? 0,
        experienceLevel: assessment?.experienceLevel ?? null,
        lastUpdatedAt: assessment?.lastUpdatedAt ?? null,
      },
      'Assessment status retrieved'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAssessment,
  getAssessment,
  updateAssessment,
  getAssessmentStatus,
};
