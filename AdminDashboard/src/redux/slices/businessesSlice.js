import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  businesses: [],
  selectedBusiness: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    verificationStatus: 'all',
  },
  stats: {
    totalBusinesses: 0,
    pending: 0,
    verified: 0,
    rejected: 0,
  },
};

const businessesSlice = createSlice({
  name: 'businesses',
  initialState,
  reducers: {
    setBusinesses: (state, action) => {
      state.businesses = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
    },
    updateBusiness: (state, action) => {
      const index = state.businesses.findIndex(business => business.id === action.payload.id);
      if (index !== -1) {
        state.businesses[index] = { ...state.businesses[index], ...action.payload };
      }
    },
    deleteBusiness: (state, action) => {
      state.businesses = state.businesses.filter(business => business.id !== action.payload);
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
  setBusinesses,
  setLoading,
  setError,
  setSelectedBusiness,
  updateBusiness,
  deleteBusiness,
  setFilters,
  setStats,
} = businessesSlice.actions;

export default businessesSlice.reducer;
