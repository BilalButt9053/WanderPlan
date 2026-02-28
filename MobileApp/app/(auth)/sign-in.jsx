import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
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
  useSocialLoginMutation,
} from "../../redux/api/authApi";
import WanderInput from "../components/wander-input";
import { useGoogleAuth, useFacebookAuth, handleGoogleSignIn, handleFacebookSignIn } from "../utils/socialAuth";

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [secureText, setSecureText] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const [loginUser, { isLoading: isLoggingIn }] = useLoginUserMutation();
  const [resendOtp] = useResendOtpMutation();
  const [socialLogin, { isLoading: isSocialLoading }] = useSocialLoginMutation();
  
  // Social auth hooks
  const { request: googleRequest, response: googleResponse, promptAsync: googlePromptAsync } = useGoogleAuth();
  const { request: facebookRequest, response: facebookResponse, promptAsync: facebookPromptAsync } = useFacebookAuth();

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleAuth();
    }
  }, [googleResponse]);

  // Handle Facebook OAuth response
  useEffect(() => {
    if (facebookResponse?.type === 'success') {
      handleFacebookAuth();
    }
  }, [facebookResponse]);

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

  // --- Validation Functions ---
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (pwd) => {
    if (!pwd) {
      return "Password is required";
    }
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    return "";
  };

  // --- Handle Sign In ---
  const handleSignIn = async () => {
    // Validate all fields
    const emailError = validateEmail(emailAddress);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError
    });

    if (emailError || passwordError) {
      return;
    }

    try {
      const res = await loginUser({ email: emailAddress, password }).unwrap();
      
      // Check if OTP verification is required for unverified users
      if (res.requiresVerification) {
        Toast.show({
          type: 'info',
          text1: 'Email Verification Required',
          text2: res.message || 'Please check your email for the verification code.',
          position: 'top',
          visibilityTime: 3000,
        });
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "login" } });
        return;
      }

      // Check if 2FA is required
      if (res.requires2FA) {
        Toast.show({
          type: 'info',
          text1: '2FA Required',
          text2: 'Please enter your 2FA code.',
          position: 'top',
          visibilityTime: 3000,
        });
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "2fa" } });
        return;
      }

      // Direct login successful for verified users
      dispatch(setCredentials(res));
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Welcome back!',
        position: 'top',
        visibilityTime: 2000,
      });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
      
      // Check if error is due to unverified email
      if (error?.data?.requiresVerification) {
        Toast.show({
          type: 'error',
          text1: 'Email Not Verified',
          text2: error?.data?.message || 'Please verify your email. An OTP has been sent.',
          position: 'top',
          visibilityTime: 4000,
        });
        router.push({ pathname: "/verify-email", params: { email: emailAddress, from: "login" } });
        return;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.data?.message || 'Invalid credentials.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  // --- Handle Google Authentication ---
  const handleGoogleAuth = async () => {
    try {
      const result = await handleGoogleSignIn(googlePromptAsync);
      
      if (result.success) {
        // Send to backend
        const response = await socialLogin({
          email: result.user.email,
          fullName: result.user.fullName,
          profilePhoto: result.user.profilePhoto,
          provider: result.user.provider,
          providerId: result.user.providerId,
          accessToken: result.accessToken,
        }).unwrap();

        dispatch(setCredentials(response));
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Signed in with Google successfully!',
          position: 'top',
          visibilityTime: 2000,
        });
        
        router.replace("/(tabs)");
      } else if (result.cancelled) {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Google sign in was cancelled',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        throw new Error(result.error || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to sign in with Google',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  // --- Handle Facebook Authentication ---
  const handleFacebookAuth = async () => {
    try {
      const result = await handleFacebookSignIn(facebookPromptAsync);
      
      if (result.success) {
        // Send to backend
        const response = await socialLogin({
          email: result.user.email,
          fullName: result.user.fullName,
          profilePhoto: result.user.profilePhoto,
          provider: result.user.provider,
          providerId: result.user.providerId,
          accessToken: result.accessToken,
        }).unwrap();

        dispatch(setCredentials(response));
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Signed in with Facebook successfully!',
          position: 'top',
          visibilityTime: 2000,
        });
        
        router.replace("/(tabs)");
      } else if (result.cancelled) {
        Toast.show({
          type: 'info',
          text1: 'Cancelled',
          text2: 'Facebook sign in was cancelled',
          position: 'top',
          visibilityTime: 2000,
        });
      } else {
        throw new Error(result.error || 'Facebook authentication failed');
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to sign in with Facebook',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  // --- Handle Social Login Button Press ---
  const handleSocialLogin = async (provider) => {
    try {
      if (provider === 'Google') {
        await googlePromptAsync();
      } else if (provider === 'Facebook') {
        await facebookPromptAsync();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to connect with ${provider}`,
        position: 'top',
        visibilityTime: 3000,
      });
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
          <WanderInput
            label="Email"
            placeholder="you@example.com"
            value={emailAddress}
            onChangeText={(text) => {
              setEmailAddress(text);
              if (errors.email) {
                setErrors({ ...errors, email: validateEmail(text) });
              }
            }}
            onBlur={() => setErrors({ ...errors, email: validateEmail(emailAddress) })}
            autoCapitalize="none"
            keyboardType="email-address"
            maxLength={50}
            icon={<Mail size={20} color="#6B7280" />}
            error={errors.email}
          />

          <View className="mb-3">
            <Text className="text-gray-700 mb-2">Password</Text>
            <View className="relative">
              <WanderInput
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: validatePassword(text) });
                  }
                }}
                onBlur={() => setErrors({ ...errors, password: validatePassword(password) })}
                secureTextEntry={secureText}
                maxLength={50}
                icon={<Lock size={20} color="#6B7280" />}
                error={errors.password}
              />
              <TouchableOpacity 
                onPress={() => setSecureText(!secureText)}
                className="absolute right-3 top-3"
              >
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

        {/* Divider */}
        <View className="flex-row items-center gap-4 my-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-sm text-gray-500">or continue with</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Social Login Buttons */}
        <View className="space-y-3 mb-6">
          {/* Google Login */}
          <TouchableOpacity
            onPress={() => handleSocialLogin('Google')}
            className="flex-row items-center justify-center gap-3 py-3 border border-gray-300 rounded-xl bg-white"
            activeOpacity={0.7}
          >
            <View style={styles.googleIcon}>
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text className="text-gray-700 font-semibold">Continue with Google</Text>
          </TouchableOpacity>

          {/* Facebook Login */}
          <TouchableOpacity
            onPress={() => handleSocialLogin('Facebook')}
            className="flex-row items-center justify-center gap-3 py-3 rounded-xl mt-6"
            style={{ backgroundColor: '#1877F2' }}
            activeOpacity={0.7}
          >
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookF}>f</Text>
            </View>
            <Text className="text-white font-semibold">Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to Sign Up */}
        <View className="mt-2 items-center">
          <TouchableOpacity onPress={() => router.push("/sign-up")}>
            <Text className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  facebookIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookF: {
    color: '#1877F2',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
});
