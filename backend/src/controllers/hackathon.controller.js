const asyncHandler = require('../middlewares/asyncHandler');
const hackathonService = require('../services/hackathon.service');

const createHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.create(req.user._id, req.body);
  res.status(201).json({ success: true, hackathon });
});

const getHackathons = asyncHandler(async (req, res) => {
  const { mode, tags, startAfter, startBefore, q, page, limit } = req.query;
  const result = await hackathonService.getAll({ mode, tags, startAfter, startBefore, q, page, limit });
  res.status(200).json({ success: true, ...result });
});

const getHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.getById(req.params.id);
  res.status(200).json({ success: true, hackathon });
});

const updateHackathon = asyncHandler(async (req, res) => {
  const hackathon = await hackathonService.update(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, hackathon });
});

const deleteHackathon = asyncHandler(async (req, res) => {
  await hackathonService.remove(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Hackathon deleted successfully' });
});

module.exports = { createHackathon, getHackathons, getHackathon, updateHackathon, deleteHackathon };