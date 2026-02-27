import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const businessItemsApi = createApi({
  reducerPath: "businessItemsApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ['Items', 'Deals', 'Businesses'],
  endpoints: (builder) => ({
    // Get all businesses
    getBusinesses: builder.query({
      query: (params) => ({
        url: "/public/businesses",
        params,
      }),
      providesTags: ['Businesses'],
    }),
    
    // Get single business detail
    getBusinessDetail: builder.query({
      query: (id) => `/public/businesses/${id}`,
      providesTags: ['Businesses'],
    }),
    
    // Get menu items (for trip building)
    getMenuItems: builder.query({
      query: (params) => ({
        url: "/public/items",
        params,
      }),
      providesTags: ['Items'],
    }),
    
    // Get single item detail
    getItemDetail: builder.query({
      query: (id) => `/public/items/${id}`,
      providesTags: ['Items'],
    }),
    
    // Get active deals
    getDeals: builder.query({
      query: (params) => ({
        url: "/public/deals",
        params,
      }),
      providesTags: ['Deals'],
    }),
    
    // Get single deal detail
    getDealDetail: builder.query({
      query: (id) => `/public/deals/${id}`,
      providesTags: ['Deals'],
    }),
    
    // Get categories
    getCategories: builder.query({
      query: () => "/public/categories",
    }),
    
    // Search all (businesses, items, deals)
    searchAll: builder.query({
      query: (params) => ({
        url: "/public/search",
        params,
      }),
    }),
  }),
});

export const {
  useGetBusinessesQuery,
  useGetBusinessDetailQuery,
  useGetMenuItemsQuery,
  useGetItemDetailQuery,
  useGetDealsQuery,
  useGetDealDetailQuery,
  useGetCategoriesQuery,
  useSearchAllQuery,
} = businessItemsApi;
