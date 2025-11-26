import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

// SIMPLIFIED HOST SELECTION
// - Set `OVERRIDE_HOST` to your machine LAN IP (e.g. "192.168.1.100") when
//   testing from a physical device (Expo Go scanned QR). Leave empty to use
//   sensible defaults for simulators/emulators.
// - Android emulator (Android Studio) -> 10.0.2.2
// - iOS simulator / macOS -> localhost
// - Physical device -> set OVERRIDE_HOST to your PC IPv4
const OVERRIDE_HOST = "192.168.0.108"; // <-- replace with your PC LAN IP when needed

const BASE_HOST =
  OVERRIDE_HOST || (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const BASE_URL = `http://${BASE_HOST}:5000/api`;

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