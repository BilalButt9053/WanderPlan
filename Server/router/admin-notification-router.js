/**
 * Admin Notification Router
 * Routes for sending notifications/announcements
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const {
    sendNotificationToUser,
    broadcastNotification,
    broadcastBusinessNotification,
    getNotificationHistory,
    getNotificationStats
} = require('../controllers/admin-notification-controller');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Get notification stats
router.get('/stats', getNotificationStats);

// Get notification history
router.get('/history', getNotificationHistory);

// Send to specific user
router.post('/send', sendNotificationToUser);

// Broadcast to all users
router.post('/broadcast', broadcastNotification);

// Broadcast to all businesses
router.post('/broadcast-business', broadcastBusinessNotification);

module.exports = router;
