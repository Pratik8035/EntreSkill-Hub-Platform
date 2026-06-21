const LearningResource = require('../models/LearningResource');
const asyncHandler = require('express-async-handler');

// @desc    Get learning resources for a business idea
// @route   GET /api/resources/:businessIdeaId
// @access  Private
const getResources = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const resources = await LearningResource.find({ businessIdeaId }).lean();
  res.json({ success: true, message: 'Resources fetched', data: resources });
});

module.exports = { getResources };
