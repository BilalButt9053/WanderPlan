const Signup = require("../modals/user-modals");
const Review = require("../modals/review-models");
const Trip = require("../modals/trip-modal");
const Reward = require("../modals/reward-modal");
const UserNotification = require("../modals/user-notification-modal");

// Badge definitions with requirements
const BADGE_DEFINITIONS = [
  { id: 'first_review', name: 'First Review', icon: 'star', requirement: 'Write your first review', points: 50 },
  { id: 'explorer', name: 'Explorer', icon: 'compass', requirement: 'Complete 3 trips', points: 100 },
  { id: 'foodie', name: 'Foodie', icon: 'utensils', requirement: 'Review 5 restaurants', points: 75 },
  { id: 'helpful', name: 'Helpful Guide', icon: 'thumbs-up', requirement: 'Get 10 helpful votes', points: 100 },
  { id: 'photographer', name: 'Photographer', icon: 'camera', requirement: 'Upload 20 photos', points: 80 },
  { id: 'seasoned', name: 'Seasoned Traveler', icon: 'award', requirement: 'Complete 10 trips', points: 200 },
];

// Calculate user level from points
const calculateLevel = (points) => {
  if (points < 100) return 1;
  if (points < 300) return 2;
  if (points < 600) return 3;
  if (points < 1000) return 4;
  if (points < 1500) return 5;
  if (points < 2200) return 6;
  if (points < 3000) return 7;
  if (points < 4000) return 8;
  if (points < 5500) return 9;
  return 10;
};

// Points needed for next level
const pointsForNextLevel = (currentPoints) => {
  const thresholds = [100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  for (const threshold of thresholds) {
    if (currentPoints < threshold) return threshold;
  }
  return thresholds[thresholds.length - 1] + 2000;
};

/**
 * Get comprehensive profile stats
 * GET /api/user/profile-stats
 */
const getProfileStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user data
    const user = await Signup.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get review stats
    const [reviewCount, reviews] = await Promise.all([
      Review.countDocuments({ 'user._id': userId, status: 'active' }),
      Review.find({ 'user._id': userId, status: 'active' })
        .select('rating likedBy helpfulBy images category createdAt')
        .lean()
    ]);

    // Calculate various stats from reviews
    let totalLikes = 0;
    let totalHelpful = 0;
    let totalImages = 0;
    let foodReviews = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let reviewsThisMonth = 0;
    let ratingSum = 0;

    reviews.forEach(review => {
      totalLikes += review.likedBy?.length || 0;
      totalHelpful += review.helpfulBy?.length || 0;
      totalImages += review.images?.length || 0;
      ratingSum += review.rating || 0;
      if (review.category === 'food') foodReviews++;
      if (new Date(review.createdAt) >= thirtyDaysAgo) reviewsThisMonth++;
    });

    const avgRating = reviewCount > 0 ? (ratingSum / reviewCount).toFixed(1) : 0;

    // Get trip stats
    const [tripCount, completedTrips, savedTrips] = await Promise.all([
      Trip.countDocuments({ userId, isDeleted: false }),
      Trip.countDocuments({ userId, isDeleted: false, status: 'completed' }),
      Review.countDocuments({ savedBy: userId })
    ]);

    // Calculate contribution points
    const points = user.contribution?.points ||
      (reviewCount * 10) + (totalHelpful * 5) + (completedTrips * 20) + (totalImages * 2);

    // Current user badges (stored or calculated)
    const userBadges = user.contribution?.badges || [];

    // Check and award new badges
    const newBadges = [];
    if (reviewCount >= 1 && !userBadges.includes('first_review')) {
      newBadges.push('first_review');
    }
    if (completedTrips >= 3 && !userBadges.includes('explorer')) {
      newBadges.push('explorer');
    }
    if (foodReviews >= 5 && !userBadges.includes('foodie')) {
      newBadges.push('foodie');
    }
    if (totalHelpful >= 10 && !userBadges.includes('helpful')) {
      newBadges.push('helpful');
    }
    if (totalImages >= 20 && !userBadges.includes('photographer')) {
      newBadges.push('photographer');
    }
    if (completedTrips >= 10 && !userBadges.includes('seasoned')) {
      newBadges.push('seasoned');
    }

    // Update user contribution if new badges earned or points changed
    const allBadges = [...new Set([...userBadges, ...newBadges])];
    const currentLevel = calculateLevel(points);

    if (newBadges.length > 0 || user.contribution?.points !== points) {
      await Signup.findByIdAndUpdate(userId, {
        'contribution.points': points,
        'contribution.level': currentLevel,
        'contribution.badges': allBadges,
        'contribution.lastAwardedAt': newBadges.length > 0 ? new Date() : user.contribution?.lastAwardedAt
      });
    }

    // Format badges with metadata
    const formattedBadges = allBadges.map(badgeId => {
      const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      return def ? { id: badgeId, ...def, earned: true } : { id: badgeId, name: badgeId, earned: true };
    });

    // Get member since date
    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    }) : 'Unknown';

    res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.fullName,
        username: `@${user.fullName?.toLowerCase().replace(/\s+/g, '') || 'user'}`,
        email: user.email,
        avatar: user.profilePhoto || user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
        isVerified: user.isVerified,
        memberSince
      },
      gamification: {
        level: currentLevel,
        points,
        nextLevelPoints: pointsForNextLevel(points),
        badges: formattedBadges,
        newBadgesEarned: newBadges
      },
      stats: {
        reviews: reviewCount,
        trips: tripCount,
        completedTrips,
        saved: savedTrips,
        helpful: totalHelpful,
        likes: totalLikes,
        photos: totalImages,
        reviewsThisMonth,
        avgRating: parseFloat(avgRating)
      }
    });
  } catch (error) {
    console.error('[user-profile] Get profile stats error:', error);
    next(error);
  }
};

/**
 * Get user rewards
 * GET /api/user/rewards
 */
const getRewards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query; // 'active', 'used', 'expired', 'all'

    let filter = { user: userId };
    const now = new Date();

    if (status === 'active') {
      filter.isUsed = false;
      filter.validUntil = { $gte: now };
    } else if (status === 'used') {
      filter.isUsed = true;
    } else if (status === 'expired') {
      filter.isUsed = false;
      filter.validUntil = { $lt: now };
    }

    const rewards = await Reward.find(filter)
      .populate('relatedBusiness', 'businessName logo')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate next reward progress
    const user = await Signup.findById(userId).select('contribution');
    const reviewCount = await Review.countDocuments({ 'user._id': userId, status: 'active' });

    // Simple reward progress: earn coupon every 5 reviews
    const reviewsForNextReward = 5;
    const reviewsTowardsNext = reviewCount % reviewsForNextReward;
    const progressPercent = Math.round((reviewsTowardsNext / reviewsForNextReward) * 100);
    const reviewsNeeded = reviewsForNextReward - reviewsTowardsNext;

    res.status(200).json({
      success: true,
      rewards: rewards.map(r => ({
        ...r,
        isExpired: new Date() > r.validUntil,
        isActive: !r.isUsed && new Date() <= r.validUntil
      })),
      nextReward: {
        title: '10% Hotel Discount',
        progress: progressPercent,
        requirement: `Write ${reviewsNeeded} more review${reviewsNeeded !== 1 ? 's' : ''} to unlock`,
        reviewsNeeded
      },
      totalActive: rewards.filter(r => !r.isUsed && new Date() <= r.validUntil).length,
      totalUsed: rewards.filter(r => r.isUsed).length
    });
  } catch (error) {
    console.error('[user-profile] Get rewards error:', error);
    next(error);
  }
};

/**
 * Get user notifications
 * GET /api/user/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { user: userId };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      UserNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      UserNotification.countDocuments(filter),
      UserNotification.countDocuments({ user: userId, read: false })
    ]);

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[user-profile] Get notifications error:', error);
    next(error);
  }
};

/**
 * Mark notification as read
 * PUT /api/user/notifications/:id/read
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await UserNotification.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error('[user-profile] Mark notification read error:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PUT /api/user/notifications/mark-all-read
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await UserNotification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error('[user-profile] Mark all notifications read error:', error);
    next(error);
  }
};

/**
 * Get saved trips for profile
 * GET /api/user/saved-trips
 */
const getSavedTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [trips, total] = await Promise.all([
      Trip.find({ userId, isDeleted: false })
        .select('title destination totalBudget currency startDate endDate status coverImage tripType durationDays')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Trip.countDocuments({ userId, isDeleted: false })
    ]);

    // Enhance trips with calculated fields
    const enhancedTrips = trips.map(trip => {
      const startDate = trip.startDate ? new Date(trip.startDate) : null;
      const endDate = trip.endDate ? new Date(trip.endDate) : null;
      const durationDays = startDate && endDate
        ? Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        : 1;

      return {
        ...trip,
        durationDays,
        formattedBudget: `${trip.currency || 'PKR'} ${(trip.totalBudget || 0).toLocaleString()}`,
        formattedDates: startDate && endDate
          ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : 'Dates not set'
      };
    });

    res.status(200).json({
      success: true,
      trips: enhancedTrips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[user-profile] Get saved trips error:', error);
    next(error);
  }
};

module.exports = {
  getProfileStats,
  getRewards,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getSavedTrips
};
