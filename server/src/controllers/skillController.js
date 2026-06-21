const Skill = require('../models/Skill');
const SkillCategory = require('../models/SkillCategory');
const UserSkill = require('../models/UserSkill');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// @desc    Get all active skill categories
// @route   GET /api/skills/categories
// @access  Public
const getSkillCategories = async (req, res, next) => {
  try {
    const categories = await SkillCategory.find({ isActive: true }).sort('name');
    return sendSuccess(res, categories, 'Skill categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active skills (supports ?search= and ?category= filters)
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.categoryId = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skills = await Skill.find(filter)
      .populate('categoryId', 'name icon')
      .sort({ popularityScore: -1, name: 1 });

    return sendSuccess(res, skills, 'Skills retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Save user's selected skills (batch upsert)
// @route   POST /api/users/skills
// @access  Private
const saveUserSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    const userId = req.user._id;

    // Upsert each skill entry (creates or updates proficiency)
    const ops = skills.map(({ skillId, proficiencyLevel }) => ({
      updateOne: {
        filter: { userId, skillId },
        update: { $set: { userId, skillId, proficiencyLevel } },
        upsert: true,
      },
    }));

    await UserSkill.bulkWrite(ops);

    // Increment popularityScore for newly selected skills
    const skillIds = skills.map((s) => s.skillId);
    await Skill.updateMany({ _id: { $in: skillIds } }, { $inc: { popularityScore: 1 } });

    const updatedUserSkills = await UserSkill.find({ userId }).populate('skillId', 'name categoryId tags');
    return sendSuccess(res, updatedUserSkills, 'Skills saved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved skills
// @route   GET /api/users/skills
// @access  Private
const getUserSkills = async (req, res, next) => {
  try {
    const userSkills = await UserSkill.find({ userId: req.user._id })
      .populate({
        path: 'skillId',
        select: 'name description tags categoryId popularityScore',
        populate: { path: 'categoryId', select: 'name icon' },
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, userSkills, 'User skills retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update proficiency level for a specific user skill
// @route   PUT /api/users/skills
// @access  Private
const updateUserSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;
    const userId = req.user._id;

    const ops = skills.map(({ skillId, proficiencyLevel }) => ({
      updateOne: {
        filter: { userId, skillId },
        update: { $set: { proficiencyLevel } },
        upsert: true,
      },
    }));

    await UserSkill.bulkWrite(ops);
    const updatedSkills = await UserSkill.find({ userId }).populate('skillId', 'name');
    return sendSuccess(res, updatedSkills, 'User skills updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkillCategories,
  getSkills,
  saveUserSkills,
  getUserSkills,
  updateUserSkills,
};
