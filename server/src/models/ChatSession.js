const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  businessIdeaId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessIdea' },
  lastMessage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
