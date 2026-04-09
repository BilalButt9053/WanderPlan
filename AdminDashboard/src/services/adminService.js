import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/admin/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/admin/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/admin/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/admin/profile', data);
    return response.data;
  },
};

// Dashboard Stats Service - NEW
export const statsService = {
  getDashboardStats: async (businessId) => {
    const params = businessId ? { businessId } : undefined;
    const response = await api.get('/admin/stats/dashboard', { params });
    return response.data;
  },

  getUserTrends: async (period = '30days', businessId) => {
    const params = businessId ? { period, businessId } : { period };
    const response = await api.get('/admin/stats/users/trends', { params });
    return response.data;
  },

  getTripTrends: async (period = '30days') => {
    const response = await api.get('/admin/stats/trips/trends', { params: { period } });
    return response.data;
  },

  getBusinessTrends: async (period = '30days', businessId) => {
    const params = businessId ? { period, businessId } : { period };
    const response = await api.get('/admin/stats/businesses/trends', { params });
    return response.data;
  },

  getReviewTrends: async (period = '30days', businessId) => {
    const params = businessId ? { period, businessId } : { period };
    const response = await api.get('/admin/stats/reviews/trends', { params });
    return response.data;
  },

  getLeaderboard: async (limit = 20) => {
    const response = await api.get('/admin/stats/leaderboard', { params: { limit } });
    return response.data;
  },

  getRecentActivity: async (limit = 20) => {
    const response = await api.get('/admin/stats/activity', { params: { limit } });
    return response.data;
  },
};

export const usersService = {
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUsersList: async (params) => {
    const response = await api.get('/admin/users/list', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  getUserDetails: async (id) => {
    const response = await api.get(`/admin/users/${id}/details`);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.patch(`/admin/users/update/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/delete/${id}`);
    return response.data;
  },

  blockUser: async (id, reason) => {
    const response = await api.put(`/admin/users/${id}/block`, { reason });
    return response.data;
  },

  unblockUser: async (id) => {
    const response = await api.put(`/admin/users/${id}/unblock`);
    return response.data;
  },

  makeAdmin: async (userId) => {
    const response = await api.post(`/admin/make-admin`, { userId });
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },
};

export const businessesService = {
  getBusinesses: async (params) => {
    const response = await api.get('/admin/businesses', { params });
    return response.data;
  },

  getBusinessById: async (id) => {
    const response = await api.get(`/admin/businesses/${id}`);
    return response.data;
  },

  updateBusiness: async (id, data) => {
    const response = await api.patch(`/admin/businesses/${id}`, data);
    return response.data;
  },

  deleteBusiness: async (id) => {
    const response = await api.delete(`/admin/businesses/${id}`);
    return response.data;
  },

  approveBusiness: async (id) => {
    const response = await api.post(`/admin/businesses/${id}/approve`);
    return response.data;
  },

  rejectBusiness: async (id, reason) => {
    const response = await api.post(`/admin/businesses/${id}/reject`, { reason });
    return response.data;
  },

  suspendBusiness: async (id, reason) => {
    const response = await api.post(`/admin/businesses/${id}/suspend`, { reason });
    return response.data;
  },

  getBusinessStats: async () => {
    const response = await api.get('/admin/businesses/stats');
    return response.data;
  },
};

// Admin Reviews Service - NEW
export const adminReviewsService = {
  getReviews: async (params) => {
    const response = await api.get('/admin/reviews', { params });
    return response.data;
  },

  getReviewById: async (id) => {
    const response = await api.get(`/admin/reviews/${id}`);
    return response.data;
  },

  updateReviewStatus: async (id, status, reason) => {
    const response = await api.patch(`/admin/reviews/${id}/status`, { status, reason });
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  getFlaggedReviews: async (params) => {
    const response = await api.get('/admin/reviews/flagged', { params });
    return response.data;
  },

  bulkUpdateStatus: async (reviewIds, status, reason) => {
    const response = await api.patch('/admin/reviews/bulk-update', { reviewIds, status, reason });
    return response.data;
  },

  getReviewStats: async () => {
    const response = await api.get('/admin/reviews/stats');
    return response.data;
  },
};

// Legacy reviews service for backwards compatibility
export const reviewsService = {
  getReviews: async (params) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  getReviewById: async (id) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  approveReview: async (id) => {
    const response = await api.post(`/reviews/${id}/approve`);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  getReviewStats: async () => {
    // Use new admin stats endpoint
    const response = await api.get('/admin/reviews/stats');
    return response.data;
  },
};

// Admin Rewards/Gamification Service - NEW
export const rewardsService = {
  getRewards: async (params) => {
    const response = await api.get('/admin/rewards', { params });
    return response.data;
  },

  createReward: async (data) => {
    const response = await api.post('/admin/rewards', data);
    return response.data;
  },

  getRewardById: async (id) => {
    const response = await api.get(`/admin/rewards/${id}`);
    return response.data;
  },

  updateReward: async (id, data) => {
    const response = await api.patch(`/admin/rewards/${id}`, data);
    return response.data;
  },

  deleteReward: async (id) => {
    const response = await api.delete(`/admin/rewards/${id}`);
    return response.data;
  },

  awardPoints: async (userId, points, reason) => {
    const response = await api.post('/admin/rewards/award-points', { userId, points, reason });
    return response.data;
  },

  awardBadge: async (userId, badge, reason) => {
    const response = await api.post('/admin/rewards/award-badge', { userId, badge, reason });
    return response.data;
  },

  getGamificationConfig: async () => {
    const response = await api.get('/admin/rewards/config');
    return response.data;
  },

  getRewardStats: async () => {
    const response = await api.get('/admin/rewards/stats');
    return response.data;
  },
};

// Admin Notifications Service - NEW
export const notificationsService = {
  sendToUser: async (userId, title, message, type = 'system') => {
    const response = await api.post('/admin/notifications/send', { userId, title, message, type });
    return response.data;
  },

  broadcastToUsers: async (title, message, type = 'system', filters) => {
    const response = await api.post('/admin/notifications/broadcast', { title, message, type, filters });
    return response.data;
  },

  broadcastToBusinesses: async (title, message, type = 'system', status) => {
    const response = await api.post('/admin/notifications/broadcast-business', { title, message, type, status });
    return response.data;
  },

  getHistory: async (params) => {
    const response = await api.get('/admin/notifications/history', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/notifications/stats');
    return response.data;
  },
};

// Complaints Service - NEW
export const complaintsService = {
  getComplaints: async (params) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  updateComplaint: async (id, data) => {
    const response = await api.patch(`/admin/complaints/${id}`, data);
    return response.data;
  },
};

export const dealsService = {
  getDeals: async (params) => {
    const response = await api.get('/admin/deals', { params });
    return response.data;
  },

  getDealById: async (id) => {
    const response = await api.get(`/admin/deals/${id}`);
    return response.data;
  },

  createDeal: async (data) => {
    const response = await api.post('/admin/deals', data);
    return response.data;
  },

  updateDeal: async (id, data) => {
    const response = await api.put(`/admin/deals/${id}`, data);
    return response.data;
  },

  deleteDeal: async (id) => {
    const response = await api.delete(`/admin/deals/${id}`);
    return response.data;
  },

  approveDeal: async (id) => {
    const response = await api.post(`/admin/deals/${id}/approve`);
    return response.data;
  },

  getDealStats: async () => {
    const response = await api.get('/admin/deals/stats');
    return response.data;
  },
};

export const analyticsService = {
  getUserEngagement: async (params) => {
    const response = await api.get('/admin/analytics/user-engagement', { params });
    return response.data;
  },

  getReviewActivity: async (params) => {
    const response = await api.get('/admin/analytics/review-activity', { params });
    return response.data;
  },

  getBusinessPerformance: async (params) => {
    const response = await api.get('/admin/analytics/business-performance', { params });
    return response.data;
  },

  getCategoryDistribution: async () => {
    const response = await api.get('/admin/analytics/category-distribution');
    return response.data;
  },

  getOverallStats: async () => {
    const response = await api.get('/admin/analytics/stats');
    return response.data;
  },
};

export const reportsService = {
  getReports: async (params) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/admin/complaints/${id}`);
    return response.data;
  },

  resolveReport: async (id, status, adminNotes) => {
    const response = await api.patch(`/admin/complaints/${id}`, { status, adminNotes });
    return response.data;
  },

  dismissReport: async (id) => {
    const response = await api.patch(`/admin/complaints/${id}`, { status: 'rejected' });
    return response.data;
  },

  getReportStats: async () => {
    const response = await api.get('/admin/reports/stats');
    return response.data;
  },
};

export const gamificationService = {
  getBadges: async () => {
    const config = await api.get('/admin/rewards/config');
    return config.data?.data?.availableBadges || [];
  },

  createBadge: async (data) => {
    const response = await api.post('/admin/gamification/badges', data);
    return response.data;
  },

  updateBadge: async (id, data) => {
    const response = await api.put(`/admin/gamification/badges/${id}`, data);
    return response.data;
  },

  deleteBadge: async (id) => {
    const response = await api.delete(`/admin/gamification/badges/${id}`);
    return response.data;
  },

  getChallenges: async () => {
    const response = await api.get('/admin/gamification/challenges');
    return response.data;
  },

  createChallenge: async (data) => {
    const response = await api.post('/admin/gamification/challenges', data);
    return response.data;
  },

  updateChallenge: async (id, data) => {
    const response = await api.put(`/admin/gamification/challenges/${id}`, data);
    return response.data;
  },

  deleteChallenge: async (id) => {
    const response = await api.delete(`/admin/gamification/challenges/${id}`);
    return response.data;
  },

  getLeaderboard: async (limit = 20) => {
    const response = await api.get('/admin/stats/leaderboard', { params: { limit } });
    return response.data;
  },

  getGamificationStats: async () => {
    const response = await api.get('/admin/rewards/stats');
    return response.data;
  },
};

export const settingsService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateGeneralSettings: async (data) => {
    const response = await api.put('/admin/settings/general', data);
    return response.data;
  },

  updateNotificationSettings: async (data) => {
    const response = await api.put('/admin/settings/notifications', data);
    return response.data;
  },

  updateSecuritySettings: async (data) => {
    const response = await api.put('/admin/settings/security', data);
    return response.data;
  },
};
