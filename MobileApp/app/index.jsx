import React, { useEffect, useState } from "react";
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

export default function Index() {
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return isSplash ? <SplashScreen /> : <OnboardingScreen />;
}
