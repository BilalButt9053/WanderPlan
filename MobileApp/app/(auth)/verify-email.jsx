import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import { Mail, CheckCircle } from "lucide-react-native";
import { useVerifyOtpMutation, useResendOtpMutation } from "../../redux/api/authApi";
import WanderInput from "../components/wander-input";

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
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  // --- OTP Validation ---
  const validateOtp = (otp) => {
    if (!otp.trim()) {
      return "Verification code is required";
    }
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      return "OTP must be exactly 6 digits";
    }
    return "";
  };

  // --- Handle OTP Verification ---
  const handleVerify = async () => {
    const error = validateOtp(code);
    setCodeError(error);
    
    if (error || !finalEmail) {
      if (!finalEmail) {
        Alert.alert("Error", "Email missing.");
      }
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
        <WanderInput
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={code}
          onChangeText={(text) => {
            // Only allow digits
            const digitsOnly = text.replace(/[^0-9]/g, '');
            // Limit to 6 digits
            const limitedText = digitsOnly.slice(0, 6);
            setCode(limitedText);
            if (codeError) {
              setCodeError(validateOtp(limitedText));
            }
          }}
          onBlur={() => setCodeError(validateOtp(code))}
          keyboardType="number-pad"
          maxLength={6}
          icon={<CheckCircle size={20} color="#6B7280" />}
          error={codeError}
          className="tracking-widest"
        />

        <Text className="text-gray-500 text-sm mt-1">
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
