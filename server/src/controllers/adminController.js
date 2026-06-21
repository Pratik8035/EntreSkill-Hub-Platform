const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const BusinessIdea = require('../models/BusinessIdea');
const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram = require('../models/FundingProgram');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');
const UserAssessment = require('../models/UserAssessment');

const asyncHandler = require('express-async-handler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────

// @desc List all platform users with search, role filters, and pagination
// @route GET /api/admin/users
// @access Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role && role !== 'All') {
    filter.role = role;
  }

  const skipIndex = (page - 1) * limit;
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { users, total, page: Number(page), pages: Math.ceil(total / limit) }, 'Users retrieved successfully');
});

// @desc Update user details (name, email, role, location, bio, isVerified)
// @route PUT /api/admin/users/:id
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, isVerified, location, bio, phoneNumber } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Update properties if provided
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (isVerified !== undefined) user.isVerified = isVerified;

  if (user.profile) {
    if (location !== undefined) user.profile.location = location;
    if (bio !== undefined) user.profile.bio = bio;
    if (phoneNumber !== undefined) user.profile.phoneNumber = phoneNumber;
  }

  await user.save();

  // If role is mentor and no mentor profile exists, create a basic default one
  if (role === 'mentor') {
    const existingProfile = await MentorProfile.findOne({ userId: user._id });
    if (!existingProfile) {
      await MentorProfile.create({
        userId: user._id,
        expertise: [],
        industries: [],
        availability: 'OnDemand',
        rating: 5
      });
    }
  }

  sendSuccess(res, user, 'User updated successfully');
});

// @desc Delete user and their related profiles, skills, assessments
// @route DELETE /api/admin/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Prevent admin deleting self
  if (req.user._id.toString() === userId.toString()) {
    return sendError(res, 'You cannot delete your own admin account', 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Delete all dependencies
  await Promise.all([
    User.findByIdAndDelete(userId),
    MentorProfile.findOneAndDelete({ userId }),
    UserSkill.deleteMany({ userId }),
    UserInterest.deleteMany({ userId }),
    UserAssessment.deleteMany({ userId })
  ]);

  sendSuccess(res, null, 'User and all associated data deleted successfully');
});


// ─── MENTOR MANAGEMENT ──────────────────────────────────────────────────────

// @desc List all mentors with profiles
// @route GET /api/admin/mentors
// @access Private/Admin
const listMentors = asyncHandler(async (req, res) => {
  const { search, availability, page = 1, limit = 10 } = req.query;

  // First find mentor users
  const userFilter = { role: 'mentor' };
  if (search) {
    userFilter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const mentors = await User.find(userFilter).lean();
  const mentorIds = mentors.map(m => m._id);

  const profileFilter = { userId: { $in: mentorIds } };
  if (availability && availability !== 'All') {
    profileFilter.availability = availability;
  }

  const skipIndex = (page - 1) * limit;
  const total = await MentorProfile.countDocuments(profileFilter);
  const profiles = await MentorProfile.find(profileFilter)
    .populate('userId', 'name email isVerified profile')
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { profiles, total, page: Number(page), pages: Math.ceil(total / limit) }, 'Mentor profiles retrieved successfully');
});

// @desc Update mentor profile fields
// @route PUT /api/admin/mentors/:id
// @access Private/Admin
const updateMentorProfile = asyncHandler(async (req, res) => {
  const { expertise, industries, availability, rating } = req.body;
  const profile = await MentorProfile.findById(req.params.id);

  if (!profile) {
    return sendError(res, 'Mentor profile not found', 404);
  }

  if (expertise !== undefined) profile.expertise = expertise;
  if (industries !== undefined) profile.industries = industries;
  if (availability !== undefined) profile.availability = availability;
  if (rating !== undefined) profile.rating = rating;

  await profile.save();
  sendSuccess(res, profile, 'Mentor profile updated successfully');
});

// @desc Delete mentor profile
// @route DELETE /api/admin/mentors/:id
// @access Private/Admin
const deleteMentorProfile = asyncHandler(async (req, res) => {
  const profile = await MentorProfile.findById(req.params.id);
  if (!profile) {
    return sendError(res, 'Mentor profile not found', 404);
  }

  // Set user's role back to user
  await User.findByIdAndUpdate(profile.userId, { role: 'user' });
  await MentorProfile.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Mentor profile deleted and role reverted to user');
});


// ─── BUSINESS IDEA MANAGEMENT ───────────────────────────────────────────────

// @desc List all business ideas with search, category filters, and pagination
// @route GET /api/admin/business-ideas
// @access Private/Admin
const listBusinessIdeas = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  const skipIndex = (page - 1) * limit;
  const total = await BusinessIdea.countDocuments(filter);
  const ideas = await BusinessIdea.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { ideas, total, page: Number(page), pages: Math.ceil(total / limit) }, 'Business ideas retrieved successfully');
});

// @desc Create a new business idea
// @route POST /api/admin/business-ideas
// @access Private/Admin
const createBusinessIdea = asyncHandler(async (req, res) => {
  const { name, description, category, difficultyLevel, startupCostRange, estimatedMonthlyIncome, tags, requiredSkills, relatedInterests, roadmapAvailable, isActive } = req.body;

  if (!name || !description || !category || !difficultyLevel || !startupCostRange || !estimatedMonthlyIncome) {
    return sendError(res, 'Missing required business idea details', 400);
  }

  const idea = await BusinessIdea.create({
    name,
    description,
    category,
    difficultyLevel,
    startupCostRange,
    estimatedMonthlyIncome,
    tags: tags || [],
    requiredSkills: requiredSkills || [],
    relatedInterests: relatedInterests || [],
    roadmapAvailable: roadmapAvailable || false,
    isActive: isActive !== undefined ? isActive : true
  });

  sendSuccess(res, idea, 'Business idea created successfully', 201);
});

// @desc Update a business idea
// @route PUT /api/admin/business-ideas/:id
// @access Private/Admin
const updateBusinessIdea = asyncHandler(async (req, res) => {
  const idea = await BusinessIdea.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!idea) {
    return sendError(res, 'Business idea not found', 404);
  }
  sendSuccess(res, idea, 'Business idea updated successfully');
});

// @desc Delete a business idea
// @route DELETE /api/admin/business-ideas/:id
// @access Private/Admin
const deleteBusinessIdea = asyncHandler(async (req, res) => {
  const idea = await BusinessIdea.findByIdAndDelete(req.params.id);
  if (!idea) {
    return sendError(res, 'Business idea not found', 404);
  }
  sendSuccess(res, null, 'Business idea deleted successfully');
});


// ─── SCHEME MANAGEMENT ──────────────────────────────────────────────────────

// @desc Create a government scheme
// @route POST /api/admin/schemes
// @access Private/Admin
const createScheme = asyncHandler(async (req, res) => {
  const { name, description, eligibility, category, benefits, officialLink, state, industry, fundingAmount, deadline } = req.body;

  if (!name) {
    return sendError(res, 'Scheme name is required', 400);
  }

  const scheme = await GovernmentScheme.create({
    name,
    description,
    eligibility,
    category,
    benefits,
    officialLink,
    state,
    industry,
    fundingAmount,
    deadline
  });

  sendSuccess(res, scheme, 'Government scheme created successfully', 201);
});

// @desc Update a government scheme
// @route PUT /api/admin/schemes/:id
// @access Private/Admin
const updateScheme = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!scheme) {
    return sendError(res, 'Scheme not found', 404);
  }
  sendSuccess(res, scheme, 'Government scheme updated successfully');
});

// @desc Delete a government scheme
// @route DELETE /api/admin/schemes/:id
// @access Private/Admin
const deleteScheme = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findByIdAndDelete(req.params.id);
  if (!scheme) {
    return sendError(res, 'Scheme not found', 404);
  }
  sendSuccess(res, null, 'Government scheme deleted successfully');
});


// ─── FUNDING MANAGEMENT ─────────────────────────────────────────────────────

// @desc Create a funding program
// @route POST /api/admin/funding
// @access Private/Admin
const createFunding = asyncHandler(async (req, res) => {
  const { name, provider, amount, interestRate, eligibility, industry, applicationLink } = req.body;

  if (!name) {
    return sendError(res, 'Funding program name is required', 400);
  }

  const funding = await FundingProgram.create({
    name,
    provider,
    amount,
    interestRate,
    eligibility,
    industry,
    applicationLink
  });

  sendSuccess(res, funding, 'Funding program created successfully', 201);
});

// @desc Update a funding program
// @route PUT /api/admin/funding/:id
// @access Private/Admin
const updateFunding = asyncHandler(async (req, res) => {
  const funding = await FundingProgram.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!funding) {
    return sendError(res, 'Funding program not found', 404);
  }
  sendSuccess(res, funding, 'Funding program updated successfully');
});

// @desc Delete a funding program
// @route DELETE /api/admin/funding/:id
// @access Private/Admin
const deleteFunding = asyncHandler(async (req, res) => {
  const funding = await FundingProgram.findByIdAndDelete(req.params.id);
  if (!funding) {
    return sendError(res, 'Funding program not found', 404);
  }
  sendSuccess(res, null, 'Funding program deleted successfully');
});


// ─── PLATFORM ANALYTICS ─────────────────────────────────────────────────────

// @desc Get platform analytics aggregation
// @route GET /api/admin/analytics
// @access Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalMentors,
    totalIdeas,
    totalSchemes,
    totalFunding,
    usersByRole,
    usersByVerified
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'mentor' }),
    BusinessIdea.countDocuments(),
    GovernmentScheme.countDocuments(),
    FundingProgram.countDocuments(),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $group: { _id: '$isVerified', count: { $sum: 1 } } }
    ])
  ]);

  sendSuccess(res, {
    totalUsers,
    totalMentors,
    totalIdeas,
    totalSchemes,
    totalFunding,
    usersByRole,
    usersByVerified
  }, 'Admin analytics aggregates fetched');
});

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
  listMentors,
  updateMentorProfile,
  deleteMentorProfile,
  listBusinessIdeas,
  createBusinessIdea,
  updateBusinessIdea,
  deleteBusinessIdea,
  createScheme,
  updateScheme,
  deleteScheme,
  createFunding,
  updateFunding,
  deleteFunding,
  getAdminAnalytics
};
