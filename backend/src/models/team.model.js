const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
      required: [true, 'Hackathon is required'],
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxSize: {
      type: Number,
      default: 4,
    },
    requiredRoles: [{ type: String }],
    description: {
      type: String,
      default: '',
    },
    projectIdea: {
      type: String,
      default: '',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teamSchema.index({ hackathon: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ isOpen: 1 });

module.exports = mongoose.model('Team', teamSchema);