// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Google Sign In (placeholder — real logic can be added later)
  const handleGoogleSignIn = async () => {
    await WebBrowser.openBrowserAsync('https://accounts.google.com/');
  };

  const handleAppleSignIn = async () => {
    await WebBrowser.openBrowserAsync('https://appleid.apple.com/');
  };

  const handleAuth = () => {
    console.log(isSignup ? 'Signup pressed' : 'Login pressed', { email, password });
  };

  return (
    <View style={styles.container}>
      {/* App Logo */}
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Header */}
      <Text style={styles.heading}>
        {isSignup ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text style={styles.subtext}>
        {isSignup
          ? 'Sign up to get started with MyApp'
          : 'Sign in to continue your journey'}
      </Text>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Sign In / Sign Up Button */}
      <TouchableOpacity style={styles.mainButton} onPress={handleAuth}>
        <Text style={styles.mainButtonText}>
          {isSignup ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {/* Continue With */}
      <Text style={styles.continueText}>or continue with</Text>

      {/* Google and Apple Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <Ionicons name="logo-google" size={22} color="#DB4437" />
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
          <Ionicons name="logo-apple" size={22} color="#000" />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Switch between SignIn and SignUp */}
      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.toggleText}>
          {isSignup
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// 💅 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 14,
    color: '#555',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#00bfff',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  continueText: {
    color: '#777',
    fontSize: 14,
    marginVertical: 20,
  },
  socialContainer: {
    width: '100%',
    gap: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  toggleText: {
    marginTop: 25,
    fontSize: 14,
    color: '#00bfff',
    fontWeight: '500',
  },
});
