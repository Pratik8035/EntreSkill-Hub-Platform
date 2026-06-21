const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillCategory',
      required: [true, 'A skill must belong to a category'],
    },
    name: {
      type: String,
      required: [true, 'Please add a skill name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    popularityScore: {
      type: Number,
      default: 0,
    },
    demandScore: {
      type: Number,
      default: 0,
    },
    businessCategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compounded index to prevent duplicate skill names within the same category
SkillSchema.index({ categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Skill', SkillSchema);
