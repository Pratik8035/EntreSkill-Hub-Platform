const User = require('../models/User');
const Skill = require('../models/Skill');
const Interest = require('../models/Interest');
const MentorProfile = require('../models/MentorProfile');

/**
 * Calculate match score between a mentor and a user.
 * Skill overlap contributes 70%, interest overlap 30%.
 * Returns a numeric score between 0 and 100.
 */
function calculateMatchScore(mentor, user) {
  // mentor.expertise and mentor.interests are arrays of strings.
  const mentorSkillIds = (mentor.expertise || []).map(id => id.toString());
  const mentorInterestIds = (mentor.interests || []).map(id => id.toString());

  // User.profile.skills is [String]; User has no top-level interests field.
  const userSkillIds = (user.profile?.skills || []).map(id => id.toString());
  const userInterestIds = [];

  const skillOverlap = mentorSkillIds.filter(id => userSkillIds.includes(id)).length;
  const skillTotal = Math.max(mentorSkillIds.length, 1);
  const skillScore = (skillOverlap / skillTotal) * 70;

  const interestOverlap = mentorInterestIds.filter(id => userInterestIds.includes(id)).length;
  const interestTotal = Math.max(mentorInterestIds.length, 1);
  const interestScore = (interestOverlap / interestTotal) * 30;

  return Math.round(skillScore + interestScore);
}

/**
 * Get top mentor matches for a given user.
 * Returns array of { mentor, matchScore } sorted descending.
 */
async function getMentorMatches(userId, limit = 10) {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error('User not found');

  const mentors = await MentorProfile.find().lean();
  const matches = mentors.map(mentor => ({
    mentor,
    matchScore: calculateMatchScore(mentor, user)
  }));

  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches.slice(0, limit);
}

module.exports = {
  getMentorMatches,
  calculateMatchScore,
};
