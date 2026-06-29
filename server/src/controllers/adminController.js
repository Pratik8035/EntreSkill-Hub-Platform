const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const BusinessIdea = require('../models/BusinessIdea');
const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram = require('../models/FundingProgram');
const UserSkill = require('../models/UserSkill');
const UserInterest = require('../models/UserInterest');
const UserAssessment = require('../models/UserAssessment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const BusinessGoal = require('../models/BusinessGoal');
const Notification = require('../models/Notification');
const UserCourseProgress = require('../models/UserCourseProgress');
const QuizAttempt = require('../models/QuizAttempt');

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
    return sendError(res, 'User not found', [], 404);
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
    return sendError(res, 'You cannot delete your own admin account', [], 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 'User not found', [], 404);
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


// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

// @desc  Get full platform dashboard statistics with weekly & monthly growth
// @route GET /api/admin/dashboard
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  // Weekly boundary — 7 days ago
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Monthly boundary — 30 days ago
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  // Previous weekly window (14-7 days ago) for growth comparison
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Previous monthly window (60-30 days ago)
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

  const [
    totalUsers,
    activeUsers,
    totalCourses,
    totalBusinessIdeas,
    totalGoals,
    totalCertificates,
    totalNotifications,
    // Growth counters — current period
    usersThisWeek,
    usersThisMonth,
    // Growth counters — previous period
    usersLastWeek,
    usersLastMonth,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    Course.countDocuments(),
    BusinessIdea.countDocuments(),
    BusinessGoal.countDocuments(),
    Certificate.countDocuments(),
    Notification.countDocuments(),
    // Users registered in last 7 days
    User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
    // Users registered in last 30 days
    User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
    // Users registered 14–7 days ago (previous weekly window)
    User.countDocuments({ createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo } }),
    // Users registered 60–30 days ago (previous monthly window)
    User.countDocuments({ createdAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo } }),
  ]);

  // Calculate growth percentages (avoid division by zero)
  const calcGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  sendSuccess(res, {
    totalUsers,
    activeUsers,
    totalCourses,
    totalBusinessIdeas,
    totalGoals,
    totalCertificates,
    totalNotifications,
    weeklyGrowth: {
      newUsers: usersThisWeek,
      growthPercent: calcGrowth(usersThisWeek, usersLastWeek),
    },
    monthlyGrowth: {
      newUsers: usersThisMonth,
      growthPercent: calcGrowth(usersThisMonth, usersLastMonth),
    },
  }, 'Dashboard stats fetched successfully');
});


// ─── GET SINGLE USER ─────────────────────────────────────────────────────────

// @desc  Get a single user by ID
// @route GET /api/admin/users/:id
// @access Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) {
    return sendError(res, 'User not found', [], 404);
  }
  sendSuccess(res, user, 'User retrieved successfully');
});


// ─── ADMIN SCHEME & FUNDING LIST ─────────────────────────────────────────────

// @desc  List government schemes (admin-scoped with search/category/state filters)
// @route GET /api/admin/schemes
// @access Private/Admin
const listSchemes = asyncHandler(async (req, res) => {
  const { search, category, state, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'All') filter.category = category;
  if (state && state !== 'All') filter.state = state;

  const skipIndex = (Number(page) - 1) * Number(limit);
  const total = await GovernmentScheme.countDocuments(filter);
  const schemes = await GovernmentScheme.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { schemes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Schemes retrieved');
});

// @desc  List funding programs (admin-scoped with search/industry filters)
// @route GET /api/admin/funding
// @access Private/Admin
const listFunding = asyncHandler(async (req, res) => {
  const { search, industry, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { provider: { $regex: search, $options: 'i' } },
    ];
  }
  if (industry && industry !== 'All') filter.industry = industry;

  const skipIndex = (Number(page) - 1) * Number(limit);
  const total = await FundingProgram.countDocuments(filter);
  const programs = await FundingProgram.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { programs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Funding programs retrieved');
});


// ─── ADMIN COURSE MANAGEMENT ─────────────────────────────────────────────────

// @desc  List all courses with search, category, pagination
// @route GET /api/admin/courses
// @access Private/Admin
const listCourses = asyncHandler(async (req, res) => {
  const { search, category, isPublished, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'All') filter.category = category;
  if (isPublished !== undefined && isPublished !== '') {
    filter.isPublished = isPublished === 'true';
  }

  const skipIndex = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(Number(limit))
    .lean();

  sendSuccess(res, { courses, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, 'Courses retrieved successfully');
});

// @desc  Create a course
// @route POST /api/admin/courses
// @access Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, difficultyLevel, thumbnail, estimatedDuration, isPublished } = req.body;

  if (!title) {
    return sendError(res, 'Course title is required', [], 400);
  }

  const course = await Course.create({
    title,
    description,
    category,
    difficultyLevel: difficultyLevel || 'Beginner',
    thumbnail,
    estimatedDuration,
    isPublished: isPublished !== undefined ? isPublished : false,
  });

  sendSuccess(res, course, 'Course created successfully', 201);
});

// @desc  Update a course
// @route PUT /api/admin/courses/:id
// @access Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) {
    return sendError(res, 'Course not found', [], 404);
  }
  sendSuccess(res, course, 'Course updated successfully');
});

// @desc  Delete a course
// @route DELETE /api/admin/courses/:id
// @access Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    return sendError(res, 'Course not found', [], 404);
  }
  sendSuccess(res, null, 'Course deleted successfully');
});


// ─── PLATFORM ANALYTICS ─────────────────────────────────────────────────────

// @desc Get platform analytics aggregation (basic)
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


// @desc Get enhanced multi-domain analytics
// @route GET /api/admin/analytics/enhanced
// @access Private/Admin
const getEnhancedAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    // User analytics
    totalUsers,
    verifiedUsers,
    usersByRole,
    newUsersThisMonth,
    // Learning analytics
    totalCourses,
    publishedCourses,
    totalEnrollments,
    totalCertificates,
    coursesByCategory,
    // Business analytics
    totalGoals,
    goalsByStatus,
    totalBusinessIdeas,
    // Funding analytics
    totalSchemes,
    totalFundingPrograms,
    schemesByCategory,
    // Execution analytics
    totalNotifications,
  ] = await Promise.all([
    // User
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    // Learning
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true }),
    UserCourseProgress.countDocuments(),
    Certificate.countDocuments(),
    Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    // Business
    BusinessGoal.countDocuments(),
    BusinessGoal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    BusinessIdea.countDocuments(),
    // Funding
    GovernmentScheme.countDocuments(),
    FundingProgram.countDocuments(),
    GovernmentScheme.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    // Execution
    Notification.countDocuments(),
  ]);

  // Learning completion rate
  const completedEnrollments = await UserCourseProgress.countDocuments({ status: 'completed' });
  const learningCompletionRate = totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;

  // Quiz analytics
  const quizStats = await QuizAttempt.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$score' }, totalAttempts: { $sum: 1 } } }
  ]);

  sendSuccess(res, {
    userAnalytics: {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      verificationRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
      usersByRole,
      newUsersThisMonth,
    },
    learningAnalytics: {
      totalCourses,
      publishedCourses,
      draftCourses: totalCourses - publishedCourses,
      totalEnrollments,
      completedEnrollments,
      learningCompletionRate,
      totalCertificates,
      coursesByCategory,
      avgQuizScore: quizStats[0]?.avgScore ? Math.round(quizStats[0].avgScore) : 0,
      totalQuizAttempts: quizStats[0]?.totalAttempts || 0,
    },
    businessAnalytics: {
      totalBusinessIdeas,
      totalGoals,
      goalsByStatus,
    },
    fundingAnalytics: {
      totalSchemes,
      totalFundingPrograms,
      schemesByCategory,
    },
    executionAnalytics: {
      totalNotifications,
    },
  }, 'Enhanced analytics fetched successfully');
});


// ── Sprint 12 — Financial Stats ──────────────────────────────────────────────

// @desc Get platform-wide financial statistics (admin)
// @route GET /api/admin/financial-stats
// @access Private/Admin
const getFinancialStats = asyncHandler(async (req, res) => {
  const IncomeModel = require('../models/Income');
  const ExpenseModel = require('../models/Expense');
  const InvoiceModel = require('../models/Invoice');
  const BudgetModel = require('../models/Budget');
  const FinancialGoalModel = require('../models/FinancialGoal');

  const [
    totalIncomeRecords,
    totalExpenseRecords,
    totalInvoices,
    totalBudgets,
    totalFinancialGoals,
    paidInvoices,
    incomeAgg,
    expenseAgg,
  ] = await Promise.all([
    IncomeModel.countDocuments(),
    ExpenseModel.countDocuments(),
    InvoiceModel.countDocuments(),
    BudgetModel.countDocuments(),
    FinancialGoalModel.countDocuments(),
    InvoiceModel.countDocuments({ status: 'Paid' }),
    IncomeModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    ExpenseModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const totalRevenue = incomeAgg[0]?.total ?? 0;
  const totalExpenses = expenseAgg[0]?.total ?? 0;

  sendSuccess(res, {
    totalIncomeRecords,
    totalExpenseRecords,
    totalInvoices,
    totalBudgets,
    totalFinancialGoals,
    paidInvoices,
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
    isProfit: totalRevenue >= totalExpenses,
  }, 'Financial statistics retrieved');
});

module.exports = {
  // Dashboard
  getDashboardStats,
  // Users
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Mentors
  listMentors,
  updateMentorProfile,
  deleteMentorProfile,
  // Business Ideas
  listBusinessIdeas,
  createBusinessIdea,
  updateBusinessIdea,
  deleteBusinessIdea,
  // Schemes
  listSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
  // Funding
  listFunding,
  createFunding,
  updateFunding,
  deleteFunding,
  // Courses
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  // Analytics
  getAdminAnalytics,
  getEnhancedAnalytics,
  // Sprint 12
  getFinancialStats,
};
