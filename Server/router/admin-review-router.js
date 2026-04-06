/**
 * Admin Review Router
 * Routes for review moderation
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const {
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    deleteReview,
    getFlaggedReviews,
    bulkUpdateReviewStatus,
    getReviewStats
} = require('../controllers/admin-review-controller');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Get review stats
router.get('/stats', getReviewStats);

// Get flagged reviews
router.get('/flagged', getFlaggedReviews);

// Get all reviews
router.get('/', getAllReviews);

// Get single review
router.get('/:id', getReviewById);

// Update review status
router.patch('/:id/status', updateReviewStatus);

// Delete review
router.delete('/:id', deleteReview);

// Bulk update
router.patch('/bulk-update', bulkUpdateReviewStatus);

module.exports = router;
