import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

// Use a host that works from the Android emulator. On Android emulators
// localhost resolves to the emulator itself, so use 10.0.2.2 to reach the host
// machine where the backend runs. For iOS/simulators and web, localhost is fine.
// If using a physical device or Expo Go, replace with your machine's LAN IP
// (e.g. http://192.168.1.100:5000) or use an ngrok tunnel.
const BASE_URL = Platform.OS === "android"
  ? "http://192.168.0.105:5000/api"
  : "http://localhost:5000/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    // --- Register ---
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    // --- Login ---
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/auth/login",
        method: "POST",
        body: userData,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    // --- OTP Verify ---
    verifyOtp: builder.mutation({
      // server expects { email, otp }
      query: ({ email, otp }) => ({
        url: "/otp/verify",
        method: "POST",
        body: { email, otp },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    // --- Resend OTP ---
    resendOtp: builder.mutation({
      query: ({ email }) => ({
        url: "/otp/resend",
        method: "POST",
        body: { email },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    // --- Forgot Password ---
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
        headers: { "Content-Type": "application/json" },
      }),
    }),
    // --- Reset Password ---
    // server expects { email, otp, newPassword }
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { email, otp, newPassword },
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
} = authApi;
