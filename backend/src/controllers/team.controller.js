const asyncHandler = require('../middlewares/asyncHandler');
const teamService = require('../services/team.service');

const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.user._id, req.body);
  res.status(201).json({ success: true, team });
});

const getTeams = asyncHandler(async (req, res) => {
  const { hackathon, isOpen, page, limit } = req.query;
  const result = await teamService.getAll({ hackathon, isOpen, page, limit });
  res.status(200).json({ success: true, ...result });
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getById(req.params.id);
  res.status(200).json({ success: true, team });
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.update(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, team });
});

const disbandTeam = asyncHandler(async (req, res) => {
  await teamService.disband(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Team disbanded successfully' });
});

const leaveTeam = asyncHandler(async (req, res) => {
  await teamService.leaveTeam(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Left team successfully' });
});

const removeMember = asyncHandler(async (req, res) => {
  await teamService.removeMember(req.params.id, req.user._id, req.params.userId);
  res.status(200).json({ success: true, message: 'Member removed successfully' });
});

module.exports = { createTeam, getTeams, getTeam, updateTeam, disbandTeam, leaveTeam, removeMember };