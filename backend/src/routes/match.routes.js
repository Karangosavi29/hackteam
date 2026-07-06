const express = require('express');
const router = express.Router();
const { getTeammateSuggestions, getTeamSuggestions } = require('../controllers/match.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/teammates', getTeammateSuggestions);
router.get('/teams', getTeamSuggestions);

module.exports = router;