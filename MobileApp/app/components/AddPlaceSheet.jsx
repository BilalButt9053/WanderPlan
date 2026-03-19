/**
 * AddPlaceSheet - Bottom sheet for adding a Google Place to trip
 *
 * Allows selecting which day to add the place to and
 * setting an estimated cost.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  MapPin,
  Star,
  Calendar,
  DollarSign,
  Check,
} from 'lucide-react-native';
import { WanderButton } from './wander-button';
import { WanderCard } from './wander-card';
import { ImageWithFallback } from './ImageWithFallback';
import { useTheme } from '../../hooks/useTheme';
import { useAddPlaceToTripMutation } from '../../redux/api/tripsApi';

const AddPlaceSheet = ({
  visible,
  onClose,
  place,
  tripId,
  totalDays = 1,
  defaultDay = 1,
  onSuccess,
}) => {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [addPlaceToTrip, { isLoading }] = useAddPlaceToTripMutation();

  if (!place) return null;

  // Map Google place category to our activity type
  const getCategoryToType = (category) => {
    const mapping = {
      restaurant: 'food',
      cafe: 'food',
      hotel: 'hotel',
      attraction: 'attraction',
      shopping: 'shopping',
      other: 'other',
    };
    return mapping[category] || 'other';
  };

  // Map type to budget category
  const getTypeToCategory = (type) => {
    const mapping = {
      hotel: 'accommodation',
      food: 'food',
      transport: 'transport',
      attraction: 'activities',
      shopping: 'activities',
      entertainment: 'activities',
      other: 'activities',
    };
    return mapping[type] || 'activities';
  };

  const handleAddPlace = async () => {
    try {
      const type = getCategoryToType(place.category);
      const category = getTypeToCategory(type);

      const payload = {
        tripId,
        placeId: place.placeId,
        title: place.name,
        type,
        category,
        location: {
          name: place.name,
          address: place.address || '',
          coordinates: {
            lat: place.location?.lat,
            lng: place.location?.lng,
          },
          placeId: place.placeId,
        },
        estimatedCost: parseInt(estimatedCost) || 0,
        day: selectedDay,
        source: 'user',
      };

      await addPlaceToTrip(payload).unwrap();

      Alert.alert('Success', `${place.name} added to Day ${selectedDay}`);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Add place error:', error);
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to add place to trip'
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <View
          className="rounded-t-3xl max-h-3/4"
          style={{ backgroundColor: colors.card }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between p-4 border-b"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Add to Trip
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.input }}
            >
              <X size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* Place Info */}
            <WanderCard padding="sm" className="mb-4">
              <View className="flex-row gap-3">
                {place.photo ? (
                  <ImageWithFallback
                    source={{ uri: place.photo }}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: colors.input,
                    }}
                  >
                    <MapPin size={32} color={colors.textSecondary} />
                  </View>
                )}
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                    numberOfLines={2}
                  >
                    {place.name}
                  </Text>
                  {place.rating > 0 && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {place.rating.toFixed(1)}
                        {place.reviewCount > 0 && ` (${place.reviewCount})`}
                      </Text>
                    </View>
                  )}
                  <Text
                    className="text-sm mt-1"
                    style={{ color: colors.textSecondary }}
                    numberOfLines={2}
                  >
                    {place.address}
                  </Text>
                </View>
              </View>
            </WanderCard>

            {/* Day Selector */}
            <View className="mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <Calendar size={16} color={colors.textSecondary} />
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Select Day
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(
                    (day) => {
                      const isSelected = day === selectedDay;
                      return (
                        <TouchableOpacity
                          key={day}
                          onPress={() => setSelectedDay(day)}
                          className="w-12 h-12 rounded-xl items-center justify-center"
                          style={{
                            backgroundColor: isSelected
                              ? '#3B82F6'
                              : colors.input,
                          }}
                        >
                          <Text
                            className="text-sm font-semibold"
                            style={{
                              color: isSelected ? 'white' : colors.text,
                            }}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </ScrollView>
            </View>

            {/* Estimated Cost */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <DollarSign size={16} color={colors.textSecondary} />
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Estimated Cost (PKR)
                </Text>
              </View>
              <View
                className="flex-row items-center rounded-xl px-4"
                style={{ backgroundColor: colors.input }}
              >
                <Text
                  className="text-base mr-2"
                  style={{ color: colors.textSecondary }}
                >
                  PKR
                </Text>
                <TextInput
                  value={estimatedCost}
                  onChangeText={(text) =>
                    setEstimatedCost(text.replace(/[^0-9]/g, ''))
                  }
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  className="flex-1 py-3 text-base"
                  style={{ color: colors.text }}
                />
              </View>
              <Text
                className="text-xs mt-1"
                style={{ color: colors.textSecondary }}
              >
                Optional - Leave empty if unknown
              </Text>
            </View>

            {/* Add Button */}
            <WanderButton
              onPress={handleAddPlace}
              disabled={isLoading}
              className="mb-4"
            >
              <View className="flex-row items-center gap-2">
                {isLoading ? (
                  <Text className="text-white font-semibold">Adding...</Text>
                ) : (
                  <>
                    <Check size={18} color="white" />
                    <Text className="text-white font-semibold">
                      Add to Day {selectedDay}
                    </Text>
                  </>
                )}
              </View>
            </WanderButton>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddPlaceSheet;
