import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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
  DollarSign,
  Layers,
  Locate,
  Coffee,
  ShoppingBag,
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ListItemSkeleton } from '../components/Skeleton';
import { useTheme } from '../../hooks/useTheme';
import { useGetBusinessesQuery, useGetNearbyBusinessesQuery } from '../../redux/api/businessItemsApi';

// Category type mapping for display
const categoryMap = {
  restaurant: { icon: UtensilsCrossed, color: '#27AE60', label: 'Food' },
  cafe: { icon: Coffee, color: '#8B5CF6', label: 'Cafe' },
  hotel: { icon: Hotel, color: '#2F80ED', label: 'Hotels' },
  shopping: { icon: ShoppingBag, color: '#F2994A', label: 'Shopping' },
  attraction: { icon: Gem, color: '#EC4899', label: 'Attractions' },
};

const Maps = () => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(['restaurant', 'cafe', 'hotel', 'shopping', 'attraction']));

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

  // Transform API data to map format
  const mapPlaces = React.useMemo(() => {
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
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  // Add distance to places if user location available
  const placesWithDistance = React.useMemo(() => {
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

  const handleNavigate = (place) => {
    if (place.lat && place.lng) {
      const url = Platform.select({
        ios: `maps:0,0?q=${place.lat},${place.lng}(${encodeURIComponent(place.name)})`,
        android: `geo:${place.lat},${place.lng}?q=${place.lat},${place.lng}(${encodeURIComponent(place.name)})`,
      });
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`);
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

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="flex-1">
        {/* Search Header */}
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

        {/* Real Map */}
        <View className="flex-1 relative">
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            showsUserLocation={!!userLocation}
            showsMyLocationButton={false}
            initialRegion={{
              latitude: userLocation?.lat ?? 33.6844, // Islamabad fallback
              longitude: userLocation?.lng ?? 73.0479,
              latitudeDelta: 0.15,
              longitudeDelta: 0.15,
            }}
          >
            {filteredPlaces
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
          </MapView>

          {/* Loading overlay */}
          {isLoading && (
            <View className="absolute inset-0 items-center justify-center bg-white/50 z-20">
              <View className="bg-white p-4 rounded-xl shadow-lg">
                <Text className="text-gray-600">Loading places...</Text>
              </View>
            </View>
          )}

          {/* Empty state */}
          {!isLoading && filteredPlaces.length === 0 && (
            <View className="absolute inset-0 items-center justify-center z-10">
              <MapPin size={64} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-lg">No places found</Text>
              <Text className="text-gray-400 text-sm">Try adjusting your filters</Text>
            </View>
          )}
        </View>

        {/* Filter Pills */}
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

        {/* Action Buttons */}
        <View className="absolute bottom-4 right-4 space-y-3 z-10" style={{ gap: 12 }}>
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

        {/* Selected Place Bottom Sheet */}
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

        {/* Nearby Places Overlay */}
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
                      // Loading skeletons
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
      </View>
    </View>
  );
};

export default Maps;