const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const { updateReviewStatus } = require('../controllers/admin-review-controller');

router.use(authMiddleware);
router.use(adminMiddleware);

router.patch('/:id/status', updateReviewStatus);

module.exports = router;
