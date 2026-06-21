const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema({
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['Article', 'Video', 'Course'], required: true },
  relatedSkillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }]
}, { timestamps: true });

module.exports = mongoose.model('LearningResource', LearningResourceSchema);
