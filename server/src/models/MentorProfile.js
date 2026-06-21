const mongoose = require('mongoose');

const MentorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertise: [{ type: String }], // list of skill names or IDs
  industries: [{ type: String }],
  availability: { type: String, enum: ['FullTime', 'PartTime', 'OnDemand'], default: 'OnDemand' },
  rating: { type: Number, min: 0, max: 5, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MentorProfile', MentorProfileSchema);
