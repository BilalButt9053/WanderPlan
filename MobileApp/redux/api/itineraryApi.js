/**
 * Itinerary API - RTK Query endpoints for itinerary management
 * 
 * Endpoints:
 * - generateItinerary: POST /api/itineraries/trip/:tripId/generate
 * - getItinerary: GET /api/itineraries/trip/:tripId
 * - regenerateItinerary: PUT /api/itineraries/trip/:tripId/regenerate
 * - commitBudget: POST /api/itineraries/trip/:tripId/commit-budget
 * - getSavedItineraries: GET /api/itineraries/saved
 * - deleteItinerary: DELETE /api/itineraries/trip/:tripId
 * - getActivitySuggestions: GET /api/itineraries/trip/:tripId/suggestions
 * - saveManualItinerary: POST /api/itineraries/trip/:tripId/manual
 * - updateItinerary: PUT /api/itineraries/trip/:tripId
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const itineraryApi = createApi({
  reducerPath: "itineraryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Itinerary", "SavedItineraries", "Suggestions"],
  endpoints: (builder) => ({
    /**
     * Generate budget-aware itinerary for a trip
     * POST /api/itineraries/trip/:tripId/generate
     */
    generateItinerary: builder.mutation({
      query: ({ tripId, preferences }) => ({
        url: `/itineraries/trip/${tripId}/generate`,
        method: "POST",
        body: preferences || {},
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Itinerary", id: tripId },
        "SavedItineraries",
      ],
    }),

    /**
     * Get saved itinerary for a trip
     * GET /api/itineraries/trip/:tripId
     */
    getItinerary: builder.query({
      query: (tripId) => `/itineraries/trip/${tripId}`,
      providesTags: (result, error, tripId) => [
        { type: "Itinerary", id: tripId },
      ],
    }),

    /**
     * Regenerate itinerary for a trip
     * PUT /api/itineraries/trip/:tripId/regenerate
     */
    regenerateItinerary: builder.mutation({
      query: ({ tripId, forceAI = false }) => ({
        url: `/itineraries/trip/${tripId}/regenerate`,
        method: "PUT",
        body: { forceAI },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Itinerary", id: tripId },
      ],
    }),

    /**
     * Commit itinerary costs to trip budget
     * POST /api/itineraries/trip/:tripId/commit-budget
     */
    commitBudget: builder.mutation({
      query: (tripId) => ({
        url: `/itineraries/trip/${tripId}/commit-budget`,
        method: "POST",
      }),
      invalidatesTags: (result, error, tripId) => [
        { type: "Itinerary", id: tripId },
        "SavedItineraries",
      ],
    }),

    /**
     * Get all saved itineraries for the user
     * GET /api/itineraries/saved
     */
    getSavedItineraries: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/itineraries/saved?page=${page}&limit=${limit}`,
      providesTags: ["SavedItineraries"],
    }),

    /**
     * Delete itinerary for a trip
     * DELETE /api/itineraries/trip/:tripId
     */
    deleteItinerary: builder.mutation({
      query: (tripId) => ({
        url: `/itineraries/trip/${tripId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, tripId) => [
        { type: "Itinerary", id: tripId },
        "SavedItineraries",
      ],
    }),

    /**
     * Get hybrid itinerary (guest mode - no trip required)
     * GET /api/itineraries/hybrid
     */
    getHybridItinerary: builder.query({
      query: ({ destination, days, travelStyle = "moderate" }) =>
        `/itineraries/hybrid?destination=${encodeURIComponent(destination)}&days=${days}&travelStyle=${travelStyle}`,
    }),

    /**
     * Get activity suggestions for manual trip building
     * GET /api/itineraries/trip/:tripId/suggestions
     */
    getActivitySuggestions: builder.query({
      query: (tripId) => `/itineraries/trip/${tripId}/suggestions`,
      providesTags: (result, error, tripId) => [
        { type: "Suggestions", id: tripId },
      ],
    }),

    /**
     * Save manually-built itinerary
     * POST /api/itineraries/trip/:tripId/manual
     */
    saveManualItinerary: builder.mutation({
      query: ({ tripId, days }) => ({
        url: `/itineraries/trip/${tripId}/manual`,
        method: "POST",
        body: { days },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Itinerary", id: tripId },
        "SavedItineraries",
      ],
    }),

    /**
     * Update existing itinerary (add/remove/edit activities)
     * PUT /api/itineraries/trip/:tripId
     */
    updateItinerary: builder.mutation({
      query: ({ tripId, days }) => ({
        url: `/itineraries/trip/${tripId}`,
        method: "PUT",
        body: { days },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Itinerary", id: tripId },
      ],
    }),
  }),
});

export const {
  useGenerateItineraryMutation,
  useGetItineraryQuery,
  useLazyGetItineraryQuery,
  useRegenerateItineraryMutation,
  useCommitBudgetMutation,
  useGetSavedItinerariesQuery,
  useDeleteItineraryMutation,
  useGetHybridItineraryQuery,
  useLazyGetHybridItineraryQuery,
  useGetActivitySuggestionsQuery,
  useLazyGetActivitySuggestionsQuery,
  useSaveManualItineraryMutation,
  useUpdateItineraryMutation,
} = itineraryApi;
