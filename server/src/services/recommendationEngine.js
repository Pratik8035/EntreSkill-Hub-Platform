const mongoose = require('mongoose');
const BusinessIdea = require('../models/BusinessIdea');
const UserAssessment = require('../models/UserAssessment');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');

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

  const skillMap = {};
  userSkills.forEach(us => { skillMap[us.skillId?.toString()] = us.proficiencyLevel; });

  const interestMap = {};
  userInterests.forEach(ui => { interestMap[ui.interestId?.toString()] = ui.preferenceWeight; });

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
      const sid = rs.skillId._id.toString();
      if (skillMap[sid]) {
        skillScore += rs.weight * (skillMap[sid] / 5); // assuming proficiency 1-5
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
      const iid = ri.interestId._id.toString();
      if (interestMap[iid]) {
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
