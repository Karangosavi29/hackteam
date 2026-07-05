const express = require('express');
const router = express.Router();
const {
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
} = require('../controllers/hackathon.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getHackathons);
router.get('/:id', getHackathon);
router.post('/', protect, createHackathon);
router.put('/:id', protect, updateHackathon);
router.delete('/:id', protect, deleteHackathon);

module.exports = router;