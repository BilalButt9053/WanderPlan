// OnboardingScreen.js
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);

  const screens = [
    {
      image: require('../assets/logo.png'),
      title: 'Welcome to MyApp',
      subtitle: 'Your personalized journey starts here.',
    },
    {
      image: require('../assets/logo.png'),
      title: 'Track Your Progress',
      subtitle: 'Stay on top of your goals effortlessly.',
    },
    {
      image: require('../assets/logo.png'),
      title: 'Achieve More',
      subtitle: 'Unlock success with smart tools and insights.',
    },
  ];

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      onFinish(); // go to login after last screen
    }
  };

  const handleSkip = () => {
    onFinish(); // skip directly to login
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image source={screens[step].image} style={styles.image} resizeMode="contain" />

      {/* Text content */}
      <Text style={styles.title}>{screens[step].title}</Text>
      <Text style={styles.subtitle}>{screens[step].subtitle}</Text>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {screens.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: step === index ? 1 : 0.3 },
            ]}
          />
        ))}
      </View>

      {/* Next button */}
      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>
          {step === 2 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: '#00bfff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00bfff',
    marginHorizontal: 6,
  },
  nextButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
