import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const userProfileApi = createApi({
  reducerPath: "userProfileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ProfileStats', 'Rewards', 'Notifications', 'SavedTrips'],
  endpoints: (builder) => ({
    // Get comprehensive profile stats
    getProfileStats: builder.query({
      query: () => "/user/profile-stats",
      providesTags: ['ProfileStats'],
    }),

    // Get user rewards
    getRewards: builder.query({
      query: (status = 'all') => `/user/rewards?status=${status}`,
      providesTags: ['Rewards'],
    }),

    // Get user notifications
    getNotifications: builder.query({
      query: ({ page = 1, limit = 20, unreadOnly = false } = {}) =>
        `/user/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      providesTags: ['Notifications'],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/user/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: "/user/notifications/mark-all-read",
        method: "PUT",
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Get saved trips for profile
    getSavedTrips: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/user/saved-trips?page=${page}&limit=${limit}`,
      providesTags: ['SavedTrips'],
    }),
  }),
});

export const {
  useGetProfileStatsQuery,
  useGetRewardsQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetSavedTripsQuery,
} = userProfileApi;
