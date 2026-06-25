const mongoose = require('mongoose');

/**
 * Certificate — Sprint 7 Phase 4
 * Stores course completion certificates for users.
 * Fields: userId, courseId, certificateNumber, issuedAt, completionPercentage, finalScore
 */
const CertificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user ID'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please add a course ID'],
  },
  certificateNumber: {
    type: String,
    required: [true, 'Certificate number is required'],
    unique: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  completionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  finalScore: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// Indexes for efficient queries
CertificateSchema.index({ userId: 1 });
CertificateSchema.index({ courseId: 1 });
CertificateSchema.index({ certificateNumber: 1 });
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
