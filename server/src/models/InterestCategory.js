const mongoose = require('mongoose');

const InterestCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an interest category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
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

module.exports = mongoose.model('InterestCategory', InterestCategorySchema);
