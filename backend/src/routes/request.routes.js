const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getIncoming,
  getOutgoing,
  acceptRequest,
  rejectRequest,
  withdrawRequest,
} = require('../controllers/request.controller');
const { protect } = require('../middlewares/auth.middleware');

// All request routes are protected
router.use(protect);

router.post('/', sendRequest);
router.get('/incoming', getIncoming);
router.get('/outgoing', getOutgoing);
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id', withdrawRequest);

module.exports = router;