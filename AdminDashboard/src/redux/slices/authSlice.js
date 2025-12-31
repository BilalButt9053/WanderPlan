import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem('adminToken', action.payload.token);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminToken');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;
