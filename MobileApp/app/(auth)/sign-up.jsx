import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import { Plane, MapPin, UtensilsCrossed, Mail, User, Lock, Eye, EyeOff } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useRegisterUserMutation, useSocialLoginMutation } from "../../redux/api/authApi";
import { setPendingEmail, setCredentials } from "../../redux/slices/authSlice";
import WanderInput from "../components/wander-input";
import { useGoogleAuth, useFacebookAuth, handleGoogleSignIn, handleFacebookSignIn } from "../utils/socialAuth";

export default function SignUpScreen() {
  const router = useRouter();
  const [secureText, setSecureText] = useState(true);
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  
  // Validation errors
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
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

  // --- Validation Functions ---
  const validateFullName = (name) => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (/\d/.test(name)) {
      return "Full name cannot contain numbers";
    }
    if (name.trim().length < 3) {
      return "Full name must be at least 3 characters";
    }
    if (name.trim().length > 50) {
      return "Full name must not exceed 50 characters";
    }
    return "";
  };

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

  // --- Handle Sign Up using RTK Query ---
  const handleSignUp = async () => {
    // Validate all fields
    const nameError = validateFullName(fullName);
    const emailError = validateEmail(emailAddress);
    const passwordError = validatePassword(password);

    setErrors({
      fullName: nameError,
      email: emailError,
      password: passwordError
    });

    if (nameError || emailError || passwordError) {
      return;
    }

    try {
      const res = await registerUser({
        fullName: fullName.trim(),
        email: emailAddress.trim(),
        password,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: res.message || 'Account created successfully!',
        position: 'top',
        visibilityTime: 3000,
      });
      router.push({ pathname: "/verify-email", params: { email: emailAddress } });
    } catch (error) {
      console.error("Signup error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || 'Failed to sign up.',
        position: 'top',
        visibilityTime: 4000,
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
          <Text className="text-2xl font-bold mb-1">Create Account</Text>
          <Text className="text-gray-500 text-center">
            Start your journey with WanderPlan
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <WanderInput
            label="Full Name"
            placeholder="Full Name"
            value={fullName}
            onChangeText={(text) => {
              // Remove digits from input
              const textWithoutDigits = text.replace(/\d/g, '');
              setFullName(textWithoutDigits);
              if (errors.fullName) {
                setErrors({ ...errors, fullName: validateFullName(textWithoutDigits) });
              }
            }}
            onBlur={() => setErrors({ ...errors, fullName: validateFullName(fullName) })}
            autoCapitalize="words"
            maxLength={50}
            icon={<User size={20} color="#6B7280" />}
            error={errors.fullName}
          />

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
            className="flex-row items-center justify-center gap-3 py-3 rounded-xl"
            style={{ backgroundColor: '#1877F2' }}
            activeOpacity={0.7}
          >
            <View style={styles.facebookIcon}>
              <Text style={styles.facebookF}>f</Text>
            </View>
            <Text className="text-white font-semibold">Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to Sign In */}
        <View className="mt-2 items-center">
          <TouchableOpacity onPress={() => router.push("/sign-in")}>
            <Text className="text-gray-500 text-sm">
              Already have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign In</Text>
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
