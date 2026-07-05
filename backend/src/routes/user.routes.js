const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers, getUserTeams } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', searchUsers);       // public
router.put('/profile', protect, updateProfile);                   // private
router.get('/:id', getProfile);                     // public
router.get('/:id/teams', getUserTeams);             // public

module.exports = router;