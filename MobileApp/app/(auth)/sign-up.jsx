import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Plane, MapPin, UtensilsCrossed, Mail, User, Lock, Eye, EyeOff } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useRegisterUserMutation } from "../../redux/api/authApi";
import { setPendingEmail } from "../../redux/slices/authSlice";

export default function SignUpScreen() {
  const router = useRouter();
  const [secureText, setSecureText] = useState(true);
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  // --- Animated icons ---
  const planeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withRepeat(withSequence(withTiming(-20, { duration: 2000 }), withTiming(0, { duration: 2000 })), -1, true) },
      { rotate: withRepeat(withSequence(withTiming("5deg", { duration: 2000 }), withTiming("0deg", { duration: 2000 })), -1, true) },
    ],
  }));

  const pinStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withRepeat(withSequence(withTiming(1.1, { duration: 1500 }), withTiming(1, { duration: 1500 })), -1, true) },
    ],
  }));

  const utensilsStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withRepeat(withTiming("360deg", { duration: 10000 }), -1) }],
  }));

  // --- Handle Sign Up using RTK Query ---
  const handleSignUp = async () => {
    if (!fullName || !emailAddress || !password) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }

    try {
      const res = await registerUser({
        fullName,
        email: emailAddress,
        password,
      }).unwrap();

      Alert.alert("Success", res.message || "Account created successfully!");
      // Save pending email in Redux as a fallback for verify page
      router.push({ pathname: "/verify-email", params: { email: emailAddress } });
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", error?.data?.message || "Failed to sign up.");
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
          <Text className="text-2xl font-bold mb-1">Create Account</Text>
          <Text className="text-gray-500 text-center">
            Start your journey with WanderPlan
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View className="mb-3">
            <Text className="text-gray-700 mb-2">Full Name</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
              <User size={20} color="#6B7280" />
              <TextInput
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                className="flex-1 ml-2 text-base text-gray-700"
              />
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-gray-700 mb-2">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-3 py-2">
              <Mail size={20} color="#6B7280" />
              <TextInput
                placeholder="you@example.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
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

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            className={`py-3 rounded-xl ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to Sign In */}
        <View className="mt-8 items-center">
          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
