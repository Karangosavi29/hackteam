const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
      maxlength: [2000, 'Message is too long'],
    },
  },
  { timestamps: true }
);

// Powers "load this team's messages, newest last" — the core chat history query
messageSchema.index({ teamId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);