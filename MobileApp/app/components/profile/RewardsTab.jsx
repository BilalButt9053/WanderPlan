import React from 'react';
import { View, Text, TouchableOpacity, Alert, Share, ActivityIndicator } from 'react-native';
import { Award, Calendar, Gift, CheckCircle, Clock } from 'lucide-react-native';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';
import { WanderButton } from '../wander-button';
import { Progress } from '../ui/progress';

export default function RewardsTab({ rewards = [], nextRewardInfo, isLoading }) {
  const activeRewards = rewards.filter(r => r.isActive && !r.isRedeemed);
  const redeemedRewards = rewards.filter(r => r.isRedeemed);
  const expiredRewards = rewards.filter(r => !r.isActive && !r.isRedeemed);

  const handleRedeem = async (code) => {
    try {
      await Share.share({
        message: `Your coupon code: ${code}`,
      });
    } catch (error) {
      Alert.alert('Success', `Coupon code: ${code}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading rewards...</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 24 }}>
      {/* Progress Tracker */}
      <View
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(to right, rgba(251, 146, 60, 0.1), rgba(59, 130, 246, 0.1))',
          backgroundColor: '#FEF3C7',
        }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }}
          >
            <Award size={24} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold mb-1">Next Reward</Text>
            <Text className="text-sm text-gray-600 mb-2">
              {nextRewardInfo?.requirement || 'Write reviews to unlock rewards'}
            </Text>
            <Progress value={nextRewardInfo?.progress || 0} className="h-2" />
          </View>
        </View>
      </View>

      {/* Active Rewards */}
      <View>
        <Text className="text-lg font-bold mb-3">
          Available Coupons {activeRewards.length > 0 && `(${activeRewards.length})`}
        </Text>
        {activeRewards.length > 0 ? (
          <View style={{ gap: 12 }}>
            {activeRewards.map((reward) => (
              <WanderCard
                key={reward.id}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: '#F59E0B',
                }}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <WanderChip variant="accent" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>
                      <Text className="text-xs text-orange-600">{reward.discount}</Text>
                    </WanderChip>
                    <Text className="font-semibold mb-1">{reward.title}</Text>
                    <View className="flex-row items-center gap-2">
                      <Calendar size={14} color="#666" />
                      <Text className="text-sm text-gray-600">Expires {formatDate(reward.expiresAt)}</Text>
                    </View>
                  </View>
                </View>
                <WanderButton onPress={() => handleRedeem(reward.code)}>
                  <View className="flex-row items-center gap-2">
                    <Gift size={16} color="#fff" />
                    <Text className="text-white font-semibold">Copy Code: {reward.code}</Text>
                  </View>
                </WanderButton>
              </WanderCard>
            ))}
          </View>
        ) : (
          <View className="items-center py-8">
            <Gift size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <Text className="text-gray-500 text-center">No active rewards yet</Text>
            <Text className="text-gray-400 text-sm text-center mt-1">
              Complete activities to earn rewards!
            </Text>
          </View>
        )}
      </View>

      {/* Redeemed History */}
      {redeemedRewards.length > 0 && (
        <View>
          <Text className="text-lg font-bold mb-3">Redeemed</Text>
          <View style={{ gap: 8 }}>
            {redeemedRewards.map((reward) => (
              <WanderCard key={reward.id} style={{ opacity: 0.6 }}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold mb-1">{reward.title}</Text>
                    <View className="flex-row items-center gap-2">
                      <CheckCircle size={14} color="#10B981" />
                      <Text className="text-sm text-gray-600">Redeemed</Text>
                    </View>
                  </View>
                  <WanderChip variant="secondary">
                    <Text className="text-xs text-gray-700">{reward.discount}</Text>
                  </WanderChip>
                </View>
              </WanderCard>
            ))}
          </View>
        </View>
      )}

      {/* Expired Rewards */}
      {expiredRewards.length > 0 && (
        <View>
          <Text className="text-lg font-bold mb-3 text-gray-400">Expired</Text>
          <View style={{ gap: 8 }}>
            {expiredRewards.map((reward) => (
              <WanderCard key={reward.id} style={{ opacity: 0.4 }}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold mb-1 text-gray-500">{reward.title}</Text>
                    <View className="flex-row items-center gap-2">
                      <Clock size={14} color="#9CA3AF" />
                      <Text className="text-sm text-gray-400">Expired</Text>
                    </View>
                  </View>
                </View>
              </WanderCard>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
