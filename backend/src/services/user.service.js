const User = require('../models/user.model');

const getById = async (id) => {
  const user = await User.findById(id).select('-refreshToken');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const updateProfile = async (userId, updates) => {
  // Sanitize skills — remove duplicates and empty strings
  if (updates.skills) {
    updates.skills = [...new Set(updates.skills.filter(Boolean))];
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-refreshToken');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const search = async ({ skills, role, q }) => {
  const query = {};

  // Filter by role
  if (role) {
    query.role = role;
  }

  // Filter by skills — match any skill in the array
  if (skills) {
    const skillArray = skills.split(',').map((s) => s.trim());
    query.skills = { $in: skillArray };
  }

  // Search by name or college (case-insensitive)
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { college: { $regex: q, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-refreshToken')
    .limit(20)
    .sort({ createdAt: -1 });

  return users;
};

const getTeams = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'teams',
      select: 'name hackathon isOpen maxSize members',
      populate: { path: 'hackathon', select: 'title startDate mode' },
    })
    .select('teams');

  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user.teams;
};

module.exports = { getById, updateProfile, search, getTeams };