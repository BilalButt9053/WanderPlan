import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, Eye, EyeOff } from "lucide-react-native";
import { useResetPasswordMutation } from "../../redux/api/authApi";
import ReusableModal from "../components/Modal";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email information missing. Please start over.");
      return;
    }

    try {
      const res = await resetPassword({ 
        email,
        newPassword 
      }).unwrap();

      Alert.alert("Success", res.message || "Password reset successfully!");
      router.push("/sign-in");
    } catch (error) {
      console.error("Reset password error:", error);
      Alert.alert("Error", error?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <ReusableModal
      visible={true}
      onClose={() => router.push("/sign-in")}
      title="Reset Password"
    >
      <Text className="text-gray-600 mb-4 text-center">
        Enter your new password below.
      </Text>
      {email && (
        <Text className="text-gray-400 text-sm mb-4 text-center">For: {email}</Text>
      )}

      {/* New Password */}
      <View className="mb-3">
        <Text className="text-gray-700 mb-2">New Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
          <Lock size={20} color="#6B7280" />
          <TextInput
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            className="flex-1 ml-2 text-base text-gray-700"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password */}
      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Confirm Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
          <Lock size={20} color="#6B7280" />
          <TextInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            className="flex-1 ml-2 text-base text-gray-700"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={isLoading}
        className={`py-3 rounded-xl ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {isLoading ? "Resetting..." : "Reset Password"}
        </Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity onPress={() => router.push("/sign-in")} className="mt-3">
        <Text className="text-gray-500 text-center">Cancel</Text>
      </TouchableOpacity>
    </ReusableModal>
  );
}
