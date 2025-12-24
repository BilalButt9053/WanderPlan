const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const optionalAuth = require('../middleware/optional-auth-middleware');
const reviews = require('../controllers/reviews-controller');
const adminOnly = require('../middleware/admin-middleware');

// Public (but better with optional auth)
router.get('/', optionalAuth, reviews.list);

// Auth required
router.post('/', auth, reviews.create);
router.put('/:id', auth, reviews.updateReview);
router.delete('/:id', auth, reviews.deleteReview);
router.post('/:id/like', auth, reviews.toggleLike);
router.post('/:id/helpful', auth, reviews.toggleHelpful);
router.get('/:id/comments', reviews.getComments); // public read
router.post('/:id/comments', auth, reviews.addComment);
router.post('/:id/report', auth, reviews.reportReview);
router.post('/:id/moderate', auth, adminOnly, reviews.moderateReview);

module.exports = router;
