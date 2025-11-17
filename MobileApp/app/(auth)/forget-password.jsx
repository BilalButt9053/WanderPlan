import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
import { useForgotPasswordMutation } from "../../redux/api/authApi";
import ReusableModal from "../components/Modal";

export default function ForgetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
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
        <Text className="text-gray-700 mb-2">Email Address</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
          <Mail size={20} color="#6B7280" />
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            className="flex-1 ml-2 text-base text-gray-700"
          />
        </View>
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
