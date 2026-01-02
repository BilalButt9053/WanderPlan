const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reviews-controller');
const authMiddleware = require('../middleware/auth-middleware');
const optionalAuthMiddleware = require('../middleware/optional-auth-middleware');

router.get('/', optionalAuthMiddleware, ctrl.list);
router.post('/', authMiddleware, ctrl.create);
router.post('/:id/like', authMiddleware, ctrl.toggleLike);
router.post('/:id/helpful', authMiddleware, ctrl.toggleHelpful);
router.post('/:id/save', authMiddleware, ctrl.toggleSave);
router.post('/:id/comments', authMiddleware, ctrl.addComment);
router.put('/:id', authMiddleware, ctrl.update);
router.delete('/:id', authMiddleware, ctrl.deleteReview);

module.exports = router;
