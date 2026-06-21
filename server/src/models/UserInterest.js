const mongoose = require('mongoose');

const UserInterestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interest',
      required: true,
    },
    preferenceWeight: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

// One interest entry per user
UserInterestSchema.index({ userId: 1, interestId: 1 }, { unique: true });

module.exports = mongoose.model('UserInterest', UserInterestSchema);
