import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { reviewsApi } from "./api/reviewsApi";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, reviewsApi.middleware),
});
