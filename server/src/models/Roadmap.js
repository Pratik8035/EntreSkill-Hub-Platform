const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea', required: true },
  milestones: [{ title: String, description: String, dueDate: Date }],
  timeline: { type: String }, // e.g., '3 months'
  requiredSkills: [{ skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }, weight: Number }],
  missingSkills: [{ skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }, weight: Number }],
  mentorCategories: [{ type: String }], // e.g., ['Business', 'Tech']
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
