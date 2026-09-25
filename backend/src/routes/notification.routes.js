const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

// A user can only ever see/act on their own notifications — enforced in the service
// layer (req.user._id is always the actor, never taken from params/body).
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;