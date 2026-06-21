// server/src/models/BusinessIdea.js
// Mongoose schema for business ideas used in the recommendation engine.

const mongoose = require('mongoose');

const BusinessIdeaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Experienced'],
    required: true,
  },
  startupCostRange: { type: String, required: true }, // e.g. "$500-$1500"
  estimatedMonthlyIncome: { type: String, required: true }, // e.g. "$2000"
  requiredSkills: [
    {
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
      weight: { type: Number, default: 1 }, // importance weight (higher = more important)
    },
  ],
  relatedInterests: [
    {
      interestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest', required: true },
      weight: { type: Number, default: 1 },
    },
  ],
  tags: [{ type: String }],
  roadmapAvailable: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('BusinessIdea', BusinessIdeaSchema);
