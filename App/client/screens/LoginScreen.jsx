import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MapPin, Mail, Lock } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useTailwind } from 'nativewind';

export function AuthScreen({ onForgotPassword, onSuccess }) {
  const { tw } = useTailwind();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = () => {
    // mock API call
    onSuccess();
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    onSuccess();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={tw`flex-1 bg-white`}
    >
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={tw`flex-1 justify-center items-center p-6`}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500)} style={tw`items-center mb-6`}>
            <View style={tw`w-16 h-16 bg-blue-500 rounded-2xl items-center justify-center shadow-lg mb-4`}>
              <MapPin color="white" size={32} strokeWidth={2.5} />
            </View>
            <Text style={tw`text-2xl font-bold`}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={tw`text-gray-500 mt-1 text-sm text-center`}>
              {isSignUp
                ? 'Start your journey with WanderPlan'
                : 'Sign in to continue your adventure'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            exiting={FadeOutDown.duration(300)}
            style={tw`w-full max-w-sm`}
          >
            {isSignUp && (
              <View style={tw`mb-4`}>
                <Text style={tw`text-sm font-medium mb-1`}>Full Name</Text>
                <TextInput
                  placeholder="John Doe"
                  style={tw`border border-gray-300 rounded-lg px-4 py-3`}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium mb-1`}>Email</Text>
              <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-3`}>
                <Mail size={20} color="#6b7280" />
                <TextInput
                  placeholder="you@example.com"
                  style={tw`flex-1 ml-2 py-3`}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`text-sm font-medium mb-1`}>Password</Text>
              <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-3`}>
                <Lock size={20} color="#6b7280" />
                <TextInput
                  placeholder="••••••••"
                  style={tw`flex-1 ml-2 py-3`}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {!isSignUp && (
              <TouchableOpacity onPress={onForgotPassword} style={tw`self-end mb-4`}>
                <Text style={tw`text-blue-600 text-sm`}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              style={tw`bg-blue-600 py-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-medium`}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={tw`flex-row items-center my-6`}>
              <View style={tw`flex-1 h-px bg-gray-300`} />
              <Text style={tw`mx-2 text-gray-400 text-sm`}>or continue with</Text>
              <View style={tw`flex-1 h-px bg-gray-300`} />
            </View>

            {/* Social Login */}
            <View style={tw`gap-3`}>
              <TouchableOpacity
                style={tw`flex-row items-center justify-center border border-gray-300 py-3 rounded-lg`}
                onPress={() => handleSocialLogin('Google')}
              >
                <Text style={tw`text-gray-700 font-medium`}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`flex-row items-center justify-center border border-gray-300 py-3 rounded-lg`}
                onPress={() => handleSocialLogin('Apple')}
              >
                <Text style={tw`text-gray-700 font-medium`}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Toggle sign in/up */}
            <View style={tw`items-center mt-6`}>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={tw`text-gray-500 text-sm`}>
                  {isSignUp
                    ? 'Already have an account? '
                    : "Don’t have an account? "}
                  <Text style={tw`text-blue-600`}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 