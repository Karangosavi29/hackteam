const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'TEAM_REQUEST',
  'REQUEST_ACCEPTED',
  'REQUEST_REJECTED',
  'TEAM_JOINED',
  'TEAM_MEMBER_REMOVED',
  'TEAM_INVITATION',
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'HACKATHON_DEADLINE',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for system-generated notifications (e.g. deadline reminders)
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    // Generic pointer to whatever this notification is about (a Team, Request, Task...)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedType: {
      type: String,
      enum: ['Team', 'Request', 'Task', 'Hackathon', null],
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Supports the notification bell's "unread count" query and the main feed query
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

notificationSchema.statics.TYPES = NOTIFICATION_TYPES;

module.exports = mongoose.model('Notification', notificationSchema);