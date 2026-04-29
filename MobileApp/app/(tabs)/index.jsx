
import React from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { useTheme } from '../../hooks/useTheme';
import { 
  MapPin, 
  Star, 
  TrendingUp, 
  ChevronRight,
  Award,
  Navigation,
  Sun,
  Moon,
  Tag
} from 'lucide-react-native';
import ImageWithFallback from '../components/ImageWithFallback';
import { SafeAreaView } from 'react-native-safe-area-context';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';
import Progress from '../components/ui/progress';
import {
  useGetCompletedTripsQuery,
  useGetDealsQuery,
  useGetNearbyBusinessesQuery,
} from '../../redux/api/businessItemsApi';
import { useGetRewardsQuery } from '../../redux/api/userProfileApi';

const { width } = Dimensions.get('window');

const getImageUrl = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.url || value.uri || fallback;
};

const getBusinessCoordinates = (business) => ({
  lat: business?.address?.coordinates?.lat ?? business?.geoLocation?.coordinates?.[1] ?? null,
  lng: business?.address?.coordinates?.lng ?? business?.geoLocation?.coordinates?.[0] ?? null,
});

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user || null);
  const isAuthenticated = useSelector((state) => Boolean(state.auth?.isAuthenticated));
  const { isDarkMode, colors } = useTheme();
  const [userLocation, setUserLocation] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (error) {
        console.log('Home location unavailable:', error?.message);
      }
    })();
  }, []);

  // Fetch deals from API
  const { data: dealsData, isLoading: dealsLoading } = useGetDealsQuery(
    { limit: 10 },
    { pollingInterval: 15000, refetchOnFocus: true, refetchOnReconnect: true }
  );
  const { data: rewardsData, isLoading: rewardsLoading } = useGetRewardsQuery('all', {
    skip: !isAuthenticated,
    pollingInterval: 20000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: nearbyBusinessesData, isLoading: hiddenGemsLoading } = useGetNearbyBusinessesQuery(
    userLocation
      ? {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radiusKm: 10,
          limit: 6,
        }
      : undefined,
    { skip: !userLocation, pollingInterval: 20000, refetchOnFocus: true, refetchOnReconnect: true }
  );

  // Transform API deals to match expected format
  const deals = React.useMemo(() => {
    if (!dealsData?.deals || dealsData.deals.length === 0) {
      return [];
    }
    return dealsData.deals.map(deal => {
      const discountText = deal.discountType === 'percentage' 
        ? `${deal.discountValue}% OFF` 
        : `Rs ${deal.discountValue} OFF`;
      
      // Extract image URL from various formats
      const imageUrl = getImageUrl(
        deal.image,
        getImageUrl(deal.menuItems?.[0]?.images?.[0], 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1080')
      );
      
      return {
        id: deal._id,
        title: deal.title || deal.business?.businessName || 'Special Deal',
        discount: discountText,
        image: imageUrl,
        type: deal.type || 'deal',
        businessName: deal.business?.businessName,
        description: deal.description,
        endsAt: deal.endDate,
      };
    });
  }, [dealsData]);

  const {
    data: tripsData,
    isLoading: completedTripsLoading,
  } = useGetCompletedTripsQuery(
    { limit: 20 },
    { pollingInterval: 20000, refetchOnFocus: true, refetchOnReconnect: true }
  );

  const completedTrips = React.useMemo(() => {
    const trips = tripsData?.trips || [];
    return trips.map((trip) => {
      let imageUrl = 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1080';
      if (trip.coverImage) {
        if (typeof trip.coverImage === 'string') {
          imageUrl = trip.coverImage;
        } else if (trip.coverImage?.url) {
          imageUrl = trip.coverImage.url;
        }
      }

      return {
        id: trip._id,
        title: trip.title || trip.destination?.name || 'Completed Trip',
        location: [trip.destination?.city, trip.destination?.country].filter(Boolean).join(', ') || trip.destination?.name || 'Unknown location',
        image: imageUrl,
        rating: 4.8,
        reviews: 0,
        budget: `${trip.currency || 'PKR'} ${Number(trip.totalBudget || 0).toLocaleString()}`,
        duration: `${trip.durationDays || 1} day${(trip.durationDays || 1) > 1 ? 's' : ''}`,
      };
    });
  }, [tripsData]);

  const hiddenGems = React.useMemo(() => {
    return (nearbyBusinessesData?.businesses || [])
      .map((business) => {
        const coordinates = getBusinessCoordinates(business);
        return {
          id: business._id,
          name: business.businessName,
          rating: business.rating || 0,
          distance: business.distanceKm != null ? `${business.distanceKm} km` : 'Nearby',
          category: business.businessType || 'Place',
          image: getImageUrl(business.logo, getImageUrl(business.galleryImages?.[0], 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080')),
          lat: coordinates.lat,
          lng: coordinates.lng,
        };
      })
      .filter((gem) => gem.lat != null && gem.lng != null)
      .slice(0, 3);
  }, [nearbyBusinessesData]);

  const rewardProgress = rewardsData?.nextReward?.progress || 0;
  const reviewsNeeded = rewardsData?.nextReward?.reviewsNeeded ?? 0;
  const reviewsForNextReward = 5;
  const reviewsDone = isAuthenticated ? Math.max(0, reviewsForNextReward - reviewsNeeded) : 0;
  const rewardRequirement = rewardsData?.nextReward?.requirement || 'Write reviews to unlock rewards';

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <ScrollView className="flex-1" style={{ backgroundColor: colors.background }}>
        {/* Header with Greeting */}
        <View style={{ backgroundColor: colors.background, borderBottomColor: colors.border }} className="border-b pb-4">
          <View className="flex-row items-center justify-between px-4 pt-4">
            {/* Greeting Section */}
            <View className="flex-1">
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                {getGreeting()}
              </Text>
              <Text style={{ color: colors.text }} className="text-2xl font-bold mt-1">
                {user?.fullName?.split(' ')[0] || 'Explorer'}
              </Text>
            </View>
            
            {/* Theme Toggle Icon */}
            <TouchableOpacity 
              onPress={handleToggleTheme}
              className="w-11 h-11 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
            >
              {isDarkMode ? (
                <Sun size={22} color="#FCD34D" strokeWidth={2} />
              ) : (
                <Moon size={22} color="#6B7280" strokeWidth={2} />
              )}
            </TouchableOpacity>
            
            {/* Profile Avatar */}
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="w-12 h-12 rounded-full items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: user?.profilePhoto ? 'transparent' : '#3B82F6',
                borderWidth: user?.profilePhoto ? 2 : 0,
                borderColor: '#3B82F6'
              }}
            >
              {user?.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      {/* Main Content */}
      <View style={{ backgroundColor: colors.background }}>
        {/* Experiences Section */}
        <View className="py-4 px-4">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">Experiences</Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm">Completed trips</Text>
            </View>
            <TouchableOpacity 
              className="flex-row items-center gap-1"
              onPress={() => router.push('/screens/experiences-screen')}
            >
              <Text className="text-blue-600 text-sm">See all</Text>
              <ChevronRight size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Horizontal Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="pb-4"
            contentContainerStyle={{ gap: 16 }}
          >
            {completedTripsLoading && completedTrips.length === 0 ? (
              <View style={{ width: width * 0.75, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : completedTrips.length === 0 ? (
              <View style={{ width: width * 0.75 }}>
                <WanderCard className="p-4">
                  <Text style={{ color: colors.text }} className="text-base font-semibold mb-1">No completed trips yet</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">Complete a trip and it will appear here.</Text>
                </WanderCard>
              </View>
            ) : completedTrips.map((exp) => (
              <TouchableOpacity 
                key={exp.id} 
                style={{ width: width * 0.75 }}
                onPress={() => router.push({
                  pathname: '/screens/experience-detail-screen',
                  params: { tripId: exp.id }
                })}
                activeOpacity={0.9}
              >
                <WanderCard padding="none" className="overflow-hidden" hover>
                  <View className="relative h-48">
                    <ImageWithFallback
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3">
                      <WanderChip variant="primary" size="sm">
                        ⭐ {exp.rating}
                      </WanderChip>
                    </View>
                  </View>
                  <View className="p-4" style={{ backgroundColor: colors.card }}>
                    <Text style={{ color: colors.text }} className="text-lg font-bold mb-1">{exp.title}</Text>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary }} className="text-sm">{exp.location}</Text>
                    </View>
                    <Text style={{ color: colors.textTertiary }} className="text-xs mt-2">
                      {exp.duration} • {exp.budget}
                    </Text>
                  </View>
                </WanderCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Deals & Sponsored Ads */}
        <View className="py-4 px-4" style={{ backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Tag size={20} color="#10B981" />
              <Text style={{ color: colors.text }} className="text-xl font-bold">Deals & Offers</Text>
            </View>
            {dealsLoading && <ActivityIndicator size="small" color="#10B981" />}
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {!dealsLoading && deals.length === 0 ? (
              <View style={{ width: width * 0.75 }}>
                <WanderCard className="p-4">
                  <Text style={{ color: colors.text }} className="text-base font-semibold mb-1">No deals right now</Text>
                  <Text style={{ color: colors.textSecondary }} className="text-sm">Active business deals will appear here.</Text>
                </WanderCard>
              </View>
            ) : deals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={{ width: width * 0.75 }}
                activeOpacity={0.9}
                onPress={() => router.push({
                  pathname: '/screens/deal-detail-screen',
                  params: { dealId: deal.id },
                })}
              >
                <WanderCard padding="none" className="overflow-hidden" hover>
                  <View className="flex-row items-center gap-3 p-3">
                    <View className="w-20 h-20 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <WanderChip variant="accent" size="sm" className="mb-2 self-start">
                        {deal.discount}
                      </WanderChip>
                      <Text style={{ color: colors.text }} className="text-base font-bold" numberOfLines={1}>
                        {deal.title}
                      </Text>
                      <Text style={{ color: colors.textSecondary }} className="text-xs capitalize">
                        {deal.businessName || deal.type}
                      </Text>
                      {deal.endsAt ? (
                        <Text style={{ color: colors.textTertiary }} className="text-xs mt-1">
                          Ends {new Date(deal.endsAt).toLocaleDateString()}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </WanderCard>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Budget Plan Card */}
        <View className="py-4 px-4">
          <WanderCard 
            padding="lg"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp size={18} color="#FFFFFF" strokeWidth={2} />
                  <Text className="text-base font-semibold text-white">Quick Budget Plan</Text>
                </View>
                <Text className="text-white text-xs mb-4" style={{ opacity: 0.9 }}>
                  Create a personalized budget for{'\n'}your next trip in seconds
                </Text>
                <TouchableOpacity 
                  className="bg-white rounded-full px-5 py-2.5 self-start"
                  activeOpacity={0.8}
                  onPress={() => router.push('./trips')}
                >
                  <Text style={{ color: '#3B82F6' }} className="text-sm font-semibold">Generate Plan</Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="items-center justify-center ml-3">
                <TrendingUp size={28} color="#FFFFFF" strokeWidth={1.8} />
              </View>
            </View>
          </WanderCard>
        </View>

        {/* Hidden Gems */}
        <View className="py-4 px-4">
          <View className="mb-4">
            <Text style={{ color: colors.text }} className="text-2xl font-bold mb-1">Hidden Gems</Text>
            <Text style={{ color: colors.textSecondary }} className="text-sm">Local spots nearby</Text>
          </View>

          <View className="gap-3">
            {hiddenGemsLoading && hiddenGems.length === 0 ? (
              <WanderCard>
                <ActivityIndicator size="small" color="#3B82F6" />
              </WanderCard>
            ) : hiddenGems.length === 0 ? (
              <WanderCard>
                <Text style={{ color: colors.text }} className="text-base font-semibold mb-1">No nearby gems yet</Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  Enable location to see registered businesses near you.
                </Text>
              </WanderCard>
            ) : hiddenGems.map((gem) => (
              <TouchableOpacity
                key={gem.id}
                activeOpacity={0.9}
                onPress={() => router.push({
                  pathname: '/(tabs)/maps',
                  params: {
                    focusPlaceId: gem.id,
                    focusLat: gem.lat,
                    focusLng: gem.lng,
                    focusName: gem.name,
                  },
                })}
              >
                <WanderCard padding="none" className="overflow-hidden" hover>
                  <View className="flex-row items-center gap-3 p-3">
                    <View className="w-16 h-16 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={gem.image}
                        alt={gem.name}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="text-base font-bold mb-1">{gem.name}</Text>
                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                          <Star size={12} fill="#10B981" color="#10B981" />
                          <Text style={{ color: colors.textSecondary }} className="text-xs">{gem.rating}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <Navigation size={12} color={colors.textSecondary} />
                          <Text style={{ color: colors.textSecondary }} className="text-xs">{gem.distance}</Text>
                        </View>
                      </View>
                      <WanderChip variant="secondary" size="sm" className="mt-2 self-start">
                        {gem.category}
                      </WanderChip>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>
                </WanderCard>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gamification Progress */}
        <View className="py-4 px-4 mb-4">
          <WanderCard className="bg-green-50">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center">
                <Award size={24} color="#10B981" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: colors.text }} className="text-base font-bold">Earn Rewards</Text>
                  <Text className="text-sm text-green-600">
                    {rewardsLoading ? '...' : `${reviewsDone}/${reviewsForNextReward}`}
                  </Text>
                </View>
                <Progress value={rewardProgress} className="h-2 mb-2" />
                <Text style={{ color: colors.textSecondary }} className="text-xs">
                  {isAuthenticated ? rewardRequirement : 'Sign in to track your rewards'}
                </Text>
              </View>
            </View>
          </WanderCard>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
