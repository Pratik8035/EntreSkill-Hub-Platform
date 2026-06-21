const Roadmap = require('../models/Roadmap');
const asyncHandler = require('express-async-handler');

// @desc    Get roadmap by businessIdeaId
// @route   GET /api/roadmaps/:businessIdeaId
// @access  Private
const getRoadmap = asyncHandler(async (req, res) => {
  const { businessIdeaId } = req.params;
  const roadmap = await Roadmap.findOne({ businessIdeaId })
    .populate('requiredSkills.skillId', 'name description')
    .populate('missingSkills.skillId', 'name description')
    .lean();
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }
  res.json({ success: true, message: 'Roadmap fetched', data: roadmap });
});

module.exports = { getRoadmap };
