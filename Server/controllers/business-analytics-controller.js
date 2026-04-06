/**
 * Business Analytics Controller
 * Provides analytics and statistics for business dashboard
 */

const Business = require("../modals/business-modal");
const MenuItem = require("../modals/menu-item-modal");
const Deal = require("../modals/deal-modal");
const Review = require("../modals/review-models");

/**
 * Get comprehensive business dashboard analytics
 * GET /api/business/analytics/dashboard
 */
const getDashboardAnalytics = async (req, res, next) => {
    try {
        const businessId = req.business._id;

        const [
            business,
            menuItemsCount,
            activeDeals,
            totalDeals,
            reviews,
            dealStats
        ] = await Promise.all([
            Business.findById(businessId).lean(),
            MenuItem.countDocuments({ business: businessId }),
            Deal.countDocuments({ business: businessId, status: 'active' }),
            Deal.countDocuments({ business: businessId }),
            Review.find({ place: businessId }).lean(),
            Deal.aggregate([
                { $match: { business: businessId } },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$analytics.views" },
                        totalClicks: { $sum: "$analytics.clicks" },
                        totalRedemptions: { $sum: "$analytics.redemptions" }
                    }
                }
            ])
        ]);

        // Calculate review stats
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        // Rating distribution
        const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
            rating,
            count: reviews.filter(r => r.rating === rating).length
        }));

        // Get recent reviews
        const recentReviews = reviews
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        // Deal analytics
        const dealAnalytics = dealStats[0] || { totalViews: 0, totalClicks: 0, totalRedemptions: 0 };

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalMenuItems: menuItemsCount,
                    activeDeals,
                    totalDeals,
                    totalReviews,
                    averageRating: parseFloat(averageRating),
                    verificationStatus: business.isVerified ? 'verified' : 'unverified'
                },
                engagement: {
                    totalViews: dealAnalytics.totalViews,
                    totalClicks: dealAnalytics.totalClicks,
                    totalRedemptions: dealAnalytics.totalRedemptions,
                    clickThroughRate: dealAnalytics.totalViews > 0
                        ? ((dealAnalytics.totalClicks / dealAnalytics.totalViews) * 100).toFixed(1)
                        : 0,
                    conversionRate: dealAnalytics.totalClicks > 0
                        ? ((dealAnalytics.totalRedemptions / dealAnalytics.totalClicks) * 100).toFixed(1)
                        : 0
                },
                reviews: {
                    total: totalReviews,
                    average: parseFloat(averageRating),
                    distribution: ratingDistribution,
                    recent: recentReviews
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get deal performance analytics
 * GET /api/business/analytics/deals
 */
const getDealAnalytics = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { period = '30days' } = req.query;

        let days = 30;
        if (period === '7days') days = 7;
        if (period === '90days') days = 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const deals = await Deal.find({
            business: businessId,
            createdAt: { $gte: startDate }
        }).lean();

        // Group by status
        const byStatus = deals.reduce((acc, deal) => {
            acc[deal.status] = (acc[deal.status] || 0) + 1;
            return acc;
        }, {});

        // Calculate totals
        const totals = deals.reduce((acc, deal) => {
            acc.views += deal.analytics?.views || 0;
            acc.clicks += deal.analytics?.clicks || 0;
            acc.redemptions += deal.analytics?.redemptions || 0;
            return acc;
        }, { views: 0, clicks: 0, redemptions: 0 });

        // Top performing deals
        const topDeals = deals
            .sort((a, b) => (b.analytics?.redemptions || 0) - (a.analytics?.redemptions || 0))
            .slice(0, 5)
            .map(d => ({
                _id: d._id,
                title: d.title,
                type: d.type,
                discountValue: d.discountValue,
                analytics: d.analytics,
                status: d.status
            }));

        res.status(200).json({
            success: true,
            data: {
                period,
                totalDeals: deals.length,
                byStatus,
                totals,
                topPerforming: topDeals
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get menu item performance analytics
 * GET /api/business/analytics/menu
 */
const getMenuAnalytics = async (req, res, next) => {
    try {
        const businessId = req.business._id;

        const menuItems = await MenuItem.find({ business: businessId }).lean();

        // Group by category
        const byCategory = menuItems.reduce((acc, item) => {
            const cat = item.category || 'uncategorized';
            if (!acc[cat]) {
                acc[cat] = { count: 0, avgPrice: 0, totalPrice: 0 };
            }
            acc[cat].count++;
            acc[cat].totalPrice += item.price || 0;
            return acc;
        }, {});

        // Calculate averages
        Object.keys(byCategory).forEach(cat => {
            byCategory[cat].avgPrice = (byCategory[cat].totalPrice / byCategory[cat].count).toFixed(0);
            delete byCategory[cat].totalPrice;
        });

        // Price range
        const prices = menuItems.map(i => i.price || 0).filter(p => p > 0);
        const priceRange = {
            min: Math.min(...prices) || 0,
            max: Math.max(...prices) || 0,
            average: prices.length > 0
                ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0)
                : 0
        };

        // Availability stats
        const availableCount = menuItems.filter(i => i.isAvailable).length;
        const featuredCount = menuItems.filter(i => i.isFeatured).length;

        res.status(200).json({
            success: true,
            data: {
                totalItems: menuItems.length,
                available: availableCount,
                unavailable: menuItems.length - availableCount,
                featured: featuredCount,
                byCategory,
                priceRange
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get review analytics
 * GET /api/business/analytics/reviews
 */
const getReviewAnalytics = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { period = '30days' } = req.query;

        let days = 30;
        if (period === '7days') days = 7;
        if (period === '90days') days = 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // All reviews
        const allReviews = await Review.find({ place: businessId }).lean();

        // Reviews in period
        const periodReviews = allReviews.filter(r => new Date(r.createdAt) >= startDate);

        // Reviews by day (for chart)
        const reviewsByDay = await Review.aggregate([
            {
                $match: {
                    place: businessId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Sentiment analysis (simple)
        const positiveReviews = allReviews.filter(r => r.rating >= 4).length;
        const neutralReviews = allReviews.filter(r => r.rating === 3).length;
        const negativeReviews = allReviews.filter(r => r.rating <= 2).length;

        res.status(200).json({
            success: true,
            data: {
                period,
                total: allReviews.length,
                inPeriod: periodReviews.length,
                averageRating: allReviews.length > 0
                    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
                    : 0,
                trend: reviewsByDay,
                sentiment: {
                    positive: positiveReviews,
                    neutral: neutralReviews,
                    negative: negativeReviews
                },
                distribution: [5, 4, 3, 2, 1].map(rating => ({
                    rating,
                    count: allReviews.filter(r => r.rating === rating).length,
                    percentage: allReviews.length > 0
                        ? ((allReviews.filter(r => r.rating === rating).length / allReviews.length) * 100).toFixed(1)
                        : 0
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get visibility/engagement trend
 * GET /api/business/analytics/engagement
 */
const getEngagementTrend = async (req, res, next) => {
    try {
        const businessId = req.business._id;
        const { period = '30days' } = req.query;

        let days = 30;
        if (period === '7days') days = 7;
        if (period === '90days') days = 90;

        // For now, return deal analytics as engagement metric
        // In a real app, you'd track profile views, searches, etc.
        const deals = await Deal.find({
            business: businessId
        }).lean();

        const totalEngagement = deals.reduce((acc, deal) => {
            acc.views += deal.analytics?.views || 0;
            acc.clicks += deal.analytics?.clicks || 0;
            acc.redemptions += deal.analytics?.redemptions || 0;
            return acc;
        }, { views: 0, clicks: 0, redemptions: 0 });

        // Calculate visibility score (0-100)
        const maxScore = 100;
        const visibilityScore = Math.min(
            maxScore,
            Math.floor(
                (totalEngagement.views * 0.1) +
                (totalEngagement.clicks * 0.3) +
                (totalEngagement.redemptions * 0.5)
            )
        );

        res.status(200).json({
            success: true,
            data: {
                period,
                visibilityScore,
                engagement: totalEngagement,
                tips: [
                    visibilityScore < 30 ? 'Add more deals to increase visibility' : null,
                    totalEngagement.clicks < 10 ? 'Update your business photos to attract more clicks' : null,
                    totalEngagement.redemptions < 5 ? 'Create attractive discount offers' : null
                ].filter(Boolean)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardAnalytics,
    getDealAnalytics,
    getMenuAnalytics,
    getReviewAnalytics,
    getEngagementTrend
};
