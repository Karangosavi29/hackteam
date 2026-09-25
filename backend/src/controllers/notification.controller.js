const asyncHandler = require('../middlewares/asyncHandler');
const notificationService = require('../services/notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getForUser(req.user._id, { page, limit });
  res.status(200).json({ success: true, ...result });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user._id);
  res.status(200).json({ success: true, notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user._id);
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };