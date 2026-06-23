const mongoose = require('mongoose');
const BusinessIdea = require('../models/BusinessIdea');
const UserAssessment = require('../models/UserAssessment');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');

/**
 * Map a string proficiency level to a 1-5 numeric scale.
 * Keeps the engine decoupled from model internals.
 */
const PROFICIENCY_SCORE = {
  Beginner: 1,
  Intermediate: 3,
  Advanced: 5,
};

/**
 * Calculate recommendation scores for a given user.
 * Returns top 10 business ideas with match details.
 */
async function getRecommendationsForUser(userId) {
  // Load user data
  const [assessment, userSkills, userInterests] = await Promise.all([
    UserAssessment.findOne({ userId }).lean(),
    UserSkill.find({ userId }).lean(),
    UserInterest.find({ userId }).lean(),
  ]);

  // Build maps keyed by string ID → numeric score
  const skillMap = {};
  userSkills.forEach(us => {
    const numericScore = PROFICIENCY_SCORE[us.proficiencyLevel] ?? 1;
    skillMap[us.skillId?.toString()] = numericScore;
  });

  const interestMap = {};
  userInterests.forEach(ui => {
    // preferenceWeight is already 1-5 numeric
    interestMap[ui.interestId?.toString()] = ui.preferenceWeight;
  });

  const ideas = await BusinessIdea.find({ isActive: true })
    .populate('requiredSkills.skillId', 'name')
    .populate('relatedInterests.interestId', 'name')
    .lean();

  const recommendations = ideas.map(idea => {
    // Skill match score (70%)
    let skillScore = 0;
    const matchedSkills = [];
    const missingSkills = [];
    idea.requiredSkills.forEach(rs => {
      // Guard: skip if populate failed (null skillId)
      if (!rs.skillId || !rs.skillId._id) return;
      const sid = rs.skillId._id.toString();
      if (skillMap[sid] !== undefined) {
        // skillMap[sid] is numeric 1-5; divide by 5 to normalise to 0-1
        skillScore += rs.weight * (skillMap[sid] / 5);
        matchedSkills.push({ skill: rs.skillId.name, weight: rs.weight });
      } else {
        missingSkills.push({ skill: rs.skillId.name, weight: rs.weight });
      }
    });

    // Interest match score (20%)
    let interestScore = 0;
    const matchedInterests = [];
    const missingInterests = [];
    idea.relatedInterests.forEach(ri => {
      // Guard: skip if populate failed (null interestId)
      if (!ri.interestId || !ri.interestId._id) return;
      const iid = ri.interestId._id.toString();
      if (interestMap[iid] !== undefined) {
        // preferenceWeight is already 1-5 numeric
        interestScore += ri.weight * (interestMap[iid] / 5);
        matchedInterests.push({ interest: ri.interestId.name, weight: ri.weight });
      } else {
        missingInterests.push({ interest: ri.interestId.name, weight: ri.weight });
      }
    });

    // Experience level match (10%)
    const experienceLevels = {
      Beginner: 1,
      Intermediate: 2,
      Experienced: 3,
    };
    const userExp = assessment?.experienceLevel || 'Beginner';
    const expScore = idea.difficultyLevel === userExp ? 1 : 0;

    const totalSkillsWeight = idea.requiredSkills.reduce((a, b) => a + b.weight, 0);
    const totalInterestsWeight = idea.relatedInterests.reduce((a, b) => a + b.weight, 0);

    const totalScore =
      (totalSkillsWeight > 0 ? (skillScore / totalSkillsWeight) * 0.7 : 0) +
      (totalInterestsWeight > 0 ? (interestScore / totalInterestsWeight) * 0.2 : 0) +
      expScore * 0.1;

    const explanation = `Matched ${matchedSkills.length} skills and ${matchedInterests.length} interests. ${expScore ? 'Experience level matches.' : ''}`;

    return {
      businessIdea: idea,
      matchScore: Math.round(totalScore * 100),
      matchedSkills,
      matchedInterests,
      missingSkills,
      missingInterests,
      explanation,
    };
  });

  // Sort descending by matchScore and take top 10
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, 10);
}

module.exports = { getRecommendationsForUser };
