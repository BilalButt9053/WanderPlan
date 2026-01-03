import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userEngagementData: [],
  reviewActivityData: [],
  businessPerformanceData: [],
  categoryDistribution: [],
  loading: false,
  error: null,
  dateRange: 'last30days',
  stats: {
    totalRevenue: 0,
    activeUsers: 0,
    totalReviews: 0,
    totalBusinesses: 0,
  },
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setUserEngagementData: (state, action) => {
      state.userEngagementData = action.payload;
    },
    setReviewActivityData: (state, action) => {
      state.reviewActivityData = action.payload;
    },
    setBusinessPerformanceData: (state, action) => {
      state.businessPerformanceData = action.payload;
    },
    setCategoryDistribution: (state, action) => {
      state.categoryDistribution = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setUserEngagementData,
  setReviewActivityData,
  setBusinessPerformanceData,
  setCategoryDistribution,
  setLoading,
  setError,
  setDateRange,
  setStats,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
