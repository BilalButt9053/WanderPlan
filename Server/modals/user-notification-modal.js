const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'badge', 'reward', 'trip', 'review', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  actionUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
userNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Static method to create notification
userNotificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}, actionUrl = null) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    data,
    actionUrl
  });
};

// Static method to get unread count
userNotificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = UserNotification;
