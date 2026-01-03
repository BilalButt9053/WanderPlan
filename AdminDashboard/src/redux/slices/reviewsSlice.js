import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reviews: [],
  selectedReview: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    status: 'all',
    rating: 'all',
  },
  stats: {
    totalReviews: 0,
    pending: 0,
    approved: 0,
    flagged: 0,
  },
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedReview: (state, action) => {
      state.selectedReview = action.payload;
    },
    updateReview: (state, action) => {
      const index = state.reviews.findIndex(review => review.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = { ...state.reviews[index], ...action.payload };
      }
    },
    deleteReview: (state, action) => {
      state.reviews = state.reviews.filter(review => review.id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setReviews,
  setLoading,
  setError,
  setSelectedReview,
  updateReview,
  deleteReview,
  setFilters,
  setStats,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
