import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Plane, MapPin, UtensilsCrossed, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import {
  useLoginUserMutation,
  useResendOtpMutation,
} from "../../redux/api/authApi";

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [secureText, setSecureText] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser, { isLoading: isLoggingIn }] = useLoginUserMutation();
  const [resendOtp] = useResendOtpMutation();

  // --- Animations ---
  const planeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-20, { duration: 2000 }),
            withTiming(0, { duration: 2000 })
          ),
          -1,
          true
        ),
      },
      {
        rotate: withRepeat(
          withSequence(
            withTiming("5deg", { duration: 2000 }),
            withTiming("0deg", { duration: 2000 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  const pinStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1.1, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        ),
      },
    ],
  }));

  const utensilsStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: withRepeat(withTiming("360deg", { duration: 10000 }), -1) },
    ],
  }));

  // --- Handle Sign In ---
  const handleSignIn = async () => {
    if (!emailAddress || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const res = await loginUser({ email: emailAddress, password }).unwrap();
      
      // Check if OTP verification is required for login
      if (res.requiresLoginOtp || res.requiresVerification) {
        Alert.alert("OTP Sent", res.msg || res.message || "Please check your email for the verification code.");
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "login" } });
        return;
      }

      // Check if 2FA is required
      if (res.requires2FA) {
        Alert.alert("2FA Required", "Please enter your 2FA code.");
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "2fa" } });
        return;
      }

      // Direct login successful (shouldn't reach here with new flow)
      dispatch(setCredentials(res));
      Alert.alert("Success", "Welcome back!");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      
      // Check if error is due to unverified email
      if (error?.data?.requiresVerification) {
        Alert.alert("Email Not Verified", error?.data?.message || "Please verify your email. An OTP has been sent.");
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "login" } });
        return;
      }
      
      Alert.alert("Login Failed", error?.data?.message || "Invalid credentials.");
    }
  };


  return (
    <ScrollView className="flex-1 bg-white relative">
      {/* Background icons */}
      <View className="absolute inset-0 opacity-10">
        <Animated.View className="absolute top-20 right-10" style={planeStyle}>
          <Plane size={80} color="#2563EB" />
        </Animated.View>
        <Animated.View className="absolute bottom-40 left-10" style={pinStyle}>
          <MapPin size={60} color="#F59E0B" />
        </Animated.View>
        <Animated.View className="absolute top-1/2 right-20" style={utensilsStyle}>
          <UtensilsCrossed size={50} color="#2563EB" />
        </Animated.View>
      </View>

      {/* Content */}
      <View className="z-10 min-h-screen flex flex-col px-6 pt-24 pb-10">
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center shadow-lg mb-4">
            <MapPin size={32} color="white" />
          </View>
          <Text className="text-xl font-bold mb-1">Welcome Back</Text>
          <Text className="text-gray-500 text-center">
            Sign in to continue your adventure
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View className="mb-3">
            <Text className="text-gray-700 mb-2">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
              <Mail size={20} color="#6B7280" />
              <TextInput
                placeholder="you@example.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                className="flex-1 ml-2 text-base text-gray-700"
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-gray-700 mb-2">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
              <Lock size={20} color="#6B7280" />
              <TextInput
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                className="flex-1 ml-2 text-base text-gray-700"
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                {secureText ? (
                  <Eye size={20} color="#6B7280" />
                ) : (
                  <EyeOff size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/forget-password")}>
            <Text className="text-blue-500 text-right mb-4">
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoggingIn}
            className={`py-3 rounded-xl ${isLoggingIn ? "bg-blue-400" : "bg-blue-600"
              }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to Sign Up */}
        <View className="mt-8 items-center">
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
