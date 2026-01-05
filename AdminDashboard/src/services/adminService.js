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

export const usersService = {
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
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
    // Calculate stats from reviews
    const reviews = await api.get('/reviews');
    const data = reviews.data;
    
    const total = data.items?.length || 0;
    const flagged = data.items?.filter(r => r.status === 'flagged' || r.flags?.length > 0).length || 0;
    
    return {
      total,
      pending: 0,
      flagged,
      approvedToday: 0
    };
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
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/admin/reports/${id}`);
    return response.data;
  },

  resolveReport: async (id, action) => {
    const response = await api.post(`/admin/reports/${id}/resolve`, { action });
    return response.data;
  },

  dismissReport: async (id) => {
    const response = await api.post(`/admin/reports/${id}/dismiss`);
    return response.data;
  },

  getReportStats: async () => {
    const response = await api.get('/admin/reports/stats');
    return response.data;
  },
};

export const gamificationService = {
  getBadges: async () => {
    const response = await api.get('/admin/gamification/badges');
    return response.data;
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

  getLeaderboard: async () => {
    const response = await api.get('/admin/gamification/leaderboard');
    return response.data;
  },

  getGamificationStats: async () => {
    const response = await api.get('/admin/gamification/stats');
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
