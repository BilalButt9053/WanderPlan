import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useForgotPasswordMutation } from "../../redux/api/authApi";
import ReusableModal from "../components/Modal";
import WanderInput from "../components/wander-input";

export default function ForgetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSendResetLink = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    
    if (error) {
      return;
    }

    try {
      const res = await forgotPassword({ email }).unwrap();
      Alert.alert("Success", res.message || "Reset code sent to your email!");
      
      // Navigate to verify-email screen with email and 'from' param
      router.push({ 
        pathname: "/verify-email", 
        params: { email, from: "forgotPassword" } 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      Alert.alert("Error", error?.data?.message || "Failed to send reset code.");
    }
  };

  return (
    <ReusableModal
      visible={true}
      onClose={() => router.back()}
      title="Forgot Password?"
    >
      <Text className="text-gray-600 mb-4 text-center">
        No worries! Enter your email and we'll send you reset instructions.
      </Text>

      {/* Email Input */}
      <View className="mb-4">
        <WanderInput
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) {
              setEmailError(validateEmail(text));
            }
          }}
          onBlur={() => setEmailError(validateEmail(email))}
          autoCapitalize="none"
          keyboardType="email-address"
          maxLength={50}
          icon={<Mail size={20} color="#6B7280" />}
          error={emailError}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={handleSendResetLink}
        disabled={isLoading}
        className={`py-3 rounded-xl ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="mt-3"
      >
        <Text className="text-gray-500 text-center">Cancel</Text>
      </TouchableOpacity>
    </ReusableModal>
  );
}
