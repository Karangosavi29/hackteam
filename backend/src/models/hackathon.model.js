const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Mode is required'],
    },
    location: {
      type: String,
      default: '',
    },
    maxTeamSize: {
      type: Number,
      default: 4,
    },
    minTeamSize: {
      type: Number,
      default: 1,
    },
    tags: [{ type: String }],
    prizePool: {
      type: String,
      default: '',
    },
    registrationLink: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes for fast filtering
hackathonSchema.index({ mode: 1 });
hackathonSchema.index({ startDate: 1 });
hackathonSchema.index({ tags: 1 });

module.exports = mongoose.model('Hackathon', hackathonSchema);