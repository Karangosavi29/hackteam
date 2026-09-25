const Notification = require('../models/notification.model');

const create = async ({ recipientId, senderId = null, type, title, message = '', relatedId = null, relatedType = null }) => {
  if (senderId && recipientId.toString() === senderId.toString()) return null;

  return Notification.create({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    relatedId,
    relatedType,
  });
};

const getForUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};

const markRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }

  if (notification.recipient.toString() !== userId.toString()) {
    const err = new Error('You can only read your own notifications');
    err.status = 403;
    throw err;
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

const markAllRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true } }
  );
};

const remove = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }

  if (notification.recipient.toString() !== userId.toString()) {
    const err = new Error('You can only delete your own notifications');
    err.status = 403;
    throw err;
  }

  await notification.deleteOne();
};

module.exports = { create, getForUser, markRead, markAllRead, remove };