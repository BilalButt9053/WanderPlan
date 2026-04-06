/**
 * Admin Reward Controller
 * Handles reward/gamification management for admin panel
 */

const Reward = require("../modals/reward-modal");
const User = require("../modals/user-modals");
const UserNotification = require("../modals/user-notification-modal");

/**
 * Get all rewards with filters
 * GET /api/admin/rewards
 */
const getAllRewards = async (req, res, next) => {
    try {
        const {
            type,
            isUsed,
            user,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Build filter
        const filter = {};

        if (type) {
            filter.type = type;
        }

        if (isUsed !== undefined) {
            filter.isUsed = isUsed === 'true';
        }

        if (user) {
            filter.user = user;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [rewards, total] = await Promise.all([
            Reward.find(filter)
                .populate('user', 'fullName email profilePhoto')
                .populate('relatedBusiness', 'businessName')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Reward.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                rewards,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new reward for a user
 * POST /api/admin/rewards
 */
const createReward = async (req, res, next) => {
    try {
        const {
            user,
            type,
            title,
            description,
            code,
            discountValue,
            discountType,
            validFrom,
            validUntil,
            earnedFor,
            relatedBusiness
        } = req.body;

        // Validate required fields
        if (!user || !type || !title) {
            return res.status(400).json({
                success: false,
                message: "user, type, and title are required"
            });
        }

        // Check if user exists
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate code if not provided
        const rewardCode = code || `${type.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        const reward = await Reward.create({
            user,
            type,
            title,
            description,
            code: rewardCode,
            discountValue,
            discountType,
            validFrom: validFrom || new Date(),
            validUntil,
            earnedFor,
            relatedBusiness
        });

        // Notify user about the reward
        await UserNotification.createNotification({
            user,
            type: 'reward',
            title: 'New Reward Earned!',
            message: `You earned a new reward: ${title}`,
            data: { rewardId: reward._id, type }
        });

        res.status(201).json({
            success: true,
            message: "Reward created successfully",
            data: reward
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reward by ID
 * GET /api/admin/rewards/:id
 */
const getRewardById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const reward = await Reward.findById(id)
            .populate('user', 'fullName email profilePhoto')
            .populate('relatedBusiness', 'businessName');

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found"
            });
        }

        res.status(200).json({
            success: true,
            data: reward
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update reward
 * PATCH /api/admin/rewards/:id
 */
const updateReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow changing user
        delete updates.user;

        const reward = await Reward.findByIdAndUpdate(id, updates, { new: true });

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Reward updated successfully",
            data: reward
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete reward
 * DELETE /api/admin/rewards/:id
 */
const deleteReward = async (req, res, next) => {
    try {
        const { id } = req.params;

        const reward = await Reward.findByIdAndDelete(id);

        if (!reward) {
            return res.status(404).json({
                success: false,
                message: "Reward not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Reward deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Award points to a user
 * POST /api/admin/rewards/award-points
 */
const awardPoints = async (req, res, next) => {
    try {
        const { userId, points, reason } = req.body;

        if (!userId || !points) {
            return res.status(400).json({
                success: false,
                message: "userId and points are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update user points
        const currentPoints = user.contribution?.points || 0;
        const newPoints = currentPoints + parseInt(points);

        // Calculate level based on points
        let level = 'beginner';
        if (newPoints >= 5000) level = 'legend';
        else if (newPoints >= 2000) level = 'expert';
        else if (newPoints >= 1000) level = 'advanced';
        else if (newPoints >= 500) level = 'intermediate';

        await User.findByIdAndUpdate(userId, {
            'contribution.points': newPoints,
            'contribution.level': level,
            'contribution.lastAwardedAt': new Date()
        });

        // Notify user
        await UserNotification.createNotification({
            user: userId,
            type: 'points_bonus',
            title: 'Points Awarded!',
            message: `You received ${points} points! ${reason || ''}`,
            data: { points, reason }
        });

        res.status(200).json({
            success: true,
            message: `${points} points awarded to user`,
            data: {
                userId,
                previousPoints: currentPoints,
                newPoints,
                level
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Award badge to a user
 * POST /api/admin/rewards/award-badge
 */
const awardBadge = async (req, res, next) => {
    try {
        const { userId, badge, reason } = req.body;

        if (!userId || !badge || !badge.name) {
            return res.status(400).json({
                success: false,
                message: "userId and badge with name are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if badge already exists
        const existingBadge = user.contribution?.badges?.find(b => b.name === badge.name);
        if (existingBadge) {
            return res.status(400).json({
                success: false,
                message: "User already has this badge"
            });
        }

        // Add badge
        const newBadge = {
            name: badge.name,
            icon: badge.icon || '🏆',
            earnedAt: new Date()
        };

        await User.findByIdAndUpdate(userId, {
            $push: { 'contribution.badges': newBadge }
        });

        // Notify user
        await UserNotification.createNotification({
            user: userId,
            type: 'badge',
            title: 'New Badge Earned!',
            message: `You earned the "${badge.name}" badge! ${reason || ''}`,
            data: { badge: newBadge }
        });

        res.status(200).json({
            success: true,
            message: `Badge "${badge.name}" awarded to user`,
            data: { userId, badge: newBadge }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get gamification config (points system)
 * GET /api/admin/rewards/config
 */
const getGamificationConfig = async (req, res, next) => {
    try {
        // This could be stored in a Config collection, for now return defaults
        const config = {
            pointsPerReview: 10,
            pointsPerTrip: 50,
            pointsPerLike: 1,
            pointsPerHelpful: 2,
            levelThresholds: {
                beginner: 0,
                intermediate: 500,
                advanced: 1000,
                expert: 2000,
                legend: 5000
            },
            availableBadges: [
                { name: 'Explorer', icon: '🗺️', description: 'Created first trip' },
                { name: 'Reviewer', icon: '⭐', description: 'Posted 10 reviews' },
                { name: 'Adventurer', icon: '🏔️', description: 'Completed 5 trips' },
                { name: 'Social Butterfly', icon: '🦋', description: 'Received 50 likes' },
                { name: 'Helpful Guide', icon: '🧭', description: 'Marked helpful 100 times' },
                { name: 'Frequent Traveler', icon: '✈️', description: 'Completed 10 trips' },
                { name: 'Community Leader', icon: '👑', description: 'Top 10 contributor' }
            ]
        };

        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get reward statistics
 * GET /api/admin/rewards/stats
 */
const getRewardStats = async (req, res, next) => {
    try {
        const [
            totalRewards,
            usedRewards,
            byType,
            recentRewards
        ] = await Promise.all([
            Reward.countDocuments(),
            Reward.countDocuments({ isUsed: true }),
            Reward.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ]),
            Reward.find()
                .populate('user', 'fullName email')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalRewards,
                usedRewards,
                unusedRewards: totalRewards - usedRewards,
                byType: byType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentRewards
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRewards,
    createReward,
    getRewardById,
    updateReward,
    deleteReward,
    awardPoints,
    awardBadge,
    getGamificationConfig,
    getRewardStats
};
