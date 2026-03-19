import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Star, MapPin, Bookmark, ThumbsUp, TrendingUp, Camera } from 'lucide-react-native';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';
import { Progress } from '../ui/progress';

// Badge icon mapping
const getBadgeIcon = (badgeId) => {
  const icons = {
    first_review: '⭐',
    explorer: '🧭',
    foodie: '🍽️',
    helpful: '👍',
    photographer: '📷',
    seasoned: '🏆',
  };
  return icons[badgeId] || '🎖️';
};

export default function OverviewTab({ profile, isLoading }) {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading profile...</Text>
      </View>
    );
  }

  const fullStats = profile.fullStats || {};

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
            <Text className="text-blue-500 font-semibold">{profile.points.toLocaleString()} pts</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Reviews This Month</Text>
            <Text className="font-semibold">{fullStats.reviewsThisMonth || 0}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Avg. Rating Given</Text>
            <Text className="font-semibold">{fullStats.avgRating || 0} ⭐</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-600">Photos Uploaded</Text>
            <Text className="font-semibold">{fullStats.photos || 0}</Text>
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
              {profile.badges?.filter(b => b.earned).length || 0} earned
            </Text>
          </WanderChip>
        </View>
        {profile.badges?.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {profile.badges.map((badge, index) => (
              <View
                key={badge.id || index}
                className="w-[30%] items-center p-3 rounded-xl"
                style={{
                  backgroundColor: badge.earned ? 'rgba(59, 130, 246, 0.1)' : '#F3F4F6',
                  opacity: badge.earned ? 1 : 0.5,
                }}
              >
                <Text className="text-3xl mb-2">{getBadgeIcon(badge.id)}</Text>
                <Text className="text-xs text-center" numberOfLines={1}>{badge.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-4">
            <Text className="text-gray-500 text-sm">Complete activities to earn badges!</Text>
          </View>
        )}
      </WanderCard>
    </View>
  );
}
