const mongoose = require('mongoose');

const InterestSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterestCategory',
      required: [true, 'An interest must belong to a category'],
    },
    name: {
      type: String,
      required: [true, 'Please add an interest name'],
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

// Prevent duplicate interest names within the same category
InterestSchema.index({ categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Interest', InterestSchema);
