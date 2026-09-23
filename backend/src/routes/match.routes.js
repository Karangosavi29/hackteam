const express = require('express');
const router = express.Router();
const {
  getTeammateSuggestions,
  getTeamSuggestions,
  getCompatibility,
  getTeamSkillCoverage,
} = require('../controllers/match.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/teammates', getTeammateSuggestions);
router.get('/teams', getTeamSuggestions);
router.get('/compatibility/:otherUserId', getCompatibility);
router.get('/team/:teamId/coverage', getTeamSkillCoverage);

module.exports = router;