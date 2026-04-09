/**
 * Admin Stats Controller
 * Provides dashboard analytics and statistics for the admin panel
 */

const User = require("../modals/user-modals");
const Business = require("../modals/business-modal");
const Trip = require("../modals/trip-modal");
const Review = require("../modals/review-models");
const Complaint = require("../modals/complaint-modal");
const Reward = require("../modals/reward-modal");
const Deal = require("../modals/deal-modal");
const mongoose = require("mongoose");

/**
 * Get comprehensive dashboard statistics
 * GET /api/admin/stats/dashboard
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const { businessId } = req.query;

        if (businessId) {
            if (!mongoose.Types.ObjectId.isValid(businessId)) {
                return res.status(400).json({ message: "Invalid businessId" });
            }

            const [business, totalReviews, flaggedReviews, activeDeals, totalDeals] = await Promise.all([
                Business.findById(businessId).select('businessName status isVerified createdAt'),
                Review.countDocuments({ place: businessId }),
                Review.countDocuments({ place: businessId, status: 'flagged' }),
                Deal.countDocuments({ business: businessId, status: 'active' }),
                Deal.countDocuments({ business: businessId }),
            ]);

            if (!business) {
                return res.status(404).json({ message: "Business not found" });
            }

            const pendingBusinesses = business.status === 'pending' ? 1 : 0;
            const approvedBusinesses = business.status === 'approved' ? 1 : 0;

            return res.status(200).json({
                success: true,
                data: {
                    overview: {
                        totalUsers: 0,
                        activeUsersToday: 0,
                        userGrowth: 0,
                        totalBusinesses: 1,
                        pendingBusinesses,
                        approvedBusinesses,
                        totalTrips: 0,
                        completedTrips: 0,
                        ongoingTrips: 0,
                        totalReviews,
                        flaggedReviews,
                        pendingComplaints: 0,
                        totalComplaints: 0,
                        activeDeals,
                        totalRewards: totalDeals,
                        selectedBusiness: {
                            _id: business._id,
                            businessName: business.businessName,
                            status: business.status,
                            isVerified: business.isVerified,
                            createdAt: business.createdAt,
                        }
                    },
                    alerts: {
                        pendingBusinessApprovals: pendingBusinesses,
                        flaggedReviewsCount: flaggedReviews,
                        pendingComplaintsCount: 0
                    }
                }
            });
        }

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Parallel queries for better performance
        const [
            totalUsers,
            activeUsersToday,
            newUsersThisMonth,
            newUsersLastMonth,
            totalBusinesses,
            pendingBusinesses,
            approvedBusinesses,
            totalTrips,
            completedTrips,
            ongoingTrips,
            totalReviews,
            flaggedReviews,
            pendingComplaints,
            totalComplaints,
            activeDeals,
            totalRewards
        ] = await Promise.all([
            User.countDocuments({ isDeleted: { $ne: true } }),
            User.countDocuments({ lastActive: { $gte: startOfToday } }),
            User.countDocuments({ createdAt: { $gte: startOfMonth } }),
            User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } }),
            Business.countDocuments(),
            Business.countDocuments({ status: 'pending' }),
            Business.countDocuments({ status: 'approved' }),
            Trip.countDocuments({ isDeleted: { $ne: true } }),
            Trip.countDocuments({ status: 'completed', isDeleted: { $ne: true } }),
            Trip.countDocuments({ status: 'ongoing', isDeleted: { $ne: true } }),
            Review.countDocuments(),
            Review.countDocuments({ status: 'flagged' }),
            Complaint.countDocuments({ status: 'pending' }),
            Complaint.countDocuments(),
            Deal.countDocuments({ status: 'active' }),
            Reward.countDocuments()
        ]);

        // Calculate growth percentages
        const userGrowth = newUsersLastMonth > 0
            ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1)
            : newUsersThisMonth > 0 ? 100 : 0;

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeUsersToday,
                    userGrowth: parseFloat(userGrowth),
                    totalBusinesses,
                    pendingBusinesses,
                    approvedBusinesses,
                    totalTrips,
                    completedTrips,
                    ongoingTrips,
                    totalReviews,
                    flaggedReviews,
                    pendingComplaints,
                    totalComplaints,
                    activeDeals,
                    totalRewards
                },
                alerts: {
                    pendingBusinessApprovals: pendingBusinesses,
                    flaggedReviewsCount: flaggedReviews,
                    pendingComplaintsCount: pendingComplaints
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user registration trends
 * GET /api/admin/stats/users/trends
 */
const getUserTrends = async (req, res, next) => {
    try {
        const { period = '30days' } = req.query;

        let days = 30;
        if (period === '7days') days = 7;
        if (period === '90days') days = 90;
        if (period === '365days') days = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const registrations = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isDeleted: { $ne: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: "$_id.day"
                        }
                    },
                    count: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: registrations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get trip trends and statistics
 * GET /api/admin/stats/trips/trends
 */
const getTripTrends = async (req, res, next) => {
    try {
        const { period = '30days' } = req.query;

        let days = 30;
        if (period === '7days') days = 7;
        if (period === '90days') days = 90;
        if (period === '365days') days = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [tripsByDay, tripsByStatus, popularDestinations, avgBudget] = await Promise.all([
            // Trips created by day
            Trip.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate },
                        isDeleted: { $ne: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $dateFromParts: {
                                year: "$_id.year",
                                month: "$_id.month",
                                day: "$_id.day"
                            }
                        },
                        count: 1
                    }
                }
            ]),
            // Trips by status
            Trip.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            // Popular destinations
            Trip.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                { $group: { _id: "$destination.name", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            // Average budget
            Trip.aggregate([
                { $match: { isDeleted: { $ne: true } } },
                { $group: { _id: null, avgBudget: { $avg: "$totalBudget" } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                tripsByDay,
                tripsByStatus: tripsByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                popularDestinations: popularDestinations.filter(d => d._id).map(d => ({
                    name: d._id,
                    count: d.count
                })),
                averageBudget: avgBudget[0]?.avgBudget || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get business statistics
 * GET /api/admin/stats/businesses/trends
 */
const getBusinessTrends = async (req, res, next) => {
    try {
        const { businessId } = req.query;
        const businessMatch = {};

        if (businessId) {
            if (!mongoose.Types.ObjectId.isValid(businessId)) {
                return res.status(400).json({ message: "Invalid businessId" });
            }
            businessMatch._id = new mongoose.Types.ObjectId(businessId);
        }

        const [byStatus, byCategory, registrationTrend] = await Promise.all([
            // Businesses by status
            Business.aggregate([
                ...(Object.keys(businessMatch).length ? [{ $match: businessMatch }] : []),
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            // Businesses by category
            Business.aggregate([
                ...(Object.keys(businessMatch).length ? [{ $match: businessMatch }] : []),
                { $group: { _id: "$businessType", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            // Registration trend (last 30 days)
            Business.aggregate([
                {
                    $match: {
                        ...businessMatch,
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byCategory: byCategory.map(c => ({
                    category: c._id,
                    count: c.count
                })),
                registrationTrend
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get review statistics
 * GET /api/admin/stats/reviews/trends
 */
const getReviewTrends = async (req, res, next) => {
    try {
        const { businessId } = req.query;
        const reviewBaseMatch = {};

        if (businessId) {
            if (!mongoose.Types.ObjectId.isValid(businessId)) {
                return res.status(400).json({ message: "Invalid businessId" });
            }
            reviewBaseMatch.place = new mongoose.Types.ObjectId(businessId);
        }

        const [byStatus, byRating, recentTrend, categoryBreakdown] = await Promise.all([
            // Reviews by status
            Review.aggregate([
                ...(Object.keys(reviewBaseMatch).length ? [{ $match: reviewBaseMatch }] : []),
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]),
            // Reviews by rating
            Review.aggregate([
                ...(Object.keys(reviewBaseMatch).length ? [{ $match: reviewBaseMatch }] : []),
                { $group: { _id: "$rating", count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),
            // Recent review trend (last 30 days)
            Review.aggregate([
                {
                    $match: {
                        ...reviewBaseMatch,
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
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
            ]),
            // By category
            Review.aggregate([
                ...(Object.keys(reviewBaseMatch).length ? [{ $match: reviewBaseMatch }] : []),
                { $group: { _id: "$category", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                byStatus: byStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                byRating: byRating.map(r => ({
                    rating: r._id,
                    count: r.count
                })),
                recentTrend,
                categoryBreakdown: categoryBreakdown.map(c => ({
                    category: c._id,
                    count: c.count,
                    avgRating: c.avgRating?.toFixed(1) || 0
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get gamification leaderboard
 * GET /api/admin/stats/leaderboard
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;

        const leaderboard = await User.find({
            isDeleted: { $ne: true },
            'contribution.points': { $gt: 0 }
        })
        .select('fullName email profilePhoto contribution')
        .sort({ 'contribution.points': -1 })
        .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            data: leaderboard.map((user, index) => ({
                rank: index + 1,
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePhoto: user.profilePhoto,
                points: user.contribution?.points || 0,
                level: user.contribution?.level || 'beginner',
                badges: user.contribution?.badges || []
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get recent activity feed
 * GET /api/admin/stats/activity
 */
const getRecentActivity = async (req, res, next) => {
    try {
        const { limit = 20 } = req.query;

        // Fetch recent items from various collections
        const [recentUsers, recentBusinesses, recentTrips, recentReviews, recentComplaints] =
            await Promise.all([
                User.find({ isDeleted: { $ne: true } })
                    .select('fullName email createdAt')
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
                Business.find()
                    .select('businessName status createdAt approvedAt')
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
                Trip.find({ isDeleted: { $ne: true } })
                    .select('title destination.name status createdAt')
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
                Review.find()
                    .select('user.name place rating createdAt')
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean(),
                Complaint.find()
                    .select('subject type status createdAt')
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean()
            ]);

        // Combine and format activities
        const activities = [
            ...recentUsers.map(u => ({
                type: 'user_registered',
                message: `New user registered: ${u.fullName}`,
                timestamp: u.createdAt,
                data: { userId: u._id, email: u.email }
            })),
            ...recentBusinesses.map(b => ({
                type: b.status === 'pending' ? 'business_registered' : 'business_status_changed',
                message: `Business ${b.status}: ${b.businessName}`,
                timestamp: b.approvedAt || b.createdAt,
                data: { businessId: b._id, status: b.status }
            })),
            ...recentTrips.map(t => ({
                type: 'trip_created',
                message: `Trip created: ${t.title} to ${t.destination?.name || 'Unknown'}`,
                timestamp: t.createdAt,
                data: { tripId: t._id, status: t.status }
            })),
            ...recentReviews.map(r => ({
                type: 'review_posted',
                message: `Review posted by ${r.user?.name || 'User'}: ${r.rating} stars`,
                timestamp: r.createdAt,
                data: { reviewId: r._id, place: r.place }
            })),
            ...recentComplaints.map(c => ({
                type: 'complaint_submitted',
                message: `${c.type} complaint: ${c.subject}`,
                timestamp: c.createdAt,
                data: { complaintId: c._id, status: c.status }
            }))
        ];

        // Sort by timestamp and limit
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            success: true,
            data: activities.slice(0, parseInt(limit))
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getUserTrends,
    getTripTrends,
    getBusinessTrends,
    getReviewTrends,
    getLeaderboard,
    getRecentActivity
};
