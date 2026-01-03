import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  deals: [],
  selectedDeal: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    type: 'all',
    status: 'all',
  },
  stats: {
    activeDeals: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  },
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setDeals: (state, action) => {
      state.deals = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedDeal: (state, action) => {
      state.selectedDeal = action.payload;
    },
    updateDeal: (state, action) => {
      const index = state.deals.findIndex(deal => deal.id === action.payload.id);
      if (index !== -1) {
        state.deals[index] = { ...state.deals[index], ...action.payload };
      }
    },
    deleteDeal: (state, action) => {
      state.deals = state.deals.filter(deal => deal.id !== action.payload);
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
  setDeals,
  setLoading,
  setError,
  setSelectedDeal,
  updateDeal,
  deleteDeal,
  setFilters,
  setStats,
} = dealsSlice.actions;

export default dealsSlice.reducer;
