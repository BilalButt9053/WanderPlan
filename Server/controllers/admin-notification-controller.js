/**
 * Admin Notification Controller
 * Handles sending notifications/announcements to users
 */

const User = require("../modals/user-modals");
const Business = require("../modals/business-modal");
const UserNotification = require("../modals/user-notification-modal");
const Notification = require("../modals/notification-modal");

/**
 * Send notification to specific user
 * POST /api/admin/notifications/send
 */
const sendNotificationToUser = async (req, res, next) => {
    try {
        const { userId, title, message, type = 'system', actionUrl, data } = req.body;

        if (!userId || !title || !message) {
            return res.status(400).json({
                success: false,
                message: "userId, title, and message are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const notification = await UserNotification.createNotification({
            user: userId,
            type,
            title,
            message,
            actionUrl,
            data
        });

        res.status(201).json({
            success: true,
            message: "Notification sent successfully",
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to all users (broadcast)
 * POST /api/admin/notifications/broadcast
 */
const broadcastNotification = async (req, res, next) => {
    try {
        const { title, message, type = 'system', actionUrl, data, filters } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "title and message are required"
            });
        }

        // Build user filter
        const userFilter = { isDeleted: { $ne: true } };

        if (filters) {
            if (filters.isVerified !== undefined) {
                userFilter.isVerified = filters.isVerified;
            }
            if (filters.hasTrips) {
                // Users with trips - needs to be handled via aggregation
            }
        }

        // Get all matching users
        const users = await User.find(userFilter).select('_id');

        // Create notifications in batch
        const notifications = users.map(user => ({
            user: user._id,
            type,
            title,
            message,
            actionUrl,
            data
        }));

        await UserNotification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Notification broadcast to ${users.length} users`,
            data: { recipientCount: users.length }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to all businesses (broadcast)
 * POST /api/admin/notifications/broadcast-business
 */
const broadcastBusinessNotification = async (req, res, next) => {
    try {
        const { title, message, type = 'system', actionUrl, data, status } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "title and message are required"
            });
        }

        // Build business filter
        const businessFilter = {};
        if (status) {
            businessFilter.status = status;
        }

        // Get all matching businesses
        const businesses = await Business.find(businessFilter).select('_id');

        // Create notifications in batch
        const notifications = businesses.map(business => ({
            business: business._id,
            type,
            title,
            message,
            actionUrl,
            data
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: `Notification broadcast to ${businesses.length} businesses`,
            data: { recipientCount: businesses.length }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get notification history (sent by admin)
 * GET /api/admin/notifications/history
 */
const getNotificationHistory = async (req, res, next) => {
    try {
        const {
            type,
            recipient, // 'user' or 'business'
            page = 1,
            limit = 20
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get recent notifications
        let notifications = [];
        let total = 0;

        if (!recipient || recipient === 'user') {
            const userNotifications = await UserNotification.find(
                type ? { type } : {}
            )
                .populate('user', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            notifications = userNotifications.map(n => ({ ...n, recipientType: 'user' }));
            total = await UserNotification.countDocuments(type ? { type } : {});
        }

        if (!recipient || recipient === 'business') {
            const businessNotifications = await Notification.find(
                type ? { type } : {}
            )
                .populate('business', 'businessName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            if (recipient === 'business') {
                notifications = businessNotifications.map(n => ({ ...n, recipientType: 'business' }));
                total = await Notification.countDocuments(type ? { type } : {});
            } else {
                // Combine both
                notifications = [
                    ...notifications,
                    ...businessNotifications.map(n => ({ ...n, recipientType: 'business' }))
                ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, parseInt(limit));
            }
        }

        res.status(200).json({
            success: true,
            data: {
                notifications,
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
 * Get notification statistics
 * GET /api/admin/notifications/stats
 */
const getNotificationStats = async (req, res, next) => {
    try {
        const [
            totalUserNotifications,
            unreadUserNotifications,
            totalBusinessNotifications,
            unreadBusinessNotifications,
            userNotificationsByType,
            businessNotificationsByType
        ] = await Promise.all([
            UserNotification.countDocuments(),
            UserNotification.countDocuments({ read: false }),
            Notification.countDocuments(),
            Notification.countDocuments({ read: false }),
            UserNotification.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ]),
            Notification.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUserNotifications,
                    unread: unreadUserNotifications,
                    byType: userNotificationsByType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {})
                },
                businesses: {
                    total: totalBusinessNotifications,
                    unread: unreadBusinessNotifications,
                    byType: businessNotificationsByType.reduce((acc, item) => {
                        acc[item._id] = item.count;
                        return acc;
                    }, {})
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendNotificationToUser,
    broadcastNotification,
    broadcastBusinessNotification,
    getNotificationHistory,
    getNotificationStats
};
