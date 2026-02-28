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
  tagTypes: ['Business', 'Profile'],
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
  }),
})

export const {
  useRegisterBusinessMutation,
  useVerifyBusinessEmailMutation,
  useLoginBusinessMutation,
  useGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useResendOTPMutation,
  useUploadLogoMutation,
  useUploadGalleryImagesMutation,
  useUploadDocumentMutation,
  useDeleteUploadedFileMutation,
} = businessApi
