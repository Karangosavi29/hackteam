const asyncHandler = require('../middlewares/asyncHandler');
const matchService = require('../services/match.service');

const getTeammateSuggestions = asyncHandler(async (req, res) => {
  const { hackathonId, limit } = req.query;
  const results = await matchService.suggestTeammates(req.user._id, { hackathonId, limit });
  res.status(200).json({
    success: true,
    count: results.length,
    suggestions: results,
  });
});

const getTeamSuggestions = asyncHandler(async (req, res) => {
  const { hackathonId, limit } = req.query;
  const results = await matchService.suggestTeams(req.user._id, { hackathonId, limit });
  res.status(200).json({
    success: true,
    count: results.length,
    suggestions: results,
  });
});

const getCompatibility = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const result = await matchService.getCompatibility(req.user._id, otherUserId);
  res.status(200).json({ success: true, ...result });
});

const getTeamSkillCoverage = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const result = await matchService.getTeamSkillCoverage(teamId);
  res.status(200).json({ success: true, ...result });
});

module.exports = {
  getTeammateSuggestions,
  getTeamSuggestions,
  getCompatibility,
  getTeamSkillCoverage,
};