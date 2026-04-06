/**
 * Business Review Router
 * Routes for business review management and replies
 */

const express = require('express');
const router = express.Router();
const businessAuthMiddleware = require('../middleware/business-auth-middleware');
const {
    getBusinessReviews,
    getReviewById,
    replyToReview,
    updateReply,
    deleteReply,
    getReviewStats
} = require('../controllers/business-review-controller');

// All routes require business authentication
router.use(businessAuthMiddleware);

// Get review stats
router.get('/stats', getReviewStats);

// Get all reviews
router.get('/', getBusinessReviews);

// Get single review
router.get('/:id', getReviewById);

// Reply to review
router.post('/:id/reply', replyToReview);

// Update reply
router.put('/:id/reply', updateReply);

// Delete reply
router.delete('/:id/reply', deleteReply);

module.exports = router;
