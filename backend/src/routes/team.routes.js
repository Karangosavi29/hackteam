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
  transferLeadership,
} = require('../controllers/team.controller');
const { createTask, getTeamTasks } = require('../controllers/task.controller');
const { getTeamMessages, sendTeamMessage } = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', protect, createTeam);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, disbandTeam);
router.post('/:id/leave', protect, leaveTeam);
router.delete('/:id/members/:userId', protect, removeMember);
router.post('/:id/transfer-leadership', protect, transferLeadership);
router.post('/:teamId/tasks', protect, createTask);
router.get('/:teamId/tasks', protect, getTeamTasks);
router.get('/:teamId/messages', protect, getTeamMessages);
router.post('/:teamId/messages', protect, sendTeamMessage);

module.exports = router;