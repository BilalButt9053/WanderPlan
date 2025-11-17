import React, { useRef, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { MotiView, MotiText } from "moti";
import { Map, UtensilsCrossed, Plane } from "lucide-react-native";
import { WanderButton } from "../components/wander-button";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: <Map size={80} strokeWidth={1.5} className="text-primary" />,
    title: "Plan Your Journey",
    description:
      "Discover amazing destinations and create personalized travel itineraries with ease.",
  },
  {
    icon: (
      <UtensilsCrossed size={80} strokeWidth={1.5} className="text-accent" />
    ),
    title: "Explore Local Cuisine",
    description:
      "Find the best restaurants, cafes, and street food at your destination.",
  },
  {
    icon: <Plane size={80} strokeWidth={1.5} className="text-primary" />,
    title: "Budget Like a Pro",
    description:
      "Track your expenses and stay within budget while traveling the world.",
  },
];

function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      carouselRef.current?.scrollTo({ index: currentSlide + 1, animated: true });
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-6">

      {currentSlide < slides.length - 1 && (
        <View className="items-end mb-4">
          <Text
            onPress={onComplete}
            className="text-muted-foreground text-base"
          >
            Skip
          </Text>
        </View>
      )}

      <Carousel
        ref={carouselRef}
        data={slides}
        width={width}
        height={500}
        pagingEnabled
        scrollAnimationDuration={500}
        onSnapToItem={(i) => setCurrentSlide(i)}
        renderItem={({ item }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 500 }}
            className="flex-1 items-center justify-center px-6"
          >
            <MotiView
              from={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="mb-8"
            >
              {item.icon}
            </MotiView>

            <MotiText className="text-3xl font-bold text-center mb-4 text-foreground">
              {item.title}
            </MotiText>

            <MotiText className="text-muted-foreground text-center text-base px-6">
              {item.description}
            </MotiText>
          </MotiView>
        )}
      />

      <View className="flex-row justify-center gap-2 my-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              index === currentSlide ? "w-8 bg-primary" : "w-2 bg-muted"
            }`}
          />
        ))}
      </View>

      <WanderButton fullWidth size="lg" onClick={handleNext}>
        {currentSlide === slides.length - 1 ? "Let's Start" : "Next"}
      </WanderButton>
    </SafeAreaView>
  );
}

export default OnboardingScreen;
