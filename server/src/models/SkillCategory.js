const mongoose = require('mongoose');

const SkillCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a skill category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: 'Activity', // Lucide icon name fallback
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

module.exports = mongoose.model('SkillCategory', SkillCategorySchema);
