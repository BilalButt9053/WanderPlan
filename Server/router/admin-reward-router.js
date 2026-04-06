/**
 * Admin Reward Router
 * Routes for gamification/reward management
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const {
    getAllRewards,
    createReward,
    getRewardById,
    updateReward,
    deleteReward,
    awardPoints,
    awardBadge,
    getGamificationConfig,
    getRewardStats
} = require('../controllers/admin-reward-controller');

// All routes require admin authentication
router.use(authMiddleware);
router.use(adminMiddleware);

// Get gamification config
router.get('/config', getGamificationConfig);

// Get reward stats
router.get('/stats', getRewardStats);

// Award points to user
router.post('/award-points', awardPoints);

// Award badge to user
router.post('/award-badge', awardBadge);

// CRUD for rewards
router.get('/', getAllRewards);
router.post('/', createReward);
router.get('/:id', getRewardById);
router.patch('/:id', updateReward);
router.delete('/:id', deleteReward);

module.exports = router;
