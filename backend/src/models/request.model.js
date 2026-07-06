const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['join', 'invite'],
      required: true,
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests
requestSchema.index(
  { from: 1, team: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

requestSchema.index({ to: 1, status: 1 });
requestSchema.index({ from: 1, status: 1 });
requestSchema.index({ team: 1 });

module.exports = mongoose.model('Request', requestSchema);