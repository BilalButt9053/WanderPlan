const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const {
  getProfileStats,
  getRewards,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSavedTrips
} = require('../controllers/user-profile-controller');

// All routes require authentication
router.use(authMiddleware);

// Profile stats
router.get('/profile-stats', getProfileStats);

// Rewards
router.get('/rewards', getRewards);

// Saved trips
router.get('/saved-trips', getSavedTrips);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/mark-all-read', markAllNotificationsAsRead);
router.put('/notifications/:id/read', markNotificationAsRead);

module.exports = router;
