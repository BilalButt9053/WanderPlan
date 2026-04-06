/**
 * Admin Review Controller
 * Handles review moderation for admin panel
 */

const Review = require("../modals/review-models");
const User = require("../modals/user-modals");

/**
 * Get all reviews with filters
 * GET /api/admin/reviews
 */
const getAllReviews = async (req, res, next) => {
    try {
        const {
            status,
            category,
            minRating,
            maxRating,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Build filter
        const filter = {};

        if (status) {
            filter.status = status;
        }

        if (category) {
            filter.category = category;
        }

        if (minRating || maxRating) {
            filter.rating = {};
            if (minRating) filter.rating.$gte = parseInt(minRating);
            if (maxRating) filter.rating.$lte = parseInt(maxRating);
        }

        if (search) {
            filter.$or = [
                { text: { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { place: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [reviews, total] = await Promise.all([
            Review.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
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
 * Get single review details
 * GET /api/admin/reviews/:id
 */
const getReviewById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id).lean();

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update review status (moderate)
 * PATCH /api/admin/reviews/:id/status
 */
const updateReviewStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['active', 'flagged', 'removed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'active', 'flagged', or 'removed'"
            });
        }

        const review = await Review.findByIdAndUpdate(
            id,
            {
                status,
                $push: status === 'flagged' || status === 'removed' ? {
                    flags: {
                        reason: reason || `Admin action: ${status}`,
                        flaggedAt: new Date(),
                        flaggedBy: req.user._id
                    }
                } : undefined
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Review status updated to ${status}`,
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete review permanently
 * DELETE /api/admin/reviews/:id
 */
const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted permanently"
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get flagged reviews that need attention
 * GET /api/admin/reviews/flagged
 */
const getFlaggedReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reviews, total] = await Promise.all([
            Review.find({ status: 'flagged' })
                .sort({ 'flags.flaggedAt': -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments({ status: 'flagged' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                reviews,
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
 * Bulk update review statuses
 * PATCH /api/admin/reviews/bulk-update
 */
const bulkUpdateReviewStatus = async (req, res, next) => {
    try {
        const { reviewIds, status, reason } = req.body;

        if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "reviewIds must be a non-empty array"
            });
        }

        if (!['active', 'flagged', 'removed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const updateData = { status };
        if (status === 'flagged' || status === 'removed') {
            updateData.$push = {
                flags: {
                    reason: reason || `Bulk admin action: ${status}`,
                    flaggedAt: new Date(),
                    flaggedBy: req.user._id
                }
            };
        }

        const result = await Review.updateMany(
            { _id: { $in: reviewIds } },
            updateData
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} reviews updated`,
            data: { modifiedCount: result.modifiedCount }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get review statistics for admin dashboard
 * GET /api/admin/reviews/stats
 */
const getReviewStats = async (req, res, next) => {
    try {
        const [
            totalReviews,
            activeReviews,
            flaggedReviews,
            removedReviews,
            avgRating,
            ratingDistribution,
            recentFlagged
        ] = await Promise.all([
            Review.countDocuments(),
            Review.countDocuments({ status: 'active' }),
            Review.countDocuments({ status: 'flagged' }),
            Review.countDocuments({ status: 'removed' }),
            Review.aggregate([
                { $group: { _id: null, avg: { $avg: "$rating" } } }
            ]),
            Review.aggregate([
                { $group: { _id: "$rating", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            Review.find({ status: 'flagged' })
                .sort({ 'flags.flaggedAt': -1 })
                .limit(5)
                .lean()
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalReviews,
                activeReviews,
                flaggedReviews,
                removedReviews,
                averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
                ratingDistribution: ratingDistribution.map(r => ({
                    rating: r._id,
                    count: r.count
                })),
                recentFlagged
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    deleteReview,
    getFlaggedReviews,
    bulkUpdateReviewStatus,
    getReviewStats
};
