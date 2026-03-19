/**
 * Places API - RTK Query endpoints for Google Places integration
 *
 * Endpoints:
 * - getNearbyPlaces: GET /api/places/nearby
 * - searchPlaces: GET /api/places/search
 * - getPlaceDetails: GET /api/places/details/:placeId
 * - getAutocomplete: GET /api/places/autocomplete
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const placesApi = createApi({
  reducerPath: "placesApi",
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
  tagTypes: ["Places"],
  endpoints: (builder) => ({
    /**
     * Get nearby places
     * GET /api/places/nearby
     */
    getNearbyPlaces: builder.query({
      query: ({ lat, lng, radius = 5000, type, keyword }) => {
        let url = `/places/nearby?lat=${lat}&lng=${lng}&radius=${radius}`;
        if (type) url += `&type=${type}`;
        if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
        return url;
      },
      providesTags: ["Places"],
    }),

    /**
     * Search places by text
     * GET /api/places/search
     */
    searchPlaces: builder.query({
      query: ({ query, lat, lng, radius = 10000 }) => {
        let url = `/places/search?query=${encodeURIComponent(query)}`;
        if (lat && lng) {
          url += `&lat=${lat}&lng=${lng}&radius=${radius}`;
        }
        return url;
      },
      providesTags: ["Places"],
    }),

    /**
     * Get place details
     * GET /api/places/details/:placeId
     */
    getPlaceDetails: builder.query({
      query: (placeId) => `/places/details/${placeId}`,
    }),

    /**
     * Get autocomplete predictions
     * GET /api/places/autocomplete
     */
    getAutocomplete: builder.query({
      query: ({ input, lat, lng }) => {
        let url = `/places/autocomplete?input=${encodeURIComponent(input)}`;
        if (lat && lng) {
          url += `&lat=${lat}&lng=${lng}`;
        }
        return url;
      },
    }),
  }),
});

export const {
  useGetNearbyPlacesQuery,
  useLazyGetNearbyPlacesQuery,
  useSearchPlacesQuery,
  useLazySearchPlacesQuery,
  useGetPlaceDetailsQuery,
  useLazyGetPlaceDetailsQuery,
  useGetAutocompleteQuery,
  useLazyGetAutocompleteQuery,
} = placesApi;
