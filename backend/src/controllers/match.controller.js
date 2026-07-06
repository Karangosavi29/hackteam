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

module.exports = { getTeammateSuggestions, getTeamSuggestions };