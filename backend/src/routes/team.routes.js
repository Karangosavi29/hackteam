const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  disbandTeam,
  leaveTeam,
  removeMember,
} = require('../controllers/team.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', protect, createTeam);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, disbandTeam);
router.post('/:id/leave', protect, leaveTeam);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;