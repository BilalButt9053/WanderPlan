import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Admin'],
  endpoints: (builder) => ({
    // Register new admin user
    register: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Login (sends OTP)
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    // Verify OTP
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: '/otp/verify',
        method: 'POST',
        body: { email: data.email, otp: data.otp },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Resend OTP
    resendOtp: builder.mutation({
      query: (data) => ({
        url: '/otp/resend',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Get current user
    getCurrentUser: builder.query({
      query: () => '/auth/user',
      providesTags: ['User'],
    }),
    
    // Get all users (admin only)
    getAllUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['Admin'],
    }),
    
    // Get user by ID
    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: ['Admin'],
    }),
    
    // Update user
    updateUser: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/users/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Admin'],
    }),
    
    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetCurrentUserQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = authApi;
