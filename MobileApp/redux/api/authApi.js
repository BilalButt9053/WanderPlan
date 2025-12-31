import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../config";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/otp/verify",
        method: "POST",
        body: { email, otp },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    resendOtp: builder.mutation({
      query: ({ email }) => ({
        url: "/otp/resend",
        method: "POST",
        body: { email },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    socialLogin: builder.mutation({
      query: (socialData) => ({
        url: "/auth/social-login",
        method: "POST",
        body: socialData,
        headers: { "Content-Type": "application/json" },
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSocialLoginMutation,
} = authApi;