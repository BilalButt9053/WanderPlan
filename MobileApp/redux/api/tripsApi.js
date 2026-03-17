/**
 * Trips API - RTK Query endpoints for trip management
 * 
 * Endpoints:
 * - createTrip: POST /api/trips
 * - getTrips: GET /api/trips
 * - getTrip: GET /api/trips/:id
 * - updateTrip: PUT /api/trips/:id
 * - deleteTrip: DELETE /api/trips/:id
 * - getBudgetEstimate: POST /api/trips/estimate
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const tripsApi = createApi({
  reducerPath: "tripsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Trip", "Trips"],
  endpoints: (builder) => ({
    /**
     * Create a new trip
     * POST /api/trips
     */
    createTrip: builder.mutation({
      query: (tripData) => ({
        url: "/trips",
        method: "POST",
        body: tripData,
      }),
      invalidatesTags: ["Trips"],
    }),

    /**
     * Get all trips for the user
     * GET /api/trips
     */
    getTrips: builder.query({
      query: ({ page = 1, limit = 20, status, includeItinerary = false } = {}) => {
        let url = `/trips?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (includeItinerary) url += `&includeItinerary=true`;
        return url;
      },
      providesTags: (result) =>
        result?.trips
          ? [
              ...result.trips.map(({ _id }) => ({ type: "Trip", id: _id })),
              "Trips",
            ]
          : ["Trips"],
    }),

    /**
     * Get single trip by ID
     * GET /api/trips/:id
     */
    getTrip: builder.query({
      query: (tripId) => `/trips/${tripId}`,
      providesTags: (result, error, tripId) => [{ type: "Trip", id: tripId }],
    }),

    /**
     * Update trip
     * PUT /api/trips/:id
     */
    updateTrip: builder.mutation({
      query: ({ tripId, ...updates }) => ({
        url: `/trips/${tripId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
        "Trips",
      ],
    }),

    /**
     * Delete trip
     * DELETE /api/trips/:id
     */
    deleteTrip: builder.mutation({
      query: (tripId) => ({
        url: `/trips/${tripId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trips"],
    }),

    /**
     * Get budget estimate for trip parameters
     * POST /api/trips/estimate
     */
    getBudgetEstimate: builder.mutation({
      query: (estimateData) => ({
        url: "/trips/estimate",
        method: "POST",
        body: estimateData,
      }),
    }),

    /**
     * Add activity to trip itinerary
     * POST /api/trips/:id/add-activity
     */
    addActivityToTrip: builder.mutation({
      query: ({ tripId, ...body }) => ({
        url: `/trips/${tripId}/add-activity`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
        "Trips",
      ],
    }),
  }),
});

export const {
  useCreateTripMutation,
  useGetTripsQuery,
  useLazyGetTripsQuery,
  useGetTripQuery,
  useLazyGetTripQuery,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useGetBudgetEstimateMutation,
  useAddActivityToTripMutation,
} = tripsApi;
