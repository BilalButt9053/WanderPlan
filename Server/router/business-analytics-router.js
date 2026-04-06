/**
 * Business Analytics Router
 * Routes for business dashboard analytics
 */

const express = require('express');
const router = express.Router();
const businessAuthMiddleware = require('../middleware/business-auth-middleware');
const {
    getDashboardAnalytics,
    getDealAnalytics,
    getMenuAnalytics,
    getReviewAnalytics,
    getEngagementTrend
} = require('../controllers/business-analytics-controller');

// All routes require business authentication
router.use(businessAuthMiddleware);

// Dashboard overview
router.get('/dashboard', getDashboardAnalytics);

// Deal analytics
router.get('/deals', getDealAnalytics);

// Menu analytics
router.get('/menu', getMenuAnalytics);

// Review analytics
router.get('/reviews', getReviewAnalytics);

// Engagement trend
router.get('/engagement', getEngagementTrend);

module.exports = router;
