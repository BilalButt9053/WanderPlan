import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reports: [],
  selectedReport: null,
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
    setReports: (state, action) => {
      state.reports = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
    updateReport: (state, action) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = { ...state.reports[index], ...action.payload };
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
  setReports,
  setLoading,
  setError,
  setSelectedReport,
  updateReport,
  setFilters,
  setStats,
} = reportsSlice.actions;

export default reportsSlice.reducer;
