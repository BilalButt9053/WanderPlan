import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const complaintsApi = createApi({
  reducerPath: "complaintsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Complaints"],
  endpoints: (builder) => ({
    // Submit a new complaint
    createComplaint: builder.mutation({
      query: (body) => ({
        url: "/complaints",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Complaints"],
    }),

    // Get current user's complaints
    getMyComplaints: builder.query({
      query: (params = {}) => ({
        url: "/complaints",
        params,
      }),
      providesTags: ["Complaints"],
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetMyComplaintsQuery,
} = complaintsApi;

