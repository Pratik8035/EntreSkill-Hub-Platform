const mongoose = require('mongoose');

/**
 * ChatMessage schema stores each message in a chat session.
 * role: 'user' | 'assistant' – who sent the message.
 * content: the raw text generated or provided by the user.
 * tokens: optional token count for cost tracking.
 */
const ChatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tokens: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
