const mongoose = require('mongoose');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');
const UserAssessment = require('../models/UserAssessment');
const MentorRequest = require('../models/MentorRequest');
const ChatSession = require('../models/ChatSession');
const { getRecommendationsForUser } = require('./recommendationEngine');

/**
 * Compute user's profile completion progress.
 */
async function getProfileProgress(userId) {
  const [assessment, skillCount, interestCount] = await Promise.all([
    UserAssessment.findOne({ userId }).lean(),
    UserSkill.countDocuments({ userId }),
    UserInterest.countDocuments({ userId }),
  ]);

  const assessmentPct = assessment?.isCompleted ? 100 : assessment ? 50 : 0;
  const skillsPct = skillCount > 0 ? Math.min(100, skillCount * 12) : 0;
  const interestsPct = interestCount > 0 ? Math.min(100, interestCount * 12) : 0;
  const overall = Math.round((assessmentPct + skillsPct + interestsPct) / 3);

  return {
    skillPct: skillsPct,
    interestPct: interestsPct,
    overall: assessment?.completionPercentage || overall,
    skillCount,
    interestCount,
    assessmentCompleted: !!assessment?.isCompleted,
  };
}

/**
 * Gather analytics for dashboard: recommendation engagement, skill distribution, etc.
 */
async function getUserAnalytics(userId) {
  const assessments = await UserAssessment.find({ userId }).lean();
  const totalAssessments = assessments.length;
  const completed = assessments.filter((a) => a.isCompleted).length;

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const skillDist = await UserSkill.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: '$proficiencyLevel', count: { $sum: 1 } } },
  ]);

  const interestDist = await UserInterest.aggregate([
    { $match: { userId: userObjectId } },
    { $group: { _id: '$preferenceWeight', count: { $sum: 1 } } },
  ]);

  return {
    assessments: { total: totalAssessments, completed },
    skillDistribution: skillDist,
    interestDistribution: interestDist,
  };
}

/**
 * Dashboard summary metrics for the analytics UI.
 */
async function getDashboardAnalytics(userId) {
  const progress = await getProfileProgress(userId);

  let recommendationsCount = 0;
  try {
    const recommendations = await getRecommendationsForUser(userId);
    recommendationsCount = recommendations.length;
  } catch (err) {
    recommendationsCount = 0;
  }

  const [mentorRequests, roadmapsViewed] = await Promise.all([
    MentorRequest.countDocuments({ requesterId: userId }),
    ChatSession.countDocuments({
      userId,
      businessIdeaId: { $exists: true, $ne: null },
    }),
  ]);

  const profileStrength = Math.min(
    100,
    Math.round(
      progress.overall * 0.35 +
        Math.min(progress.skillCount * 4, 20) +
        Math.min(progress.interestCount * 4, 15) +
        Math.min(recommendationsCount * 3, 15) +
        Math.min(roadmapsViewed * 5, 10) +
        Math.min(mentorRequests * 5, 5)
    )
  );

  return {
    profileCompletion: progress.overall,
    skillCount: progress.skillCount,
    interestCount: progress.interestCount,
    recommendationsCount,
    roadmapsViewed,
    mentorRequests,
    profileStrength,
    skillPct: progress.skillPct,
    interestPct: progress.interestPct,
    assessmentCompleted: progress.assessmentCompleted,
  };
}

module.exports = {
  getProfileProgress,
  getUserAnalytics,
  getDashboardAnalytics,
};
