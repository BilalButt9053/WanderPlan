import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, Eye, EyeOff } from "lucide-react-native";
import { useResetPasswordMutation } from "../../redux/api/authApi";
import ReusableModal from "../components/Modal";
import WanderInput from "../components/wander-input";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  // --- Validation Functions ---
  const validatePassword = (pwd) => {
    if (!pwd) {
      return "Password is required";
    }
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    
    if (!hasSpecialChar) {
      return "Password must include a special character";
    }
    if (!hasUpperCase || !hasLowerCase) {
      return "Password must include uppercase and lowercase letters";
    }
    if (!hasNumber) {
      return "Password must include at least one number";
    }
    return "";
  };

  const validateConfirmPassword = (pwd, confirmPwd) => {
    if (!confirmPwd) {
      return "Please confirm your password";
    }
    if (pwd !== confirmPwd) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleResetPassword = async () => {
    // Validation
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(newPassword, confirmPassword);

    setErrors({
      newPassword: passwordError,
      confirmPassword: confirmError
    });

    if (passwordError || confirmError) {
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
        <View className="relative">
          <WanderInput
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errors.newPassword) {
                setErrors({ ...errors, newPassword: validatePassword(text) });
              }
            }}
            onBlur={() => setErrors({ ...errors, newPassword: validatePassword(newPassword) })}
            secureTextEntry={!showPassword}
            maxLength={50}
            icon={<Lock size={20} color="#6B7280" />}
            error={errors.newPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3"
          >
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
        <View className="relative">
          <WanderInput
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: validateConfirmPassword(newPassword, text) });
              }
            }}
            onBlur={() => setErrors({ ...errors, confirmPassword: validateConfirmPassword(newPassword, confirmPassword) })}
            secureTextEntry={!showConfirmPassword}
            maxLength={50}
            icon={<Lock size={20} color="#6B7280" />}
            error={errors.confirmPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3"
          >
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
