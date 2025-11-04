import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import {
  DollarSign,
  MapPin,
  Calendar,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Edit3,
} from "lucide-react-native";

const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "INR"];
const popularDestinations = [
  "Paris, France",
  "Tokyo, Japan",
  "Bali, Indonesia",
  "New York, USA",
  "Barcelona, Spain",
  "Dubai, UAE",
];

export default function BudgetInputScreen({
  onGeneratePlan,
  onManualCreate,
  onBack,
}) {
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

  const handleGeneratePlan = () => {
    if (budget && destination && duration) {
      onGeneratePlan({ budget, currency, destination, duration });
    }
  };

  const filteredDestinations = destination
    ? popularDestinations.filter((d) =>
        d.toLowerCase().includes(destination.toLowerCase())
      )
    : popularDestinations;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200 bg-white">
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center"
        >
          <ArrowLeft size={20} color="black" />
        </TouchableOpacity>
        <View className="ml-3">
          <Text className="text-lg font-semibold">Plan Your Trip</Text>
          <Text className="text-gray-500 text-sm">
            Let's start with the basics
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="px-4 py-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Budget Input */}
        <View className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-200">
          <View className="flex-row items-center mb-2">
            <DollarSign size={18} color="#2563EB" />
            <Text className="ml-2 font-medium">Total Budget</Text>
          </View>

          <View className="flex-row gap-2">
            <TextInput
              keyboardType="numeric"
              placeholder="5000"
              value={budget}
              onChangeText={setBudget}
              className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-3"
            />

            <TouchableOpacity
              onPress={() => setShowCurrencyModal(true)}
              className="flex-row items-center border border-gray-300 bg-white rounded-2xl px-4 py-3"
            >
              <Text className="mr-2">{currency}</Text>
              <ChevronDown size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Destination Input */}
        <View className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-200">
          <View className="flex-row items-center mb-2">
            <MapPin size={18} color="#2563EB" />
            <Text className="ml-2 font-medium">Destination</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowDestinationModal(true)}
            className="border border-gray-300 bg-white rounded-2xl px-4 py-3"
          >
            <Text className={destination ? "text-black" : "text-gray-400"}>
              {destination || "Where do you want to go?"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Duration Input */}
        <View className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-200">
          <View className="flex-row items-center mb-2">
            <Calendar size={18} color="#2563EB" />
            <Text className="ml-2 font-medium">Duration</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TextInput
              keyboardType="numeric"
              placeholder="7"
              value={duration}
              onChangeText={setDuration}
              className="flex-1 bg-white border border-gray-300 rounded-2xl px-4 py-3"
            />
            <Text className="text-gray-500">days</Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          onPress={handleGeneratePlan}
          disabled={!budget || !destination || !duration}
          className={`flex-row items-center justify-center py-4 rounded-2xl mb-4 ${
            !budget || !destination || !duration
              ? "bg-blue-300"
              : "bg-blue-600"
          }`}
        >
          <Sparkles size={20} color="white" />
          <Text className="text-white font-semibold ml-2">
            Generate Plan with AI
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="mx-3 text-gray-500">or</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Manual Create Button */}
        <TouchableOpacity
          onPress={onManualCreate}
          className="flex-row items-center justify-center border border-gray-300 rounded-2xl py-4"
        >
          <Edit3 size={20} color="black" />
          <Text className="ml-2 font-medium">Create Trip Manually</Text>
        </TouchableOpacity>

        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 p-4 rounded-2xl mt-6 flex-row">
          <Sparkles size={20} color="#2563EB" />
          <View className="ml-3 flex-1">
            <Text className="text-blue-600 font-medium mb-1">
              AI-Powered Planning
            </Text>
            <Text className="text-gray-500 text-sm">
              Our AI will analyze your budget and create an optimized itinerary
              with the best places to visit, eat, and stay.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-4 max-h-[60%]">
            <Text className="text-lg font-semibold mb-3">Select Currency</Text>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCurrency(item);
                    setShowCurrencyModal(false);
                  }}
                  className="p-3 border-b border-gray-100"
                >
                  <Text className="text-base">{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowCurrencyModal(false)}
              className="mt-4 bg-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-gray-700 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Destination Modal */}
      <Modal visible={showDestinationModal} transparent animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
            <Text className="text-lg font-semibold mb-3">Select Destination</Text>

            <TextInput
              placeholder="Search destination..."
              value={destination}
              onChangeText={setDestination}
              className="border border-gray-300 rounded-2xl px-4 py-3 mb-3"
            />

            <FlatList
              data={filteredDestinations}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setDestination(item);
                    setShowDestinationModal(false);
                  }}
                  className="p-3 border-b border-gray-100 flex-row items-center"
                >
                  <MapPin size={14} color="#6B7280" />
                  <Text className="ml-2 text-base">{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setShowDestinationModal(false)}
              className="mt-4 bg-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-gray-700 font-medium">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
