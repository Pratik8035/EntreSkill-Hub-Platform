const Interest = require('../models/Interest');
const InterestCategory = require('../models/InterestCategory');
const UserInterest = require('../models/UserInterest');
const { sendSuccess } = require('../utils/responseHandler');

// @desc    Get all active interest categories
// @route   GET /api/interests/categories
// @access  Public
const getInterestCategories = async (req, res, next) => {
  try {
    const categories = await InterestCategory.find({ isActive: true }).sort('name');
    return sendSuccess(res, categories, 'Interest categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active interests (supports ?search= and ?category= filters)
// @route   GET /api/interests
// @access  Public
const getInterests = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.categoryId = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const interests = await Interest.find(filter)
      .populate('categoryId', 'name')
      .sort('name');

    return sendSuccess(res, interests, 'Interests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Save user's selected interests (batch upsert)
// @route   POST /api/users/interests
// @access  Private
const saveUserInterests = async (req, res, next) => {
  try {
    const { interests } = req.body;
    const userId = req.user._id;

    const ops = interests.map(({ interestId, preferenceWeight }) => ({
      updateOne: {
        filter: { userId, interestId },
        update: { $set: { userId, interestId, preferenceWeight } },
        upsert: true,
      },
    }));

    await UserInterest.bulkWrite(ops);
    const updatedUserInterests = await UserInterest.find({ userId }).populate('interestId', 'name categoryId tags');
    return sendSuccess(res, updatedUserInterests, 'Interests saved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved interests
// @route   GET /api/users/interests
// @access  Private
const getUserInterests = async (req, res, next) => {
  try {
    const userInterests = await UserInterest.find({ userId: req.user._id })
      .populate({
        path: 'interestId',
        select: 'name description tags categoryId',
        populate: { path: 'categoryId', select: 'name' },
      })
      .sort({ createdAt: -1 });

    return sendSuccess(res, userInterests, 'User interests retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update preference weights for user interests
// @route   PUT /api/users/interests
// @access  Private
const updateUserInterests = async (req, res, next) => {
  try {
    const { interests } = req.body;
    const userId = req.user._id;

    const ops = interests.map(({ interestId, preferenceWeight }) => ({
      updateOne: {
        filter: { userId, interestId },
        update: { $set: { preferenceWeight } },
        upsert: true,
      },
    }));

    await UserInterest.bulkWrite(ops);
    const updatedInterests = await UserInterest.find({ userId }).populate('interestId', 'name');
    return sendSuccess(res, updatedInterests, 'User interests updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterestCategories,
  getInterests,
  saveUserInterests,
  getUserInterests,
  updateUserInterests,
};
