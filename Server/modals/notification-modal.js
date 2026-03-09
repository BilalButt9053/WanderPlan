const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['review', 'deal', 'booking', 'message', 'system', 'alert'],
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
    // Additional data related to the notification
    // e.g., reviewId, dealId, userId, etc.
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
notificationSchema.index({ business: 1, read: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(businessId, type, title, message, data = {}, actionUrl = null) {
  return this.create({
    business: businessId,
    type,
    title,
    message,
    data,
    actionUrl
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(businessId) {
  return this.countDocuments({ business: businessId, read: false });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
