import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
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
  Search,
  Filter,
  Navigation,
  X,
  MapPin,
  UtensilsCrossed,
  Hotel,
  Gem,
  Star,
  Clock,
  DollarSign,
  Layers,
  Locate,
  Coffee,
  ShoppingBag,
  Car,
  Compass,
  Plus,
  Bike,
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ListItemSkeleton } from '../components/Skeleton';
import { useTheme } from '../../hooks/useTheme';
import { useGetBusinessesQuery, useGetNearbyBusinessesQuery } from '../../redux/api/businessItemsApi';
import { useLazyGetNearbyPlacesQuery } from '../../redux/api/placesApi';
import { useAddFromMapMutation } from '../../redux/api/tripsApi';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectActiveTrip,
  selectActiveTripItinerary,
  selectCurrentDay,
  selectIsTripMode,
  selectTransportMode,
  setCurrentDay,
  setTripMode,
  setTransportMode,
  addActivityToActiveTrip,
  updateActiveTripBudget,
  setActiveTripItinerary,
} from '../../redux/slices/tripsSlice';
import { normalizeItinerary } from '../../utils/tripFlow';
import {
  calculateDayTransportCost,
  calculateDistance,
  calculateTransportCost,
  formatDistance,
  formatCurrency,
  getEstimatedTravelTime,
} from '../../utils/distance';

// Category type mapping for display
const categoryMap = {
  restaurant: { icon: UtensilsCrossed, color: '#27AE60', label: 'Food' },
  cafe: { icon: Coffee, color: '#8B5CF6', label: 'Cafe' },
  hotel: { icon: Hotel, color: '#2F80ED', label: 'Hotels' },
  shopping: { icon: ShoppingBag, color: '#F2994A', label: 'Shopping' },
  attraction: { icon: Gem, color: '#EC4899', label: 'Attractions' },
};

// Activity type colors for trip view
const activityColors = {
  hotel: '#2563EB',
  food: '#059669',
  attraction: '#DC2626',
  transport: '#7C3AED',
  shopping: '#F59E0B',
  entertainment: '#EC4899',
  other: '#6B7280',
};

const Maps = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  const [showNearbySheet, setShowNearbySheet] = useState(false);
  const [showAddToTripSheet, setShowAddToTripSheet] = useState(false);
  const [placeToAdd, setPlaceToAdd] = useState(null);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(['restaurant', 'cafe', 'hotel', 'shopping', 'attraction']));
  const [mapRegion, setMapRegion] = useState(null);
  const [isAddingPlace, setIsAddingPlace] = useState(false);

  const { activeTrip, rawItinerary, selectedDay, transportMode, isTripMode } = useSelector((state) => ({
    activeTrip: selectActiveTrip(state),
    rawItinerary: selectActiveTripItinerary(state)?.itinerary || state.trips?.activeTrip?.itinerary,
    selectedDay: selectCurrentDay(state),
    transportMode: selectTransportMode(state),
    isTripMode: selectIsTripMode(state),
  }));

  const tripItinerary = useMemo(() => normalizeItinerary(rawItinerary), [rawItinerary]);
  const viewMode = isTripMode && activeTrip ? 'trip' : 'explore';

  // Add from map mutation
  const [addFromMap] = useAddFromMapMutation();

  // Fetch businesses by text (fallback)
  const { data: businessData, isLoading: isLoadingSearch, refetch } = useGetBusinessesQuery({
    search: searchQuery,
    limit: 50,
  });

  // Fetch nearby businesses when we have GPS
  const { data: nearbyData, isLoading: isLoadingNearby } = useGetNearbyBusinessesQuery(
    userLocation
      ? {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radiusKm: 10,
          limit: 50,
        }
      : undefined,
    { skip: !userLocation }
  );

  // RTK Query for nearby places (trip mode)
  const [triggerNearbyPlaces, { data: nearbyPlacesData, isLoading: nearbyPlacesLoading }] =
    useLazyGetNearbyPlacesQuery();

  const isLoading = isLoadingNearby || isLoadingSearch;

  // Get user's location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location access is needed to show nearby places.');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } catch (error) {
        console.log('Location error:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (isTripMode && tripItinerary.length > 0) {
      console.log('Trip:', activeTrip);
      console.log('Itinerary:', tripItinerary);
      console.log('Trip Mode:', isTripMode);
    }
  }, [activeTrip, tripItinerary, isTripMode]);

  // Get activities for selected day (trip mode)
  const dayActivities = useMemo(() => {
    return tripItinerary.filter((item) => Number(item.day) === Number(selectedDay));
  }, [tripItinerary, selectedDay]);

  // Filter activities with valid coordinates
  const activitiesWithCoords = useMemo(() => {
    return dayActivities.filter((a) => a.latitude != null && a.longitude != null);
  }, [dayActivities]);

  // Calculate transport cost for selected day
  const transportCost = useMemo(() => {
    return calculateDayTransportCost(dayActivities, userLocation);
  }, [dayActivities, userLocation]);

  // Generate route coordinates for polyline
  const routeCoordinates = useMemo(() => {
    return activitiesWithCoords.map((a) => ({
      latitude: Number(a.latitude),
      longitude: Number(a.longitude),
    }));
  }, [activitiesWithCoords]);

  // Calculate trip map region
  const tripRegion = useMemo(() => {
    if (activitiesWithCoords.length > 0) {
      const lats = activitiesWithCoords.map((a) => Number(a.latitude));
      const lngs = activitiesWithCoords.map((a) => Number(a.longitude));
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
    if (activeTrip?.destination?.coordinates?.lat) {
      return {
        latitude: activeTrip.destination.coordinates.lat,
        longitude: activeTrip.destination.coordinates.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return null;
  }, [activitiesWithCoords, activeTrip]);

  // Transform API data to map format
  const mapPlaces = useMemo(() => {
    const businesses = (nearbyData?.businesses?.length ? nearbyData.businesses : businessData?.businesses) || [];
    if (!businesses.length) return [];

    return businesses.map((business) => ({
      id: business._id,
      name: business.businessName,
      type: business.businessType || 'restaurant',
      lat:
        business.address?.coordinates?.lat ??
        (business.geoLocation?.coordinates?.[1] ?? null),
      lng:
        business.address?.coordinates?.lng ??
        (business.geoLocation?.coordinates?.[0] ?? null),
      rating: business.rating || 0,
      reviewCount: business.reviewCount || 0,
      image: business.logo || business.galleryImages?.[0] || null,
      address: `${business.address?.street || ''}, ${business.address?.city || ''}`.trim().replace(/^,\s*/, ''),
      description: business.description,
      distanceKm: business.distanceKm ?? null,
    }));
  }, [businessData, nearbyData]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Add distance to places if user location available
  const placesWithDistance = useMemo(() => {
    return mapPlaces.map(place => ({
      ...place,
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, place.lat, place.lng)
        : null,
    }));
  }, [mapPlaces, userLocation]);

  const toggleFilter = (type) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const filteredPlaces = placesWithDistance.filter(place => activeFilters.has(place.type));
  const nearbyPlaces = [...placesWithDistance]
    .filter(p => p.distance !== null)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 5);

  const getPinColor = (type) => {
    return categoryMap[type]?.color || '#4F4F4F';
  };

  const getIcon = (type) => {
    return categoryMap[type]?.icon || MapPin;
  };

  const getActivityMarkerColor = (type) => activityColors[type] || activityColors.other;

  const handleNavigate = (place) => {
    const lat = place.lat || place.location?.coordinates?.lat;
    const lng = place.lng || place.location?.coordinates?.lng;
    const name = place.name || place.title;

    if (lat && lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${lat},${lng}(${encodeURIComponent(name)})`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`,
      });
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    } else {
      Alert.alert('Navigation', 'Location coordinates not available for this place.');
    }
  };

  const handleLocateMe = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      Alert.alert('Location Updated', 'Map centered on your current location');
    } catch (error) {
      Alert.alert('Error', 'Could not get your location');
    }
  };

  // Explore nearby places (trip mode)
  const handleExploreNearby = async () => {
    const center =
      (selectedActivity?.latitude != null && selectedActivity?.longitude != null
        ? { lat: selectedActivity.latitude, lng: selectedActivity.longitude }
        : null) ||
      (activitiesWithCoords.length > 0
        ? { lat: activitiesWithCoords[0].latitude, lng: activitiesWithCoords[0].longitude }
        : userLocation);

    if (!center?.lat || !center?.lng) {
      Alert.alert('Location Required', 'Please enable location or select an activity');
      return;
    }

    setShowNearbySheet(true);
    triggerNearbyPlaces({ lat: center.lat, lng: center.lng, radius: 3000 });
  };

  // Open add to trip sheet for a place
  const handleOpenAddToTrip = (place) => {
    if (!activeTrip) {
      Alert.alert('No Active Trip', 'Please start a trip first to add places');
      return;
    }
    setPlaceToAdd(place);
    setShowAddToTripSheet(true);
    setShowNearbySheet(false);
  };

  // Calculate transport cost from last activity to new place
  const calculateTransportToPlace = (place) => {
    if (!place?.lat && !place?.coordinates?.lat) return { distance: 0, cost: 0 };

    const placeLat = place.lat || place.coordinates?.lat;
    const placeLng = place.lng || place.coordinates?.lng;

    // Get the last activity with coordinates in the current day
    let fromLocation = userLocation;
    if (activitiesWithCoords.length > 0) {
      const lastActivity = activitiesWithCoords[activitiesWithCoords.length - 1];
      fromLocation = {
        lat: lastActivity.latitude,
        lng: lastActivity.longitude,
      };
    }

    if (!fromLocation?.lat || !placeLat) return { distance: 0, cost: 0 };

    const distance = calculateDistance(fromLocation.lat, fromLocation.lng, placeLat, placeLng);
    const ratePerKm = transportMode === 'bike' ? 20 : 40; // PKR per km
    const cost = calculateTransportCost(distance, ratePerKm);

    return { distance, cost };
  };

  // Add place to trip
  const handleAddPlaceToTrip = async (estimatedCost = 0) => {
    if (!activeTrip || !placeToAdd) return;

    setIsAddingPlace(true);
    try {
      const transport = calculateTransportToPlace(placeToAdd);

      const result = await addFromMap({
        tripId: activeTrip._id,
        placeId: placeToAdd.placeId || placeToAdd.id,
        name: placeToAdd.name,
        type: placeToAdd.type || placeToAdd.category || 'attraction',
        category: placeToAdd.category || 'activities',
        address: placeToAdd.address || placeToAdd.vicinity || '',
        coordinates: {
          lat: placeToAdd.lat || placeToAdd.coordinates?.lat,
          lng: placeToAdd.lng || placeToAdd.coordinates?.lng,
        },
        estimatedCost: Number(estimatedCost) || 0,
        day: selectedDay,
        rating: placeToAdd.rating,
        photo: placeToAdd.photo,
        transportCost: transport.cost,
        transportMode: transportMode,
        distanceKm: transport.distance,
      }).unwrap();

      // Update local Redux state
      if (result.activity) {
        dispatch(addActivityToActiveTrip(result.activity));
      }
      if (result.updatedBudget) {
        dispatch(updateActiveTripBudget({
          category: 'transport',
          amount: transport.cost,
        }));
      }
      if (result.itinerary) {
        dispatch(setActiveTripItinerary({ itinerary: result.itinerary }));
      }

      setShowAddToTripSheet(false);
      setPlaceToAdd(null);
      setEstimatedCost('');
      Alert.alert(
        'Added!',
        `${placeToAdd.name} added to Day ${selectedDay}${transport.cost > 0 ? `\nTransport: ${formatCurrency(transport.cost)}` : ''}`
      );
    } catch (error) {
      console.error('Error adding place:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to add place to trip');
    } finally {
      setIsAddingPlace(false);
    }
  };

  // Handle day change
  const handleDayChange = (day) => {
    dispatch(setCurrentDay(day));
  };

  // Handle transport mode change
  const handleTransportModeChange = (mode) => {
    dispatch(setTransportMode(mode));
  };

  // Get default map region
  const defaultRegion = {
    latitude: userLocation?.lat ?? 33.6844,
    longitude: userLocation?.lng ?? 73.0479,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  // Render mode toggle
  const renderModeToggle = () => {
    if (!activeTrip) return null;

    return (
      <View
        className="absolute top-4 left-4 z-10 flex-row rounded-full overflow-hidden"
        style={{
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        <TouchableOpacity
          onPress={() => dispatch(setTripMode(false))}
          className="px-4 py-2"
          style={{
            backgroundColor: viewMode === 'explore' ? '#3B82F6' : 'white',
          }}
        >
          <Text style={{ color: viewMode === 'explore' ? 'white' : colors.text, fontWeight: '600', fontSize: 13 }}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => dispatch(setTripMode(true))}
          className="px-4 py-2"
          style={{
            backgroundColor: viewMode === 'trip' ? '#3B82F6' : 'white',
          }}
        >
          <Text style={{ color: viewMode === 'trip' ? 'white' : colors.text, fontWeight: '600', fontSize: 13 }}>
            My Trip
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render day selector pills (trip mode)
  const renderDaySelector = () => {
    const availableDays = [...new Set(tripItinerary.map((item) => Number(item.day)).filter((day) => Number.isFinite(day)))].sort((a, b) => a - b);
    if (viewMode !== 'trip' || !availableDays.length) return null;

    return (
      <View className="absolute top-16 left-0 right-0 px-4 z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {availableDays.map((day) => {
              const isSelected = day === selectedDay;
              const hasCoords = tripItinerary.some(
                (item) => Number(item.day) === Number(day) && item.latitude != null && item.longitude != null
              );
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayChange(day)}
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
                    Day {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Render transport cost card (trip mode)
  const renderTransportCard = () => {
    if (viewMode !== 'trip' || activitiesWithCoords.length < 2) return null;

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
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
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

  // Render empty state for trip view
  const renderTripEmptyState = () => {
    if (viewMode !== 'trip' || activitiesWithCoords.length > 0) return null;

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
            Activities without coordinates will not appear on the map. Explore nearby
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

  // Selected Activity Bottom Sheet (trip mode)
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
                      backgroundColor: getActivityMarkerColor(selectedActivity.type) + '20',
                    }}
                  >
                    <MapPin
                      size={24}
                      color={getActivityMarkerColor(selectedActivity.type)}
                    />
                  </View>

                  <View className="flex-1 pr-8">
                    <Text
                      className="text-lg font-semibold mb-1"
                      style={{ color: colors.text }}
                      numberOfLines={1}
                    >
                      {selectedActivity.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mb-2">
                      {selectedActivity.time && (
                        <View className="flex-row items-center gap-1">
                          <Clock size={12} color={colors.textSecondary} />
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            {selectedActivity.time}
                          </Text>
                        </View>
                      )}
                      {Number(selectedActivity.cost) > 0 && (
                        <View className="flex-row items-center gap-1">
                          <DollarSign size={12} color={colors.textSecondary} />
                          <Text className="text-sm" style={{ color: colors.textSecondary }}>
                            PKR {Number(selectedActivity.cost).toLocaleString()}
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
                          <Text className="text-white font-semibold">Navigate</Text>
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

  // Nearby Places Bottom Sheet (trip mode)
  const renderNearbyPlacesSheet = () => (
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
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Nearby Places
              </Text>
              <TouchableOpacity
                onPress={() => setShowNearbySheet(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={16} color="#000" />
              </TouchableOpacity>
            </View>
            {activeTrip && (
              <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                Tap + to add a place to Day {selectedDay}
              </Text>
            )}
          </View>

          <ScrollView className="flex-1 p-4">
            {nearbyPlacesLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4" style={{ color: colors.textSecondary }}>
                  Finding nearby places...
                </Text>
              </View>
            ) : nearbyPlacesData?.places?.length > 0 ? (
              nearbyPlacesData.places.map((place) => (
                <View key={place.placeId} className="mb-3">
                  <WanderCard padding="sm">
                    <View className="flex-row gap-3">
                      {place.photo ? (
                        <ImageWithFallback
                          source={{ uri: place.photo }}
                          style={{ width: 60, height: 60, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          className="w-15 h-15 rounded-lg items-center justify-center"
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: activityColors[place.category] + '20',
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
                              <Text className="text-xs" style={{ color: colors.textSecondary }}>
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
                      {/* Add to Trip Button */}
                      {activeTrip && (
                        <TouchableOpacity
                          onPress={() => handleOpenAddToTrip(place)}
                          className="w-10 h-10 rounded-full items-center justify-center"
                          style={{ backgroundColor: '#3B82F6' }}
                        >
                          <Plus size={20} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </WanderCard>
                </View>
              ))
            ) : (
              <View className="items-center py-8">
                <MapPin size={48} color="#9CA3AF" />
                <Text className="mt-4 text-center" style={{ color: colors.textSecondary }}>
                  No places found nearby
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Add to Trip Bottom Sheet
  const renderAddToTripSheet = () => {
    const transport = placeToAdd ? calculateTransportToPlace(placeToAdd) : { distance: 0, cost: 0 };

    return (
      <Modal
        visible={showAddToTripSheet}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddToTripSheet(false);
          setPlaceToAdd(null);
          setEstimatedCost('');
        }}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => {
            setShowAddToTripSheet(false);
            setPlaceToAdd(null);
            setEstimatedCost('');
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View
              className="rounded-t-3xl px-4 pb-8 pt-4"
              style={{ backgroundColor: colors.card }}
            >
              {placeToAdd && (
                <View>
                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddToTripSheet(false);
                      setPlaceToAdd(null);
                      setEstimatedCost('');
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 items-center justify-center z-10"
                  >
                    <X size={16} color="#000" />
                  </TouchableOpacity>

                  {/* Place Info */}
                  <View className="flex-row gap-3 mb-4">
                    {placeToAdd.photo ? (
                      <ImageWithFallback
                        source={{ uri: placeToAdd.photo }}
                        style={{ width: 70, height: 70, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="rounded-xl items-center justify-center"
                        style={{
                          width: 70,
                          height: 70,
                          backgroundColor: activityColors[placeToAdd.category] + '20',
                        }}
                      >
                        <MapPin
                          size={28}
                          color={activityColors[placeToAdd.category] || '#6B7280'}
                        />
                      </View>
                    )}
                    <View className="flex-1 pr-8">
                      <Text
                        className="text-lg font-bold"
                        style={{ color: colors.text }}
                        numberOfLines={2}
                      >
                        {placeToAdd.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        {placeToAdd.rating > 0 && (
                          <View className="flex-row items-center gap-1">
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text className="text-sm" style={{ color: colors.textSecondary }}>
                              {placeToAdd.rating.toFixed(1)}
                            </Text>
                          </View>
                        )}
                        <Text className="text-sm" style={{ color: '#3B82F6', fontWeight: '600' }}>
                          {placeToAdd.category || placeToAdd.type}
                        </Text>
                      </View>
                      {placeToAdd.address && (
                        <Text
                          className="text-xs mt-1"
                          style={{ color: colors.textSecondary }}
                          numberOfLines={1}
                        >
                          {placeToAdd.address}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Transport Mode Toggle */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      Transport Mode
                    </Text>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => handleTransportModeChange('bike')}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
                        style={{
                          backgroundColor: transportMode === 'bike' ? '#3B82F6' : colors.input,
                        }}
                      >
                        <Bike size={18} color={transportMode === 'bike' ? 'white' : colors.text} />
                        <Text
                          className="font-semibold"
                          style={{ color: transportMode === 'bike' ? 'white' : colors.text }}
                        >
                          Bike (20 PKR/km)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleTransportModeChange('car')}
                        className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl"
                        style={{
                          backgroundColor: transportMode === 'car' ? '#3B82F6' : colors.input,
                        }}
                      >
                        <Car size={18} color={transportMode === 'car' ? 'white' : colors.text} />
                        <Text
                          className="font-semibold"
                          style={{ color: transportMode === 'car' ? 'white' : colors.text }}
                        >
                          Car (40 PKR/km)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Transport Cost Display */}
                  <View
                    className="flex-row items-center justify-between p-3 rounded-xl mb-4"
                    style={{ backgroundColor: '#EEF2FF' }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Navigation size={16} color="#3B82F6" />
                      <Text style={{ color: '#3B82F6', fontWeight: '600' }}>
                        Transport to this place
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text style={{ color: '#059669', fontWeight: '700', fontSize: 16 }}>
                        {formatCurrency(transport.cost)}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        ~{transport.distance ? Number(transport.distance).toFixed(1) : '0'} km
                      </Text>
                    </View>
                  </View>

                  {/* Estimated Activity Cost Input */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      Estimated Activity Cost (PKR)
                    </Text>
                    <TextInput
                      value={estimatedCost}
                      onChangeText={setEstimatedCost}
                      placeholder="e.g., 500"
                      keyboardType="numeric"
                      className="px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: colors.input,
                        color: colors.text,
                        fontSize: 16,
                      }}
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  {/* Day Selector */}
                  <View className="mb-4">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                      Add to Day
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {[...new Set(tripItinerary.map((item) => Number(item.day)).filter((day) => Number.isFinite(day)))].sort((a, b) => a - b).map((day) => (
                          <TouchableOpacity
                            key={day}
                            onPress={() => handleDayChange(day)}
                            className="px-4 py-2 rounded-full"
                            style={{
                              backgroundColor: selectedDay === day ? '#3B82F6' : colors.input,
                            }}
                          >
                            <Text
                              style={{
                                color: selectedDay === day ? 'white' : colors.text,
                                fontWeight: '600',
                              }}
                            >
                              Day {day}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Add Button */}
                  <WanderButton
                    onPress={() => handleAddPlaceToTrip(estimatedCost)}
                    disabled={isAddingPlace}
                    style={{ opacity: isAddingPlace ? 0.7 : 1 }}
                  >
                    {isAddingPlace ? (
                      <View className="flex-row items-center gap-2">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-semibold">Adding...</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        <Plus size={18} color="white" />
                        <Text className="text-white font-semibold text-base">
                          Add to Day {selectedDay}
                        </Text>
                      </View>
                    )}
                  </WanderButton>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Search Header - only in explore mode */}
        {viewMode === 'explore' && (
          <View style={{ backgroundColor: colors.background, borderBottomColor: colors.border }} className="border-b px-4 py-3">
            <View className="flex-row gap-2">
              <View className="flex-1 flex-row items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: colors.input }}>
                <Search size={18} color={colors.textSecondary} />
                <TextInput
                  placeholder="Search on map..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-sm"
                  placeholderTextColor={colors.textTertiary}
                  style={{ color: colors.text }}
                />
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Filter', 'Filter options')}
                className="px-4 rounded-2xl bg-gray-100 flex-row items-center gap-2 justify-center"
              >
                <Filter size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trip Header - only in trip mode */}
        {viewMode === 'trip' && activeTrip && (
          <View
            className="px-4 py-3 border-b"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <Text className="text-lg font-bold" style={{ color: colors.text }} numberOfLines={1}>
              {activeTrip?.title || 'Trip Map'}
            </Text>
            <Text className="text-sm" style={{ color: colors.textSecondary }}>
              {activeTrip?.destination?.name}
            </Text>
          </View>
        )}

        {viewMode === 'trip' && activeTrip && tripItinerary.length === 0 && (
          <View className="px-4 py-3" style={{ backgroundColor: colors.card }}>
            <Text style={{ color: colors.text, textAlign: 'center' }}>
              Your trip has no itinerary yet
            </Text>
          </View>
        )}

        {/* Real Map */}
        <View className="flex-1 relative">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation={!!userLocation}
            showsMyLocationButton={false}
            initialRegion={defaultRegion}
            region={viewMode === 'trip' && tripRegion ? tripRegion : mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            {/* Explore mode markers */}
            {viewMode === 'explore' && filteredPlaces
              .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
              .map((place) => (
                <Marker
                  key={place.id}
                  coordinate={{ latitude: Number(place.lat), longitude: Number(place.lng) }}
                  title={place.name}
                  description={place.address || place.description || ''}
                  onPress={() => setSelectedPlace(place)}
                  pinColor={getPinColor(place.type)}
                />
              ))}

            {/* Trip mode polyline */}
            {viewMode === 'trip' && routeCoordinates.length >= 2 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#3B82F6"
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            )}

            {/* Trip mode activity markers */}
            {viewMode === 'trip' && activitiesWithCoords.map((activity, index) => (
              <Marker
                key={activity.id || activity._id || index}
                coordinate={{
                  latitude: Number(activity.latitude),
                  longitude: Number(activity.longitude),
                }}
                title={activity.name}
                description={activity.location?.address || activity.description || ''}
                onPress={() => setSelectedActivity(activity)}
                pinColor={getActivityMarkerColor(activity.type)}
              />
            ))}
          </MapView>

          {/* Loading overlay */}
          {isLoading && viewMode === 'explore' && (
            <View className="absolute inset-0 items-center justify-center bg-white/50 z-20">
              <View className="bg-white p-4 rounded-xl shadow-lg">
                <Text className="text-gray-600">Loading places...</Text>
              </View>
            </View>
          )}

          {/* Empty state for explore mode */}
          {!isLoading && viewMode === 'explore' && filteredPlaces.length === 0 && (
            <View className="absolute inset-0 items-center justify-center z-10">
              <MapPin size={64} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-lg">No places found</Text>
              <Text className="text-gray-400 text-sm">Try adjusting your filters</Text>
            </View>
          )}

          {/* Mode toggle */}
          {renderModeToggle()}

          {/* Day selector (trip mode) */}
          {renderDaySelector()}

          {/* Trip empty state */}
          {renderTripEmptyState()}

          {/* Transport card (trip mode) */}
          {renderTransportCard()}
        </View>

        {/* Filter Pills - only in explore mode */}
        {viewMode === 'explore' && (
          <View className="absolute top-20 left-0 right-0 px-4 z-10">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {Object.entries(categoryMap).map(([type, config]) => {
                  const Icon = config.icon;
                  const isActive = activeFilters.has(type);

                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => toggleFilter(type)}
                      className="px-3 py-2 rounded-full flex-row items-center gap-2"
                      style={{
                        backgroundColor: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                        borderLeftWidth: isActive ? 3 : 0,
                        borderLeftColor: config.color,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2,
                        elevation: 3,
                      }}
                    >
                      <Icon size={14} color={isActive ? config.color : '#666'} />
                      <Text className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View className="absolute bottom-4 right-4 space-y-3 z-10" style={{ gap: 12 }}>
          {viewMode === 'explore' && (
            <TouchableOpacity
              onPress={() => setShowNearby(!showNearby)}
              className="w-14 h-14 rounded-full bg-white items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Layers size={24} color="#3B82F6" />
            </TouchableOpacity>
          )}
          {viewMode === 'trip' && (
            <TouchableOpacity
              onPress={handleExploreNearby}
              className="w-14 h-14 rounded-full items-center justify-center"
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
          )}
          <TouchableOpacity
            onPress={handleLocateMe}
            className="w-14 h-14 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Locate size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Selected Place Bottom Sheet (explore mode) */}
        <Modal
          visible={selectedPlace !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedPlace(null)}
        >
          <TouchableOpacity
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            activeOpacity={1}
            onPress={() => setSelectedPlace(null)}
          >
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl px-4 pb-8 pt-4">
                {selectedPlace && (
                  <View>
                    <TouchableOpacity
                      onPress={() => setSelectedPlace(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 items-center justify-center z-10"
                    >
                      <X size={16} color="#000" />
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                      <View className="w-20 h-20 rounded-xl overflow-hidden">
                        <ImageWithFallback
                          source={{ uri: selectedPlace.image }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>

                      <View className="flex-1 pr-8">
                        <Text className="text-lg font-semibold mb-1" numberOfLines={1}>
                          {selectedPlace.name}
                        </Text>
                        <View className="flex-row items-center gap-2 mb-2">
                          <View className="flex-row items-center gap-1">
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text className="text-sm">{selectedPlace.rating?.toFixed(1) || 'New'}</Text>
                            {selectedPlace.reviewCount > 0 && (
                              <Text className="text-sm text-gray-500">({selectedPlace.reviewCount})</Text>
                            )}
                          </View>
                          {selectedPlace.distance && (
                            <View className="flex-row items-center gap-1">
                              <Navigation size={12} color="#666" />
                              <Text className="text-sm text-gray-600">{selectedPlace.distance} km</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                          {selectedPlace.address || selectedPlace.description || 'No address available'}
                        </Text>

                        <View className="flex-row gap-2">
                          <WanderButton
                            onPress={() => handleNavigate(selectedPlace)}
                            style={{ flex: 1 }}
                          >
                            <View className="flex-row items-center gap-2">
                              <Navigation size={16} color="#fff" />
                              <Text className="text-white font-semibold">Navigate</Text>
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

        {/* Nearby Places Overlay (explore mode) */}
        <Modal
          visible={showNearby}
          transparent
          animationType="slide"
          onRequestClose={() => setShowNearby(false)}
        >
          <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View className="absolute top-0 right-0 bottom-0 w-80 bg-white">
              <View className="flex-1">
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold">Nearby Places</Text>
                    <TouchableOpacity
                      onPress={() => setShowNearby(false)}
                      className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center"
                    >
                      <X size={16} color="#000" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView className="space-y-3" showsVerticalScrollIndicator={false}>
                    {isLoading ? (
                      [1, 2, 3, 4, 5].map((i) => (
                        <ListItemSkeleton key={i} style={{ marginBottom: 12 }} />
                      ))
                    ) : nearbyPlaces.length === 0 ? (
                      <View className="py-8 items-center">
                        <MapPin size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2">No nearby places found</Text>
                        <Text className="text-gray-400 text-sm">Enable location to see nearby businesses</Text>
                      </View>
                    ) : (
                      nearbyPlaces.map((place, idx) => {
                        const Icon = getIcon(place.type);
                        const pinColor = getPinColor(place.type);

                        return (
                          <TouchableOpacity
                            key={place.id}
                            onPress={() => {
                              setSelectedPlace(place);
                              setShowNearby(false);
                            }}
                            style={{ marginBottom: 12 }}
                          >
                            <WanderCard padding="sm">
                              <View className="flex-row gap-3">
                                <View className="relative w-12 h-12 rounded-lg overflow-hidden">
                                  <ImageWithFallback
                                    source={{ uri: place.image }}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                  />
                                  <View
                                    className="absolute -top-1 -left-1 w-6 h-6 rounded-full items-center justify-center"
                                    style={{ backgroundColor: pinColor }}
                                  >
                                    <Text className="text-white text-xs font-bold">{idx + 1}</Text>
                                  </View>
                                </View>
                                <View className="flex-1">
                                  <Text className="font-semibold mb-1" numberOfLines={1}>
                                    {place.name}
                                  </Text>
                                  <View className="flex-row items-center gap-2">
                                    {place.distance && (
                                      <>
                                        <Navigation size={10} color="#666" />
                                        <Text className="text-xs text-gray-600">{place.distance} km</Text>
                                        <Text className="text-xs text-gray-600">•</Text>
                                      </>
                                    )}
                                    <Star size={10} color="#F59E0B" fill="#F59E0B" />
                                    <Text className="text-xs text-gray-600">
                                      {place.rating?.toFixed(1) || 'New'}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </WanderCard>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Activity bottom sheet (trip mode) */}
        {renderActivitySheet()}

        {/* Nearby places sheet (trip mode) */}
        {renderNearbyPlacesSheet()}

        {/* Add to Trip sheet */}
        {renderAddToTripSheet()}
      </View>
    </View>
  );
};

export default Maps;
