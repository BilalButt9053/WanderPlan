import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  general: {
    siteName: 'WanderPlan',
    siteUrl: '',
    contactEmail: '',
    timezone: 'UTC',
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordPolicy: 'medium',
  },
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setGeneralSettings: (state, action) => {
      state.general = { ...state.general, ...action.payload };
    },
    setNotificationSettings: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    setSecuritySettings: (state, action) => {
      state.security = { ...state.security, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setGeneralSettings,
  setNotificationSettings,
  setSecuritySettings,
  setLoading,
  setError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
