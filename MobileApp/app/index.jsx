import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
// import SplashScreen from "./screens/SplashScreen";
// import OnboardingScreen from "./screens/OnboardingScreen";

export default function Index() {
  // const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    // Redirect directly to tabs for development
    // Use setTimeout to ensure root layout is mounted first
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 100);

    // const timer = setTimeout(() => {
    //   setIsSplash(false);
    // }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // const handleOnboardingComplete = () => {
  //   // Navigate to sign-in or home after onboarding
  //   router.push("/(auth)/sign-in");
  // };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  // return (
  //   <View style={{ flex: 1 }}>
  //     {isSplash ? <SplashScreen /> : <OnboardingScreen onComplete={handleOnboardingComplete} />}
  //   </View>
  // );
}
