const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    college: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    role: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack', 'design', 'ml', 'devops', 'other'],
      default: 'other',
    },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    avatar: { type: String, default: '' },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);