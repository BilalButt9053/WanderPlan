import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Map, UtensilsCrossed, Plane } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: <Map size={80} strokeWidth={1.5} color="#3B82F6" />,
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
    icon: <Plane size={80} strokeWidth={1.5} color="#3B82F6" />,
    title: "Budget Like a Pro",
    description:
      "Track your expenses and stay within budget while traveling the world.",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/auth/sign-in");
    }
  };

  const handleSkip = () => {
    router.push("/auth/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      {/* Skip button */}
      {currentSlide < slides.length - 1 && (
        <View className="items-end mb-4">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-gray-400 text-base">Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slide content */}
      <View className="flex-1 justify-center items-center">
        <AnimatePresence>
          <MotiView
            key={currentSlide}
            from={{ opacity: 0, translateX: 30 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -30 }}
            transition={{ type: "timing", duration: 300 }}
            style={{ width: width * 0.8, alignItems: "center" }}
          >
            <View className="mb-8">{slides[currentSlide].icon}</View>

            <Text className="text-2xl font-semibold text-gray-800 mb-3 text-center">
              {slides[currentSlide].title}
            </Text>

            <Text className="text-gray-500 text-center text-base">
              {slides[currentSlide].description}
            </Text>
          </MotiView>
        </AnimatePresence>
      </View>

      {/* Pagination dots */}
      <View className="flex-row justify-center gap-2 mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === currentSlide ? "w-8 bg-blue-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>

      {/* Next/Start button */}
      <TouchableOpacity
        onPress={handleNext}
        className="bg-blue-500 py-4 rounded-2xl w-full items-center mb-4"
      >
        <Text className="text-white font-semibold text-lg">
          {currentSlide === slides.length - 1 ? "Let's Start" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
