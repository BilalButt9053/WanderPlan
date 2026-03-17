import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  complaints: [],
  selectedComplaint: null,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    priority: 'all',
  },
  stats: {
    pending: 0,
    resolved: 0,
    total: 0,
  },
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setComplaints: (state, action) => {
      state.complaints = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    updateComplaint: (state, action) => {
      const index = state.complaints.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.complaints[index] = { ...state.complaints[index], ...action.payload };
      }
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
  setComplaints,
  setLoading,
  setError,
  setSelectedComplaint,
  updateComplaint,
  setFilters,
  setStats,
} = reportsSlice.actions;

export default reportsSlice.reducer;
