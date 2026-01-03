import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import businessesReducer from './slices/businessesSlice';
import reviewsReducer from './slices/reviewsSlice';
import dealsReducer from './slices/dealsSlice';
import analyticsReducer from './slices/analyticsSlice';
import reportsReducer from './slices/reportsSlice';
import gamificationReducer from './slices/gamificationSlice';
import settingsReducer from './slices/settingsSlice';
import { authApi } from '../services/authApi';
import { businessApi } from '../services/businessApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    businesses: businessesReducer,
    reviews: reviewsReducer,
    deals: dealsReducer,
    analytics: analyticsReducer,
    reports: reportsReducer,
    gamification: gamificationReducer,
    settings: settingsReducer,
    [authApi.reducerPath]: authApi.reducer,
    [businessApi.reducerPath]: businessApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authApi.middleware, businessApi.middleware),
});

export default store;
