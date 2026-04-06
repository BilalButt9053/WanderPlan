/**
 * Admin Stats Router
 * Routes for dashboard analytics and statistics
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const {
    getDashboardStats,
    getUserTrends,
    getTripTrends,
    getBusinessTrends,
    getReviewTrends,
    getLeaderboard,
    getRecentActivity
} = require('../controllers/admin-stats-controller');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard overview
router.get('/dashboard', getDashboardStats);

// User trends
router.get('/users/trends', getUserTrends);

// Trip trends
router.get('/trips/trends', getTripTrends);

// Business trends
router.get('/businesses/trends', getBusinessTrends);

// Review trends
router.get('/reviews/trends', getReviewTrends);

// Gamification leaderboard
router.get('/leaderboard', getLeaderboard);

// Recent activity feed
router.get('/activity', getRecentActivity);

module.exports = router;
