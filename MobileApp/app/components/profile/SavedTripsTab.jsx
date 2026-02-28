import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { WanderCard } from '../wander-card';
import { ImageWithFallback } from '../ImageWithFallback';

export default function SavedTripsTab({ trips }) {
  return (
    <View style={{ gap: 12 }}>
      {trips.map((trip) => (
        <TouchableOpacity key={trip.id}>
          <WanderCard padding="none">
            <View className="flex-row gap-3 p-3">
              <View className="w-20 h-20 rounded-xl overflow-hidden">
                <ImageWithFallback
                  source={{ uri: trip.image }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base mb-2">{trip.destination}</Text>
                <Text className="text-sm text-gray-600 mb-2">${trip.budget} budget</Text>
                <Text className="text-xs text-gray-500">Saved {trip.savedAt}</Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
            </View>
          </WanderCard>
        </TouchableOpacity>
      ))}
    </View>
  );
}
