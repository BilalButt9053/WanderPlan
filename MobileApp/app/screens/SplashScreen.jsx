import React from "react";
import { View, Text } from "react-native";
import { MapPin, UtensilsCrossed, Plane } from "lucide-react-native";
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={["#2F80ED", "#27AE60"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 w-full items-center justify-center p-4"
    >
      {/* Animated Plane */}
      <MotiView
        from={{ translateX: -100, opacity: 0 }}
        animate={{ translateX: 100, opacity: 1 }}
        transition={{
          loop: true,
          duration: 2500,
        }}
        className="mb-8"
      >
        <Plane size={32} color="#fff" />
      </MotiView>

      {/* Logo */}
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6"
      >
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center shadow-2xl">
          <View className="relative">
            <MapPin size={40} strokeWidth={2.5} color="#2F80ED" />
            <UtensilsCrossed
              size={24}
              strokeWidth={2.5}
              color="#27AE60"
              style={{ position: "absolute", bottom: -4, right: -4 }}
            />
          </View>
        </View>
      </MotiView>

      {/* App Name */}
      <MotiText
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400 }}
        className="text-white text-4xl font-bold text-center mb-2"
      >
        WanderPlan
      </MotiText>

      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 700 }}
        className="text-white/80 text-sm text-center"
      >
        Plan. Explore. Savor.
      </MotiText>

      {/* Loading Dots */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1000 }}
        className="mt-12 flex-row gap-2"
      >
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.5, opacity: 1 }}
            transition={{
              duration: 800,
              loop: true,
              delay: i * 200,
            }}
            className="w-2 h-2 bg-white rounded-full"
          />
        ))}
      </MotiView>
    </LinearGradient>
  );
}
