import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Share2,
  Store,
  Tag,
} from 'lucide-react-native';
import ImageWithFallback from '../components/ImageWithFallback';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';
import { WanderButton } from '../components/wander-button';
import { useGetDealDetailQuery } from '../../redux/api/businessItemsApi';

const getImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.url || value.uri || fallback;
};

const formatDiscount = (deal) => {
  if (!deal) return 'Deal';
  if (deal.discountType === 'percentage') return `${deal.discountValue || 0}% OFF`;
  if (deal.discountType === 'fixed') return `PKR ${Number(deal.discountValue || 0).toLocaleString()} OFF`;
  if (deal.discountType === 'bogo') return 'Buy 1 Get 1';
  if (deal.discountType === 'freeItem') return 'Free Item';
  return 'Special Offer';
};

const formatDate = (date) => {
  if (!date) return 'Not specified';
  return new Date(date).toLocaleDateString();
};

const getBusinessCoordinates = (business) => ({
  lat: business?.address?.coordinates?.lat ?? business?.geoLocation?.coordinates?.[1] ?? null,
  lng: business?.address?.coordinates?.lng ?? business?.geoLocation?.coordinates?.[0] ?? null,
});

export default function DealDetailScreen() {
  const router = useRouter();
  const { dealId } = useLocalSearchParams();
  const { data, isLoading, error } = useGetDealDetailQuery(dealId, { skip: !dealId });
  const deal = data?.deal;

  const imageUrl = useMemo(() => {
    return getImageUrl(
      deal?.image,
      getImageUrl(deal?.menuItems?.[0]?.images?.[0], 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1080')
    );
  }, [deal]);

  const businessLocation = [
    deal?.business?.address?.street,
    deal?.business?.address?.city,
    deal?.business?.address?.country,
  ].filter(Boolean).join(', ');

  const handleShare = async () => {
    if (!deal) return;
    await Share.share({
      title: deal.title,
      message: `${deal.title}\n${formatDiscount(deal)}${deal.code ? `\nCode: ${deal.code}` : ''}`,
    });
  };

  const openBusinessOnMap = () => {
    const coordinates = getBusinessCoordinates(deal?.business);
    router.push({
      pathname: '/(tabs)/maps',
      params: {
        focusPlaceId: deal?.business?._id,
        focusLat: coordinates.lat,
        focusLng: coordinates.lng,
        focusName: deal?.business?.businessName,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3">Loading deal...</Text>
      </SafeAreaView>
    );
  }

  if (error || !deal) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Deal Not Found</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">This deal may no longer be active.</Text>
        <WanderButton onPress={() => router.back()}>Go Back</WanderButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="relative">
          <ImageWithFallback
            src={imageUrl}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
              <Share2 size={18} color="#111827" />
            </TouchableOpacity>
          </View>
          <View className="absolute bottom-4 left-4">
            <WanderChip variant="accent" size="sm">{formatDiscount(deal)}</WanderChip>
          </View>
        </View>

        <View className="px-4 pt-5 pb-8">
          <Text className="text-2xl font-bold text-gray-900">{deal.title}</Text>
          <View className="flex-row items-center mt-2">
            <Store size={15} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-2">{deal.business?.businessName || 'Business'}</Text>
          </View>

          {deal.description ? (
            <View className="mt-5">
              <Text className="text-lg font-bold text-gray-900 mb-2">Details</Text>
              <Text className="text-sm text-gray-600 leading-6">{deal.description}</Text>
            </View>
          ) : null}

          <View className="mt-5" style={{ gap: 10 }}>
            <WanderCard>
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#3B82F6" />
                <Text className="text-sm text-gray-700 ml-2">
                  Valid {formatDate(deal.startDate)} to {formatDate(deal.endDate)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Tag size={16} color="#10B981" />
                <Text className="text-sm text-gray-700 ml-2">
                  {deal.code ? `Use code ${deal.code}` : 'Show this offer at the business'}
                </Text>
              </View>
            </WanderCard>

            {businessLocation ? (
              <TouchableOpacity onPress={openBusinessOnMap} activeOpacity={0.9}>
                <WanderCard>
                  <View className="flex-row items-start">
                    <MapPin size={18} color="#3B82F6" />
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-semibold text-gray-900">Business Location</Text>
                      <Text className="text-sm text-gray-600 mt-1">{businessLocation}</Text>
                    </View>
                  </View>
                </WanderCard>
              </TouchableOpacity>
            ) : null}
          </View>

          {deal.terms ? (
            <View className="mt-5">
              <Text className="text-lg font-bold text-gray-900 mb-2">Terms</Text>
              <Text className="text-sm text-gray-600 leading-6">{deal.terms}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="px-4 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          onPress={openBusinessOnMap}
          className="bg-blue-600 rounded-2xl py-4 items-center justify-center flex-row"
          style={{ gap: 8 }}
        >
          <MapPin size={18} color="#fff" />
          <Text className="text-white font-semibold text-base">View on Map</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
