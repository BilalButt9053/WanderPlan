import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { reviewsApi } from "./api/reviewsApi";
import { businessItemsApi } from "./api/businessItemsApi";
import { itineraryApi } from "./api/itineraryApi";
import { tripsApi } from "./api/tripsApi";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [businessItemsApi.reducerPath]: businessItemsApi.reducer,
    [itineraryApi.reducerPath]: itineraryApi.reducer,
    [tripsApi.reducerPath]: tripsApi.reducer,
    auth: authReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(reviewsApi.middleware)
      .concat(businessItemsApi.middleware)
      .concat(itineraryApi.middleware)
      .concat(tripsApi.middleware),
});
