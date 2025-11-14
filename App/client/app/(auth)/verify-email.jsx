import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { Mail, CheckCircle } from "lucide-react-native";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../redux/api/authApi";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Correct way to get params in expo-router
  const params = useLocalSearchParams();
  const emailParam = params?.email;
  const fromScreen = params?.from || "signup"; // Can be: signup, login, forgotPassword

  // Fallback email from Redux
  const pendingEmail = useSelector((state) => state.auth?.pendingEmail);

  const finalEmail = emailParam || pendingEmail || null;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // --- Handle OTP Verification ---
  const handleVerify = async () => {
    if (!finalEmail || !code.trim()) {
      Alert.alert("Error", "Verification code or email missing.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ email: finalEmail, otp: code }).unwrap();

      Alert.alert("Success", res.message || "Email verified successfully!");

      if (res?.token && res?.user) {
        dispatch(setCredentials({ user: res.user, token: res.token }));
      }

      // Route based on where we came from
      if (fromScreen === "forgotPassword") {
        // For forgot password, go to reset-success to enter new password
        router.push({ pathname: "/reset-success", params: { email: finalEmail } });
      } else {
        // For signup/login, go to tabs
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      Alert.alert("Error", err?.data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Resend OTP ---
  const handleResend = async () => {
    if (!finalEmail) {
      Alert.alert("Error", "No email available to resend the code.");
      return;
    }

    try {
      await resendOtp({ email: finalEmail }).unwrap();
      Alert.alert("Success", "Verification code resent. Check your inbox.");
    } catch (err) {
      console.error("Resend OTP failed:", err);
      Alert.alert("Error", err?.data?.message || "Unable to resend code.");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center shadow-lg mb-4">
          <Mail size={32} color="white" />
        </View>
        <Text className="text-2xl font-bold mb-1">Verify Your Email</Text>
        <Text className="text-gray-500 text-center px-8">
          Enter the 6-digit code sent to your email address.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Verification Code</Text>

        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
          <CheckCircle size={20} color="#6B7280" />
          <TextInput
            placeholder="Enter code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            className="flex-1 ml-2 text-base text-gray-700 tracking-widest"
          />
        </View>

        <Text className="text-gray-500 text-sm mt-3">
          Code sent to: {finalEmail ?? "Unknown Email"}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className={`py-3 rounded-xl ${loading ? "bg-gray-400" : "bg-blue-600"}`}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Verifying..." : "Verify Email"}
        </Text>
      </TouchableOpacity>

      <View className="items-center mt-6">
        <TouchableOpacity onPress={handleResend} disabled={isResending}>
          <Text className={`font-medium ${isResending ? "text-gray-400" : "text-blue-600"}`}>
            {isResending ? "Resending..." : "Resend Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
