/**
 * Trip Map Screen - Display trip itinerary on map
 *
 * Features:
 * - MapView with activity markers
 * - Day selector pills
 * - Polyline route between activities
 * - Selected activity bottom sheet
 * - Explore nearby places
 * - Transport cost display
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  ArrowLeft,
  Navigation,
  X,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Compass,
  Car,
  ChevronDown,
  Search,
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { useTheme } from '../../hooks/useTheme';
import { useLazyGetNearbyPlacesQuery } from '../../redux/api/placesApi';
import {
  calculateDayTransportCost,
  formatDistance,
  formatCurrency,
  getEstimatedTravelTime,
} from '../../utils/distance';

// Activity type colors
const activityColors = {
  hotel: '#2563EB',
  food: '#059669',
  attraction: '#DC2626',
  transport: '#7C3AED',
  shopping: '#F59E0B',
  entertainment: '#EC4899',
  other: '#6B7280',
};

const TripMapScreen = ({
  trip,
  itinerary,
  onBack,
  onExploreNearby,
  onAddPlace,
}) => {
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showNearbySheet, setShowNearbySheet] = useState(false);
  const [mapRegion, setMapRegion] = useState(null);

  // RTK Query for nearby places
  const [triggerNearbyPlaces, { data: nearbyData, isLoading: nearbyLoading }] =
    useLazyGetNearbyPlacesQuery();

  // Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Location error:', error);
      }
    })();
  }, []);

  // Get activities for selected day
  const dayActivities = useMemo(() => {
    if (!itinerary?.days) return [];
    const day = itinerary.days.find((d) => d.day === selectedDay);
    return day?.activities || [];
  }, [itinerary, selectedDay]);

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
    return dayActivities.filter(
      (a) =>
        a.location?.coordinates?.lat != null &&
        a.location?.coordinates?.lng != null
    );
  }, [dayActivities]);

  // Calculate transport cost for selected day
  const transportCost = useMemo(() => {
    return calculateDayTransportCost(dayActivities, userLocation);
  }, [dayActivities, userLocation]);

  // Generate route coordinates for polyline
  const routeCoordinates = useMemo(() => {
    return activitiesWithCoords.map((a) => ({
      latitude: a.location.coordinates.lat,
      longitude: a.location.coordinates.lng,
    }));
  }, [activitiesWithCoords]);

  // Calculate initial map region
  const initialRegion = useMemo(() => {
    if (activitiesWithCoords.length > 0) {
      const lats = activitiesWithCoords.map((a) => a.location.coordinates.lat);
      const lngs = activitiesWithCoords.map((a) => a.location.coordinates.lng);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      const latDelta = Math.max(Math.max(...lats) - Math.min(...lats), 0.02) * 1.5;
      const lngDelta = Math.max(Math.max(...lngs) - Math.min(...lngs), 0.02) * 1.5;
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };
    }
    // Fallback to destination or Islamabad
    if (itinerary?.destination?.coordinates?.lat) {
      return {
        latitude: itinerary.destination.coordinates.lat,
        longitude: itinerary.destination.coordinates.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return {
      latitude: userLocation?.lat || 33.6844,
      longitude: userLocation?.lng || 73.0479,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }, [activitiesWithCoords, itinerary, userLocation]);

  // Handle navigation to place
  const handleNavigate = (activity) => {
    const { lat, lng } = activity.location?.coordinates || {};
    if (lat && lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${lat},${lng}(${encodeURIComponent(activity.title)})`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(activity.title)})`,
      });
      Linking.openURL(url).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        );
      });
    } else {
      Alert.alert('Navigation', 'Location coordinates not available');
    }
  };

  // Explore nearby places
  const handleExploreNearby = async () => {
    const center =
      selectedActivity?.location?.coordinates ||
      (activitiesWithCoords.length > 0
        ? activitiesWithCoords[0].location.coordinates
        : userLocation);

    if (!center?.lat || !center?.lng) {
      Alert.alert('Location Required', 'Please enable location or select an activity');
      return;
    }

    setShowNearbySheet(true);
    triggerNearbyPlaces({ lat: center.lat, lng: center.lng, radius: 3000 });
  };

  // Get marker color based on activity type
  const getMarkerColor = (type) => activityColors[type] || activityColors.other;

  // Render day selector pills
  const renderDaySelector = () => {
    if (!itinerary?.days?.length) return null;

    return (
      <View className="absolute top-4 left-0 right-0 px-4 z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {itinerary.days.map((day) => {
              const isSelected = day.day === selectedDay;
              const hasCoords = day.activities?.some(
                (a) => a.location?.coordinates?.lat
              );
              return (
                <TouchableOpacity
                  key={day.day}
                  onPress={() => setSelectedDay(day.day)}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: isSelected ? '#3B82F6' : 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                    opacity: hasCoords ? 1 : 0.5,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? 'white' : colors.text,
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    Day {day.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render transport cost card
  const renderTransportCard = () => {
    if (activitiesWithCoords.length < 2) return null;

    return (
      <View className="absolute bottom-28 left-4 right-4 z-10">
        <WanderCard padding="sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#EEF2FF' }}
              >
                <Car size={16} color="#3B82F6" />
              </View>
              <View>
                <Text
                  style={{ fontSize: 12, color: colors.textSecondary }}
                >
                  Day {selectedDay} Transport
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                  {formatDistance(transportCost.totalDistance)}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                {formatCurrency(transportCost.totalCost)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                ~{getEstimatedTravelTime(transportCost.totalDistance)}
              </Text>
            </View>
          </View>
        </WanderCard>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (activitiesWithCoords.length > 0) return null;

    return (
      <View className="absolute inset-0 items-center justify-center z-10 px-8">
        <View
          className="p-6 rounded-2xl items-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
        >
          <MapPin size={48} color="#9CA3AF" />
          <Text
            className="text-lg font-semibold mt-4 text-center"
            style={{ color: colors.text }}
          >
            No locations for Day {selectedDay}
          </Text>
          <Text
            className="text-sm mt-2 text-center"
            style={{ color: colors.textSecondary }}
          >
            Activities without coordinates won't appear on the map. Explore nearby
            places to add locations.
          </Text>
          <WanderButton onPress={handleExploreNearby} className="mt-4">
            <View className="flex-row items-center gap-2">
              <Compass size={16} color="white" />
              <Text className="text-white font-semibold">Explore Nearby</Text>
            </View>
          </WanderButton>
        </View>
      </View>
    );
  };

  // Selected Activity Bottom Sheet
  const renderActivitySheet = () => (
    <Modal
      visible={selectedActivity !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedActivity(null)}
    >
      <TouchableOpacity
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        activeOpacity={1}
        onPress={() => setSelectedActivity(null)}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-t-3xl px-4 pb-8 pt-4"
            style={{ backgroundColor: colors.card }}
          >
            {selectedActivity && (
              <View>
                <TouchableOpacity
                  onPress={() => setSelectedActivity(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 items-center justify-center z-10"
                >
                  <X size={16} color="#000" />
                </TouchableOpacity>

                <View className="flex-row gap-3">
                  <View
                    className="w-16 h-16 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor:
                        getMarkerColor(selectedActivity.type) + '20',
                    }}
                  >
                    <MapPin
                      size={24}
                      color={getMarkerColor(selectedActivity.type)}
                    />
                  </View>

                  <View className="flex-1 pr-8">
                    <Text
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {selectedActivity.title}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-2">
                      {selectedActivity.time && (
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color={colors.textSecondary} />
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {selectedActivity.time}
                          </Text>
                        </View>
                      )}
                      {selectedActivity.estimatedCost > 0 && (
                        <View className="flex-row items-center gap-1">
                          <DollarSign size={12} color={colors.textSecondary} />
                          <Text
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            PKR {selectedActivity.estimatedCost.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                    {selectedActivity.location?.address && (
                      <Text
                        className="text-sm mb-3"
                        style={{ color: colors.textSecondary }}
                        numberOfLines={2}
                      >
                        {selectedActivity.location.address}
                      </Text>
                    )}

                    <View className="flex-row gap-2">
                      <WanderButton
                        onPress={() => handleNavigate(selectedActivity)}
                        style={{ flex: 1 }}
                      >
                        <View className="flex-row items-center gap-2">
                          <Navigation size={16} color="#fff" />
                          <Text className="text-white font-semibold">
                            Navigate
                          </Text>
                        </View>
                      </WanderButton>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  // Nearby Places Bottom Sheet
  const renderNearbySheet = () => (
    <Modal
      visible={showNearbySheet}
      transparent
      animationType="slide"
      onRequestClose={() => setShowNearbySheet(false)}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
        <View
          className="h-3/4 rounded-t-3xl"
          style={{ backgroundColor: colors.card }}
        >
          <View className="p-4 border-b" style={{ borderColor: colors.border }}>
            <View className="flex-row items-center justify-between">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                Nearby Places
              </Text>
              <TouchableOpacity
                onPress={() => setShowNearbySheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {nearbyLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text
                  className="mt-4"
                  style={{ color: colors.textSecondary }}
                >
                  Finding nearby places...
                </Text>
              </View>
            ) : nearbyData?.places?.length > 0 ? (
              nearbyData.places.map((place, idx) => (
                <TouchableOpacity
                  key={place.placeId}
                  className="mb-3"
                  onPress={() => {
                    setShowNearbySheet(false);
                    if (onAddPlace) {
                      onAddPlace(place, selectedDay);
                    }
                  }}
                >
                  <WanderCard padding="sm">
                    <View className="flex-row gap-3">
                      {place.photo ? (
                        <ImageWithFallback
                          source={{ uri: place.photo }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          className="w-15 h-15 rounded-lg items-center justify-center"
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor:
                              activityColors[place.category] + '20',
                          }}
                        >
                          <MapPin
                            size={20}
                            color={activityColors[place.category] || '#6B7280'}
                          />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text
                          className="font-semibold"
                          style={{ color: colors.text }}
                          numberOfLines={1}
                        >
                          {place.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mt-1">
                          {place.rating > 0 && (
                            <View className="flex-row items-center gap-1">
                              <Star size={10} color="#F59E0B" fill="#F59E0B" />
                              <Text
                                className="text-xs"
                                style={{ color: colors.textSecondary }}
                              >
                                {place.rating.toFixed(1)}
                              </Text>
                            </View>
                          )}
                          <Text
                            className="text-xs"
                            style={{ color: colors.textSecondary }}
                            numberOfLines={1}
                          >
                            {place.address}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </WanderCard>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center py-8">
                <MapPin size={48} color="#9CA3AF" />
                <Text
                  className="mt-4 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No places found nearby
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.input }}
        >
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text }}
            numberOfLines={1}
          >
            {trip?.title || 'Trip Map'}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {itinerary?.destination?.name || trip?.destination?.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleExploreNearby}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: '#EEF2FF' }}
        >
          <Search size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View className="flex-1 relative">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={false}
          initialRegion={initialRegion}
          region={mapRegion || initialRegion}
          onRegionChangeComplete={setMapRegion}
        >
          {/* Polyline connecting activities */}
          {routeCoordinates.length >= 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#3B82F6"
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}

          {/* Activity markers */}
          {activitiesWithCoords.map((activity, index) => (
            <Marker
              key={activity._id || index}
              coordinate={{
                latitude: activity.location.coordinates.lat,
                longitude: activity.location.coordinates.lng,
              }}
              title={activity.title}
              description={activity.location?.address || ''}
              onPress={() => setSelectedActivity(activity)}
              pinColor={getMarkerColor(activity.type)}
            />
          ))}
        </MapView>

        {/* Day selector */}
        {renderDaySelector()}

        {/* Empty state */}
        {renderEmptyState()}

        {/* Transport cost card */}
        {renderTransportCard()}

        {/* Explore nearby button */}
        <TouchableOpacity
          onPress={handleExploreNearby}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full items-center justify-center z-10"
          style={{
            backgroundColor: '#3B82F6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Compass size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom sheets */}
      {renderActivitySheet()}
      {renderNearbySheet()}
    </View>
  );
};

export default TripMapScreen;
