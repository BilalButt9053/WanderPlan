/**
 * Business Review Controller
 * Handles review viewing and replying for businesses
 */

const Review = require("../modals/review-models");

/**
 * Get all reviews for the business
 * GET /api/business/reviews
 */
const getBusinessReviews = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const {
            status,
            minRating,
            maxRating,
            hasReply,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Build filter
        const filter = { place: businessId };

        if (status) {
            filter.status = status;
        }

        if (minRating || maxRating) {
            filter.rating = {};
            if (minRating) filter.rating.$gte = parseInt(minRating);
            if (maxRating) filter.rating.$lte = parseInt(maxRating);
        }

        if (hasReply !== undefined) {
            if (hasReply === 'true') {
                filter['businessReply.text'] = { $exists: true, $ne: null };
            } else {
                filter.$or = [
                    { 'businessReply.text': { $exists: false } },
                    { 'businessReply.text': null }
                ];
            }
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
 * Get single review
 * GET /api/business/reviews/:id
 */
const getReviewById = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { id } = req.params;

        const review = await Review.findOne({ _id: id, place: businessId });

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
 * Reply to a review
 * POST /api/business/reviews/:id/reply
 */
const replyToReview = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { id } = req.params;
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Reply text is required"
            });
        }

        const review = await Review.findOne({ _id: id, place: businessId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Add business reply
        review.businessReply = {
            text: text.trim(),
            repliedAt: new Date(),
            repliedBy: businessId
        };

        await review.save();

        res.status(200).json({
            success: true,
            message: "Reply added successfully",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update reply to a review
 * PUT /api/business/reviews/:id/reply
 */
const updateReply = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { id } = req.params;
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Reply text is required"
            });
        }

        const review = await Review.findOne({ _id: id, place: businessId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (!review.businessReply?.text) {
            return res.status(400).json({
                success: false,
                message: "No reply exists to update. Use POST to create a reply."
            });
        }

        // Update business reply
        review.businessReply.text = text.trim();
        review.businessReply.updatedAt = new Date();

        await review.save();

        res.status(200).json({
            success: true,
            message: "Reply updated successfully",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete reply from a review
 * DELETE /api/business/reviews/:id/reply
 */
const deleteReply = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { id } = req.params;

        const review = await Review.findOne({ _id: id, place: businessId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Remove business reply
        review.businessReply = undefined;
        await review.save();

        res.status(200).json({
            success: true,
            message: "Reply deleted successfully",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get review statistics for business
 * GET /api/business/reviews/stats
 */
const getReviewStats = async (req, res, next) => {
    try {
        const businessId = req.business._id;

        const reviews = await Review.find({ place: businessId }).lean();

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const repliedCount = reviews.filter(r => r.businessReply?.text).length;
        const unrepliedCount = totalReviews - repliedCount;

        // Rating distribution
        const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length,
            percentage: totalReviews > 0
                ? ((reviews.filter(r => r.rating === rating).length / totalReviews) * 100).toFixed(1)
                : 0
        }));

        // Recent reviews needing reply
        const needsReply = reviews
            .filter(r => !r.businessReply?.text)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                totalReviews,
                averageRating: parseFloat(averageRating),
                repliedCount,
                unrepliedCount,
                replyRate: totalReviews > 0
                    ? ((repliedCount / totalReviews) * 100).toFixed(1)
                    : 0,
                ratingDistribution,
                needsReply
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBusinessReviews,
    getReviewById,
    replyToReview,
    updateReply,
    deleteReply,
    getReviewStats
};
