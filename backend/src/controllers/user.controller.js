const asyncHandler = require('../middlewares/asyncHandler');
const userService = require('../services/user.service');

const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.status(200).json({ success: true, user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'college', 'bio', 'skills', 'role', 'github', 'linkedin', 'avatar'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });
  const user = await userService.updateProfile(req.user._id, updates);
  res.status(200).json({ success: true, user });
});

const searchUsers = asyncHandler(async (req, res) => {
  const { skills, role, q } = req.query;
  const users = await userService.search({ skills, role, q });
  res.status(200).json({ success: true, count: users.length, users });
});

const getUserTeams = asyncHandler(async (req, res) => {
  const teams = await userService.getTeams(req.params.id);
  res.status(200).json({ success: true, teams });
});

module.exports = { getProfile, updateProfile, searchUsers, getUserTeams };