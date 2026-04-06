import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { reviewsApi } from "./api/reviewsApi";
import { businessItemsApi } from "./api/businessItemsApi";
import { itineraryApi } from "./api/itineraryApi";
import { tripsApi } from "./api/tripsApi";
import { complaintsApi } from "./api/complaintsApi";
import { userProfileApi } from "./api/userProfileApi";
import { placesApi } from "./api/placesApi";


import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import tripsReducer from "./slices/tripsSlice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [businessItemsApi.reducerPath]: businessItemsApi.reducer,
    [itineraryApi.reducerPath]: itineraryApi.reducer,
    [tripsApi.reducerPath]: tripsApi.reducer,
    [complaintsApi.reducerPath]: complaintsApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [placesApi.reducerPath]: placesApi.reducer,
    auth: authReducer,
    theme: themeReducer,
    trips: tripsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(reviewsApi.middleware)
      .concat(businessItemsApi.middleware)
      .concat(itineraryApi.middleware)
      .concat(tripsApi.middleware)
      .concat(complaintsApi.middleware)
      .concat(userProfileApi.middleware)
      .concat(placesApi.middleware),
});
