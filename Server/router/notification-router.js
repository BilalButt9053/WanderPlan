const express = require('express');
const router = express.Router();
const businessAuthMiddleware = require('../middleware/business-auth-middleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTestNotification
} = require('../controllers/notification-controller');

// All routes require business authentication
router.use(businessAuthMiddleware);

// Get all notifications
router.get('/', getNotifications);

// Get unread count only
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Clear all notifications
router.delete('/clear-all', clearAllNotifications);

// Create test notification (development only)
router.post('/test', createTestNotification);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

module.exports = router;
