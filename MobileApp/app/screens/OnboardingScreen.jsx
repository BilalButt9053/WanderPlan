import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { MotiView, AnimatePresence, MotiText } from "moti";
import { Map, UtensilsCrossed, Plane } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WanderButton from "../components/wander-button";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: <Map size={80} strokeWidth={1.5} color="#2F80ED" />,
    title: "Plan Your Journey",
    description:
      "Discover amazing destinations and create personalized travel itineraries with ease.",
  },
  {
    icon: <UtensilsCrossed size={80} strokeWidth={1.5} color="#F59E0B" />,
    title: "Explore Local Cuisine",
    description:
      "Find the best restaurants, cafes, and street food at your destination.",
  },
  {
    icon: <Plane size={80} strokeWidth={1.5} color="#2F80ED" />,
    title: "Budget Like a Pro",
    description:
      "Track your expenses and stay within budget while traveling the world.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1);
    } else {
      router.push("/(auth)/sign-in");
    }
  };

  const handleSkip = () => router.push("/(auth)/sign-in");

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <View className="items-end mb-4">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-gray-500 text-base">Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <View className="flex-1 justify-center items-center">
        <AnimatePresence>
          <MotiView
            key={currentSlide}
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -30 }}
            transition={{ type: "timing", duration: 350 }}
            style={{ width: width * 0.9, alignItems: "center" }}
          >
            {/* Icon */}
            <MotiView
              from={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="mb-8"
            >
              {slides[currentSlide].icon}
            </MotiView>

            {/* Title */}
            <MotiText className="text-3xl font-bold text-center mb-4 text-gray-800">
              {slides[currentSlide].title}
            </MotiText>

            {/* Description */}
            <MotiText className="text-gray-500 text-center text-base px-6">
              {slides[currentSlide].description}
            </MotiText>
          </MotiView>
        </AnimatePresence>
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center gap-2 my-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === currentSlide ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Button */}
      <WanderButton fullWidth size="lg" onPress={handleNext}>
        {currentSlide === slides.length - 1 ? "Let's Start" : "Next"}
      </WanderButton>
    </SafeAreaView>
  );
}
