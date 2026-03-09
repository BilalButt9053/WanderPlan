import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const businessApi = createApi({
  reducerPath: 'businessApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().businessAuth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Business', 'Profile', 'MenuItems', 'Deals', 'Notifications'],
  endpoints: (builder) => ({
    // Register business
    registerBusiness: builder.mutation({
      query: (credentials) => ({
        url: '/business/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Verify email with OTP
    verifyBusinessEmail: builder.mutation({
      query: ({ businessId, otp }) => ({
        url: '/business/verify-email',
        method: 'POST',
        body: { businessId, otp },
      }),
    }),
    
    // Login business
    loginBusiness: builder.mutation({
      query: (credentials) => ({
        url: '/business/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Get business profile
    getBusinessProfile: builder.query({
      query: () => '/business/profile',
      providesTags: ['Profile'],
    }),
    
    // Update business profile
    updateBusinessProfile: builder.mutation({
      query: (updates) => ({
        url: '/business/profile',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: '/business/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation({
      query: (notifications) => ({
        url: '/business/settings/notifications',
        method: 'PUT',
        body: { notifications },
      }),
      invalidatesTags: ['Profile'],
    }),
    
    // Resend OTP
    resendOTP: builder.mutation({
      query: (businessId) => ({
        url: '/otp/resend',
        method: 'POST',
        body: { userId: businessId },
      }),
    }),
    
    // Upload logo
    uploadLogo: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        return {
          url: '/business/upload/logo',
          method: 'POST',
          body: formData,
        };
      },
    }),
    
    // Upload gallery images
    uploadGalleryImages: builder.mutation({
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('images', file);
        });
        return {
          url: '/business/upload/gallery',
          method: 'POST',
          body: formData,
        };
      },
    }),
    
    // Upload document
    uploadDocument: builder.mutation({
      query: ({ file, type }) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', type);
        return {
          url: '/business/upload/documents',
          method: 'POST',
          body: formData,
        };
      },
    }),
    
    // Delete uploaded file
    deleteUploadedFile: builder.mutation({
      query: (publicId) => ({
        url: `/business/upload/${publicId}`,
        method: 'DELETE',
      }),
    }),

    // Menu Items
    getMenuItems: builder.query({
      query: (params) => ({
        url: '/business/menu-items',
        params,
      }),
      providesTags: ['MenuItems'],
    }),

    getMenuItem: builder.query({
      query: (id) => `/business/menu-items/${id}`,
      providesTags: ['MenuItems'],
    }),

    createMenuItem: builder.mutation({
      query: (data) => ({
        url: '/business/menu-items',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MenuItems'],
    }),

    updateMenuItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/business/menu-items/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MenuItems'],
    }),

    deleteMenuItem: builder.mutation({
      query: (id) => ({
        url: `/business/menu-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MenuItems'],
    }),

    // Deals & Ads
    getDeals: builder.query({
      query: (params) => ({
        url: '/business/deals',
        params,
      }),
      providesTags: ['Deals'],
    }),

    getDeal: builder.query({
      query: (id) => `/business/deals/${id}`,
      providesTags: ['Deals'],
    }),

    getDealStats: builder.query({
      query: () => '/business/deals/stats',
      providesTags: ['Deals'],
    }),

    createDeal: builder.mutation({
      query: (data) => ({
        url: '/business/deals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Deals'],
    }),

    updateDeal: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/business/deals/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Deals'],
    }),

    deleteDeal: builder.mutation({
      query: (id) => ({
        url: `/business/deals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Deals'],
    }),

    toggleDealStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/business/deals/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Deals'],
    }),

    // Notifications
    getNotifications: builder.query({
      query: (params) => ({
        url: '/business/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query({
      query: () => '/business/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/business/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/business/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/business/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    clearAllNotifications: builder.mutation({
      query: () => ({
        url: '/business/notifications/clear-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    createTestNotification: builder.mutation({
      query: (data) => ({
        url: '/business/notifications/test',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
})

export const {
  useRegisterBusinessMutation,
  useVerifyBusinessEmailMutation,
  useLoginBusinessMutation,
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useChangePasswordMutation,
  useUpdateNotificationSettingsMutation,
  useResendOTPMutation,
  useUploadLogoMutation,
  useUploadGalleryImagesMutation,
  useUploadDocumentMutation,
  useDeleteUploadedFileMutation,
  useGetMenuItemsQuery,
  useGetMenuItemQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetDealsQuery,
  useGetDealQuery,
  useGetDealStatsQuery,
  useCreateDealMutation,
  useUpdateDealMutation,
  useDeleteDealMutation,
  useToggleDealStatusMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
  useCreateTestNotificationMutation,
} = businessApi
