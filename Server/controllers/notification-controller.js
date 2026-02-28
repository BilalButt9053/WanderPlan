const Notification = require('../modals/notification-modal');

// Get all notifications for a business
const getNotifications = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { business: businessId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.getUnreadCount(businessId)
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const businessId = req.businessId;
    const count = await Notification.getUnreadCount(businessId);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, business: businessId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const businessId = req.businessId;

    await Notification.updateMany(
      { business: businessId, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      business: businessId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    const businessId = req.businessId;

    await Notification.deleteMany({ business: businessId });

    res.status(200).json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    console.error('Clear all notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
};

// Create a test notification (useful for development)
const createTestNotification = async (req, res) => {
  try {
    const businessId = req.businessId;
    const { type, title, message, actionUrl } = req.body;

    const notification = await Notification.createNotification(
      businessId,
      type || 'system',
      title || 'Test Notification',
      message || 'This is a test notification',
      {},
      actionUrl
    );

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTestNotification
};
