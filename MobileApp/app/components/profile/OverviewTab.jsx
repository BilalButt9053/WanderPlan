import React from 'react';
import { View, Text } from 'react-native';
import { Star, MapPin, Bookmark, ThumbsUp, TrendingUp } from 'lucide-react-native';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';
import { Progress } from '../ui/progress';

export default function OverviewTab({ profile }) {
  return (
    <View style={{ gap: 16 }}>
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3">
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <Star size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.reviews}</Text>
              <Text className="text-sm text-gray-600">Reviews</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <MapPin size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.trips}</Text>
              <Text className="text-sm text-gray-600">Trips</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <Bookmark size={24} color="#3B82F6" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.saved}</Text>
              <Text className="text-sm text-gray-600">Saved Places</Text>
            </View>
          </WanderCard>
        </View>
        <View className="w-[48%]">
          <WanderCard>
            <View className="items-center">
              <ThumbsUp size={24} color="#F59E0B" style={{ marginBottom: 8 }} />
              <Text className="text-2xl font-bold">{profile.stats.helpful}</Text>
              <Text className="text-sm text-gray-600">Helpful Votes</Text>
            </View>
          </WanderCard>
        </View>
      </View>

      {/* Contributor Stats */}
      <WanderCard>
        <View className="flex-row items-center gap-2 mb-4">
          <TrendingUp size={20} color="#3B82F6" />
          <Text className="text-lg font-semibold">Contributor Stats</Text>
        </View>
        <View style={{ gap: 12 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Total Impact Score</Text>
            <Text className="text-blue-500 font-semibold">2,450 pts</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Reviews This Month</Text>
            <Text className="font-semibold">8</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Avg. Rating Given</Text>
            <Text className="font-semibold">4.6 ⭐</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Member Since</Text>
            <Text className="font-semibold">{profile.memberSince}</Text>
          </View>
        </View>
      </WanderCard>

      {/* Badges */}
      <WanderCard>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold">Badges</Text>
          <WanderChip variant="primary">
            <Text className="text-xs text-blue-600">
              {profile.badges.filter(b => b.unlocked).length}/{profile.badges.length}
            </Text>
          </WanderChip>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {profile.badges.map((badge) => (
            <View
              key={badge.id}
              className="w-[30%] items-center p-3 rounded-xl"
              style={{
                backgroundColor: badge.unlocked ? 'rgba(59, 130, 246, 0.1)' : '#F3F4F6',
                opacity: badge.unlocked ? 1 : 0.5,
              }}
            >
              <Text className="text-3xl mb-2">{badge.icon}</Text>
              <Text className="text-xs text-center" numberOfLines={1}>{badge.name}</Text>
              {badge.progress && !badge.unlocked && (
                <View className="w-full mt-2">
                  <Progress value={badge.progress} className="h-1" />
                  <Text className="text-xs text-gray-600 text-center mt-1">{badge.progress}%</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </WanderCard>
    </View>
  );
}
