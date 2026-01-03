import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  filters: {
    search: '',
    role: 'all',
    status: 'all',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  },
  stats: {
    totalUsers: 0,
    activeToday: 0,
    contributors: 0,
    tourists: 0,
  },
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
  },
});

export const {
  setUsers,
  setLoading,
  setError,
  setSelectedUser,
  updateUser,
  deleteUser,
  setFilters,
  setPagination,
  setStats,
} = usersSlice.actions;

export default usersSlice.reducer;
