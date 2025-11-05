// SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen({ onFinish }) {
  const planeAnim = useRef(new Animated.Value(-200)).current; // airplane starts from left

  useEffect(() => {
    // Airplane looping animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(planeAnim, {
          toValue: 200,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(planeAnim, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Hide splash after 8 seconds
    const timer = setTimeout(() => {
      onFinish(); // tell App.js splash is done
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Animated.View
          style={[
            styles.plane,
            {
              transform: [{ translateX: planeAnim }],
            },
          ]}
        >
          <Ionicons name="airplane" size={32} color="#00bfff" />
        </Animated.View>

        <Image
          source={require('../assets/logo.png')} // 👈 your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Wander Plan</Text>
      <Text style={styles.subtitle}>Empowering your experience</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  plane: {
    position: 'absolute',
    top: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 8,
  },
});
