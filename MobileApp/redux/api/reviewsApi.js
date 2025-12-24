import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from './authApi';

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Reviews'],
  endpoints: (builder) => ({
    getReviews: builder.query({
      query: ({ category = 'all', page = 1, limit = 20, mine = undefined, userId = undefined, sortBy = undefined } = {}) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        params.set('page', page);
        params.set('limit', limit);
        if (typeof mine !== 'undefined') params.set('mine', mine ? 'true' : 'false');
        if (userId) params.set('userId', userId);
        if (sortBy) params.set('sortBy', sortBy);
        return `/reviews?${params.toString()}`;
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ _id }) => ({ type: 'Reviews', id: _id })),
              { type: 'Reviews', id: 'LIST' },
            ]
          : [{ type: 'Reviews', id: 'LIST' }],
    }),
    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: [{ type: 'Reviews', id: 'LIST' }],
    }),
    toggleLike: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}/like`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Reviews', id }, { type: 'Reviews', id: 'LIST' }],
    }),
    toggleHelpful: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}/helpful`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Reviews', id }, { type: 'Reviews', id: 'LIST' }],
    }),
    addComment: builder.mutation({
      query: ({ id, text }) => ({ url: `/reviews/${id}/comments`, method: 'POST', body: { text } }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Reviews', id }, { type: 'Reviews', id: 'LIST' }],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Reviews', id: 'LIST' }],
    }),
    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Reviews', id }, { type: 'Reviews', id: 'LIST' }],
    }),
    uploadImages: builder.mutation({
      query: (formData) => ({ url: '/uploads/images', method: 'POST', body: formData }),
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useCreateReviewMutation,
  useToggleLikeMutation,
  useToggleHelpfulMutation,
  useAddCommentMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
  useUploadImagesMutation,
} = reviewsApi;
