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
    
    // Resend OTP
    resendOTP: builder.mutation({
      query: (businessId) => ({
        url: '/otp/resend',
        method: 'POST',
        body: { userId: businessId },
      }),
    }),
  }),
})

export const {
  useRegisterBusinessMutation,
  useVerifyBusinessEmailMutation,
  useLoginBusinessMutation,
  useGetBusinessProfileQuery,
  useResendOTPMutation,
} = businessApi
