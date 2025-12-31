import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const businessApi = createApi({
  reducerPath: 'businessApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Business', 'BusinessStats'],
  endpoints: (builder) => ({
    // Get all businesses with optional filters
    getAllBusinesses: builder.query({
      query: ({ status, category, search } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        return `/admin/businesses?${params.toString()}`;
      },
      providesTags: ['Business'],
    }),
    
    // Get business statistics
    getBusinessStats: builder.query({
      query: () => '/admin/businesses/stats',
      providesTags: ['BusinessStats'],
    }),
    
    // Get business by ID
    getBusinessById: builder.query({
      query: (id) => `/admin/businesses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Business', id }],
    }),
    
    // Approve business
    approveBusiness: builder.mutation({
      query: (id) => ({
        url: `/admin/businesses/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Business', 'BusinessStats'],
    }),
    
    // Reject business
    rejectBusiness: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/businesses/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Business', 'BusinessStats'],
    }),
    
    // Suspend business
    suspendBusiness: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/businesses/${id}/suspend`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Business', 'BusinessStats'],
    }),
    
    // Update business
    updateBusiness: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/businesses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Business'],
    }),
    
    // Delete business
    deleteBusiness: builder.mutation({
      query: (id) => ({
        url: `/admin/businesses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Business', 'BusinessStats'],
    }),
  }),
});

export const {
  useGetAllBusinessesQuery,
  useGetBusinessStatsQuery,
  useGetBusinessByIdQuery,
  useApproveBusinessMutation,
  useRejectBusinessMutation,
  useSuspendBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
} = businessApi;
