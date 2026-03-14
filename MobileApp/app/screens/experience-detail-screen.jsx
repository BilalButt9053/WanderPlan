import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Heart,
  MapPin,
  Plus,
  Share2,
  Star,
  X,
} from 'lucide-react-native';
import { useSelector } from 'react-redux';
import ImageWithFallback from '../components/ImageWithFallback';
import WanderCard from '../components/wander-card';
import WanderChip from '../components/wander-chip';
import { WanderButton } from '../components/wander-button';
import { useGetBusinessDetailQuery } from '../../redux/api/businessItemsApi';
import { useGetTripsQuery, useAddActivityToTripMutation, useGetTripQuery } from '../../redux/api/tripsApi';
import { useGetReviewsQuery } from '../../redux/api/reviewsApi';
import { useGetItineraryQuery } from '../../redux/api/itineraryApi';
import { selectIsAuthenticated } from '../../redux/slices/authSlice';

const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const getImageList = (business) => {
  if (!business) return [];
  const gallery = (business.galleryImages || []).map((img) => (typeof img === 'string' ? img : img?.url));
  return [business.logo, ...gallery].filter(Boolean);
};

const extractTripUsage = (trips, businessId) => {
  if (!trips?.length || !businessId) return [];

  return trips
    .map((trip) => {
      const days = trip.itinerary?.days || [];
      const matches = [];

      days.forEach((day) => {
        (day.activities || []).forEach((activity) => {
          if (String(activity.businessId) === String(businessId)) {
            matches.push({
              day: day.day,
              title: activity.title || 'Activity',
              estimatedCost: Number(activity.estimatedCost || 0),
            });
          }
        });
      });

      if (!matches.length) return null;

      return {
        tripId: trip._id,
        title: trip.title || trip.destination?.name || 'Untitled Trip',
        durationDays: trip.durationDays || 1,
        matches,
      };
    })
    .filter(Boolean);
};

export default function ExperienceDetailScreen() {
  const router = useRouter();
  const { experienceId, tripId } = useLocalSearchParams();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const validExperienceId = isObjectId(experienceId);
  const validTripId = isObjectId(tripId);
  const isTripMode = validTripId;

  const {
    data: businessData,
    isLoading: businessLoading,
    error: businessError,
  } = useGetBusinessDetailQuery(experienceId, { skip: !validExperienceId || isTripMode });

  const {
    data: tripDetailData,
    isLoading: tripLoading,
    error: tripError,
  } = useGetTripQuery(tripId, { skip: !isAuthenticated || !validTripId });

  const {
    data: itineraryData,
    isLoading: itineraryLoading,
  } = useGetItineraryQuery(tripId, { skip: !isAuthenticated || !validTripId });

  const {
    data: tripsData,
    isLoading: tripsLoading,
    refetch: refetchTrips,
  } = useGetTripsQuery({ includeItinerary: true }, { skip: !isAuthenticated });

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useGetReviewsQuery({ category: 'all', limit: 20 });

  const [addActivityToTrip, { isLoading: isAddingToTrip }] = useAddActivityToTripMutation();

  const business = businessData?.business;
  const trip = tripDetailData?.trip;
  const itineraryDays = itineraryData?.itinerary?.days || [];
  const images = useMemo(() => getImageList(business), [business]);

  const tripImage = useMemo(() => {
    if (!trip) return null;
    if (typeof trip.coverImage === 'string') return trip.coverImage;
    if (trip.coverImage?.url) return trip.coverImage.url;
    return null;
  }, [trip]);

  const activeTrips = useMemo(() => {
    const allTrips = tripsData?.trips || [];
    return allTrips.filter((trip) => !['cancelled', 'completed'].includes(trip.status));
  }, [tripsData]);

  const usedInTrips = useMemo(() => {
    return extractTripUsage(tripsData?.trips || [], business?._id);
  }, [tripsData, business?._id]);

  const reviewsForBusiness = useMemo(() => {
    const items = reviewsData?.items || [];
    if (!business?.businessName) return [];

    const keyword = business.businessName.toLowerCase();
    return items.filter((review) => String(review.place || '').toLowerCase().includes(keyword)).slice(0, 4);
  }, [reviewsData, business?.businessName]);

  const locationText = [
    business?.address?.street,
    business?.address?.city,
    business?.address?.state,
    business?.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const handleShare = async () => {
    if (!business) return;
    try {
      await Share.share({
        title: business.businessName,
        message: `Check out ${business.businessName} on WanderPlan${locationText ? `\n${locationText}` : ''}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleAddToTrip = async (tripId) => {
    if (!business?._id) return;

    try {
      await addActivityToTrip({
        tripId,
        businessId: business._id,
        title: business.businessName,
        estimatedCost: 1500,
        source: 'business',
      }).unwrap();

      setShowTripSelector(false);
      Alert.alert('Success', 'Experience added to trip itinerary');
      refetchTrips();
    } catch (error) {
      Alert.alert('Error', error?.data?.message || 'Failed to add activity to trip');
    }
  };

  if (!validExperienceId && !validTripId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Invalid Experience</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">This experience link is invalid.</Text>
        <WanderButton onPress={() => router.back()}>Go Back</WanderButton>
      </SafeAreaView>
    );
  }

  if (isTripMode) {
    if (tripLoading) {
      return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-3">Loading trip details...</Text>
        </SafeAreaView>
      );
    }

    if (tripError || !trip) {
      return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Trip Not Found</Text>
          <Text className="text-sm text-gray-500 text-center mb-6">Could not load this trip detail.</Text>
          <WanderButton onPress={() => router.back()}>Go Back</WanderButton>
        </SafeAreaView>
      );
    }

    const tripLocation = [trip.destination?.name, trip.destination?.city, trip.destination?.country]
      .filter(Boolean)
      .join(', ');

    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1">
          <View className="relative">
            <ImageWithFallback
              src={tripImage}
              style={{ width: '100%', height: 260 }}
              resizeMode="cover"
            />
            <View className="absolute top-0 left-0 right-0 p-4">
              <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
                <ChevronLeft size={22} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 pt-5 pb-8">
            <Text className="text-2xl font-bold text-gray-900">{trip.title || 'Trip Details'}</Text>
            <View className="flex-row items-center mt-2">
              <MapPin size={14} color="#6B7280" />
              <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>{tripLocation || 'Unknown location'}</Text>
            </View>

            <View className="mt-4" style={{ gap: 10 }}>
              <WanderCard>
                <Text className="text-sm text-gray-600">Budget: PKR {trip.totalBudget || 0}</Text>
                <Text className="text-sm text-gray-600 mt-1">Remaining: PKR {trip.remainingBudget ?? ((trip.totalBudget || 0) - (trip.totalSpent || 0))}</Text>
                <Text className="text-sm text-gray-600 mt-1">Activities: {itineraryDays.reduce((sum, day) => sum + ((day.activities || []).length), 0)}</Text>
              </WanderCard>
            </View>

            <View className="mt-5">
              <Text className="text-lg font-bold text-gray-900 mb-2">Itinerary</Text>
              {itineraryLoading ? (
                <WanderCard>
                  <ActivityIndicator size="small" color="#3B82F6" />
                </WanderCard>
              ) : itineraryDays.length === 0 ? (
                <WanderCard>
                  <Text className="text-sm text-gray-500">No itinerary available for this trip.</Text>
                </WanderCard>
              ) : (
                <View style={{ gap: 10 }}>
                  {itineraryDays.map((day) => (
                    <WanderCard key={`day-${day.day}`}>
                      <Text className="text-base font-semibold text-gray-900">Day {day.day}</Text>
                      <View style={{ gap: 4, marginTop: 8 }}>
                        {(day.activities || []).map((activity, index) => (
                          <Text key={`a-${day.day}-${index}`} className="text-sm text-gray-600">
                            • {activity.title || 'Activity'} {activity.estimatedCost ? `• PKR ${activity.estimatedCost}` : ''}
                          </Text>
                        ))}
                      </View>
                    </WanderCard>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (businessLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-3">Loading experience...</Text>
      </SafeAreaView>
    );
  }

  if (businessError || !business) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-lg font-semibold text-gray-800 mb-2">Experience Not Found</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">Could not load this business detail.</Text>
        <WanderButton onPress={() => router.back()}>Go Back</WanderButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="relative">
          <ImageWithFallback
            src={images[selectedImageIndex]}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
          />

          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between p-4">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
              <ChevronLeft size={22} color="#111827" />
            </TouchableOpacity>
            <View className="flex-row" style={{ gap: 8 }}>
              <TouchableOpacity onPress={() => setIsFavorite((v) => !v)} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
                <Heart size={18} color={isFavorite ? '#EF4444' : '#6B7280'} fill={isFavorite ? '#EF4444' : 'transparent'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
                <Share2 size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {images.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center" style={{ gap: 6 }}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={{
                    width: selectedImageIndex === index ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    backgroundColor: selectedImageIndex === index ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  }}
                />
              ))}
            </View>
          )}
        </View>

        <View className="px-4 pt-5 pb-8">
          <View className="mb-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-2xl font-bold text-gray-900">{business.businessName}</Text>
                {locationText ? (
                  <View className="flex-row items-center mt-2">
                    <MapPin size={14} color="#6B7280" />
                    <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>{locationText}</Text>
                  </View>
                ) : null}
              </View>
              <WanderChip variant="secondary" size="sm">{business.businessType || 'other'}</WanderChip>
            </View>

            <View className="flex-row items-center mt-3">
              <Star size={15} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-sm font-semibold text-gray-800 ml-1">
                {business.rating ? Number(business.rating).toFixed(1) : 'New'}
              </Text>
              <Text className="text-sm text-gray-500 ml-2">({business.reviewCount || 0} reviews)</Text>
            </View>
          </View>

          {business.description ? (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-900 mb-2">Description</Text>
              <Text className="text-sm text-gray-600 leading-6">{business.description}</Text>
            </View>
          ) : null}

          {locationText ? (
            <View className="mb-5">
              <Text className="text-lg font-bold text-gray-900 mb-2">Location</Text>
              <WanderCard>
                <View className="flex-row items-start">
                  <MapPin size={18} color="#3B82F6" />
                  <Text className="text-sm text-gray-700 ml-2 flex-1">{locationText}</Text>
                </View>
              </WanderCard>
            </View>
          ) : null}

          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-gray-900">Used in Your Trips</Text>
              {tripsLoading ? <ActivityIndicator size="small" color="#3B82F6" /> : null}
            </View>

            {usedInTrips.length === 0 ? (
              <WanderCard>
                <Text className="text-sm text-gray-500">This experience is not used in any trip yet.</Text>
              </WanderCard>
            ) : (
              <View style={{ gap: 10 }}>
                {usedInTrips.map((entry) => (
                  <WanderCard key={entry.tripId}>
                    <Text className="text-base font-semibold text-gray-900">{entry.title} ({entry.durationDays} days)</Text>
                    <View style={{ gap: 4, marginTop: 8 }}>
                      {entry.matches.map((m, idx) => (
                        <Text key={`${entry.tripId}-${idx}`} className="text-sm text-gray-600">
                          Day {m.day} - {m.title} {m.estimatedCost ? `• PKR ${m.estimatedCost}` : ''}
                        </Text>
                      ))}
                    </View>
                  </WanderCard>
                ))}
              </View>
            )}
          </View>

          <View>
            <Text className="text-lg font-bold text-gray-900 mb-2">Reviews</Text>
            {reviewsLoading ? (
              <WanderCard>
                <ActivityIndicator size="small" color="#3B82F6" />
              </WanderCard>
            ) : reviewsForBusiness.length === 0 ? (
              <WanderCard>
                <Text className="text-sm text-gray-500">No direct reviews found for this place yet.</Text>
              </WanderCard>
            ) : (
              <View style={{ gap: 10 }}>
                {reviewsForBusiness.map((review) => (
                  <WanderCard key={review._id}>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-sm font-semibold text-gray-800">{review.user?.name || 'Anonymous'}</Text>
                      <View className="flex-row items-center">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-xs text-gray-600 ml-1">{review.rating}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600" numberOfLines={3}>{review.text}</Text>
                  </WanderCard>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="px-4 py-4 border-t border-gray-200 bg-white">
        <TouchableOpacity
          onPress={() => {
            if (!isAuthenticated) {
              Alert.alert('Login Required', 'Please sign in to add this experience to a trip.');
              return;
            }
            setShowTripSelector(true);
          }}
          className="bg-blue-600 rounded-2xl py-4 items-center justify-center flex-row"
          style={{ gap: 8 }}
          disabled={isAddingToTrip}
        >
          <Plus size={18} color="#fff" />
          <Text className="text-white font-semibold text-base">
            {isAddingToTrip ? 'Adding...' : 'Add to Trip'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showTripSelector} transparent animationType="slide" onRequestClose={() => setShowTripSelector(false)}>
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <View className="bg-white rounded-t-3xl px-4 pt-4 pb-8" style={{ maxHeight: '70%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Select Trip</Text>
              <TouchableOpacity onPress={() => setShowTripSelector(false)} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                <X size={16} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {activeTrips.length === 0 ? (
                <Text className="text-sm text-gray-500">No active trips available.</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {activeTrips.map((trip) => (
                    <TouchableOpacity
                      key={trip._id}
                      onPress={() => handleAddToTrip(trip._id)}
                      className="border border-gray-200 rounded-xl p-3"
                      disabled={isAddingToTrip}
                    >
                      <Text className="text-base font-semibold text-gray-900">{trip.title || trip.destination?.name}</Text>
                      <Text className="text-sm text-gray-500 mt-1">{trip.destination?.name || 'Unknown destination'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
