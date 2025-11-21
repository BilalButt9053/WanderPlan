import React, { useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, MotiText } from "moti";
import { AnimatePresence } from "moti";
import { Map, UtensilsCrossed, Plane } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WanderButton from "../components/wander-button";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: Map,
    title: "Plan Your Journey",
    description:
      "Discover amazing destinations and create personalized travel itineraries with ease.",
    color: "#2F80ED",
  },
  {
    icon: UtensilsCrossed,
    title: "Explore Local Cuisine",
    description:
      "Find the best restaurants, cafes, and street food at your destination.",
    color: "#27AE60",
  },
  {
    icon: Plane,
    title: "Budget Like a Pro",
    description:
      "Track your expenses and stay within budget while traveling the world.",
    color: "#2F80ED",
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6">
        {/* Skip button */}
        {currentSlide < slides.length - 1 && (
          <View className="items-end mb-4">
            <TouchableOpacity onPress={onComplete}>
              <Text className="text-muted-foreground text-base">
                Skip
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Slide content */}
        <View className="flex-1 items-center justify-center">
          <Carousel
            ref={carouselRef}
            data={slides}
            width={width}
            height={500}
            pagingEnabled
            scrollAnimationDuration={300}
            onSnapToItem={(i) => setCurrentSlide(i)}
            renderItem={({ item }) => {
              const IconComponent = item.icon;
              return (
                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  exit={{ opacity: 0, translateX: -20 }}
                  transition={{ duration: 300 }}
                  className="flex-1 items-center justify-center px-6"
                >
                  {/* Icon */}
                  <View className="mb-8">
                    <IconComponent size={80} strokeWidth={1.5} color={item.color} />
                  </View>

                  {/* Title */}
                  <Text className="text-3xl font-bold text-center mb-4 text-foreground">
                    {item.title}
                  </Text>

                  {/* Description */}
                  <Text className="text-muted-foreground text-center text-base px-4">
                    {item.description}
                  </Text>
                </MotiView>
              );
            }}
          />
        </View>

        {/* Pagination dots */}
        <View className="flex-row justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
              }`}
            />
          ))}
        </View>

        {/* Next/Start button */}
        <WanderButton fullWidth size="lg" onPress={handleNext}>
          {currentSlide === slides.length - 1 ? "Let's Start" : "Next"}
        </WanderButton>
      </View>
    </SafeAreaView>
  );
}
