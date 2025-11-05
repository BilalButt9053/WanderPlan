// store/apiSlice.js - RTK Query API configuration
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define your base URL - update this with your actual API URL
const BASE_URL = 'http://localhost:5000/api'; // Change to your server URL

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = getState().auth.token;
      
      // If we have a token, include it in the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Trip', 'Destination'], // Add your entity types here
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    
    // User endpoints
    getProfile: builder.query({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: '/user/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Example: Trip endpoints (customize based on your API)
    getTrips: builder.query({
      query: () => '/trips',
      providesTags: ['Trip'],
    }),
    getTripById: builder.query({
      query: (id) => `/trips/${id}`,
      providesTags: ['Trip'],
    }),
    createTrip: builder.mutation({
      query: (tripData) => ({
        url: '/trips',
        method: 'POST',
        body: tripData,
      }),
      invalidatesTags: ['Trip'],
    }),
    updateTrip: builder.mutation({
      query: ({ id, ...tripData }) => ({
        url: `/trips/${id}`,
        method: 'PUT',
        body: tripData,
      }),
      invalidatesTags: ['Trip'],
    }),
    deleteTrip: builder.mutation({
      query: (id) => ({
        url: `/trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Trip'],
    }),
    
    // Example: Destination endpoints
    getDestinations: builder.query({
      query: () => '/destinations',
      providesTags: ['Destination'],
    }),
    searchDestinations: builder.query({
      query: (searchTerm) => `/destinations/search?q=${searchTerm}`,
      providesTags: ['Destination'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetTripsQuery,
  useGetTripByIdQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useGetDestinationsQuery,
  useSearchDestinationsQuery,
} = apiSlice;
