import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from 'react-native';
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
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { ImageWithFallback } from '../components/ImageWithFallback';

const mapPlaces = [
  {
    id: '1',
    name: 'La Bella Cucina',
    type: 'food',
    lat: 40.7580,
    lng: -73.9855,
    rating: 4.7,
    distance: 0.8,
    price: 45,
    image: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBkaW5pbmd8ZW58MXx8fHwxNzYwMzc0Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '123 Main Street',
  },
  {
    id: '2',
    name: 'Grand Hotel',
    type: 'hotel',
    lat: 40.7589,
    lng: -73.9851,
    rating: 4.8,
    distance: 1.2,
    price: 150,
    image: 'https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGx1eHVyeSUyMHJvb218ZW58MXx8fHwxNzYwMzc0MzI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '456 Park Avenue',
  },
  {
    id: '3',
    name: 'Secret Garden Cafe',
    type: 'gem',
    lat: 40.7570,
    lng: -73.9860,
    rating: 4.9,
    distance: 0.5,
    price: 12,
    image: 'https://images.unsplash.com/photo-1629096668246-524da904215c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZlJTIwY29mZmVlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYwMzc1ODExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '321 Hidden Lane',
  },
  {
    id: '4',
    name: 'Seaside Restaurant',
    type: 'food',
    lat: 40.7595,
    lng: -73.9845,
    rating: 4.6,
    distance: 1.5,
    price: 55,
    image: 'https://images.unsplash.com/photo-1676471932681-45fa972d848a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NjAyNTkyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '789 Beach Road',
  },
  {
    id: '5',
    name: 'Artisan Market',
    type: 'gem',
    lat: 40.7565,
    lng: -73.9870,
    rating: 4.5,
    distance: 2.1,
    price: 0,
    image: 'https://images.unsplash.com/photo-1751857040028-5073d73c56a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2NhbCUyMG1hcmtldCUyMHN0cmVldHxlbnwxfHx8fDE3NjAzNzU4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    address: '234 Market Square',
  },
];

const Maps = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set(['food', 'hotel', 'gem']));

  const toggleFilter = (type) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(type)) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setActiveFilters(newFilters);
  };

  const filteredPlaces = mapPlaces.filter(place => activeFilters.has(place.type));
  const nearbyPlaces = mapPlaces
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  const getPinColor = (type) => {
    switch (type) {
      case 'food': return '#27AE60';
      case 'hotel': return '#2F80ED';
      case 'gem': return '#F2994A';
      default: return '#4F4F4F';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'food': return UtensilsCrossed;
      case 'hotel': return Hotel;
      case 'gem': return Gem;
      default: return MapPin;
    }
  };

  const handleNavigate = (place) => {
    setShowRoute(true);
    Alert.alert('Route Calculated', `ETA: 12 min • $8 fare to ${place.name}`);
  };

  return (
    <View className="flex-1">
      <View className="flex-1">
        {/* Search Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row gap-2">
            <View className="flex-1 flex-row items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
              <Search size={18} color="#666" />
              <TextInput
                placeholder="Search on map..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-sm"
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

        {/* Map Mock */}
        <View className="flex-1 relative" style={{ backgroundColor: '#E3F2FD' }}>
          {/* Grid pattern background */}
          <View className="absolute inset-0">
            {/* Map Pins */}
            {filteredPlaces.map((place, idx) => {
              const Icon = getIcon(place.type);
              const pinColor = getPinColor(place.type);
              
              // Position pins in a scattered pattern
              const top = 30 + (idx * 12) % 40;
              const left = 20 + (idx * 15) % 60;
              
              return (
                <TouchableOpacity
                  key={place.id}
                  onPress={() => setSelectedPlace(place)}
                  className="absolute"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: pinColor,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <Icon size={20} color="#fff" />
                  </View>
                  {selectedPlace?.id === place.id && (
                    <View className="absolute -bottom-2 left-1/2 w-2 h-2 rounded-full bg-white" style={{ marginLeft: -4 }} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Current Location Pin */}
            <View className="absolute" style={{ top: '50%', left: '50%', marginLeft: -8, marginTop: -8 }}>
              <View
                className="w-4 h-4 rounded-full border-4 border-white"
                style={{
                  backgroundColor: '#3B82F6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              />
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View className="absolute top-20 left-0 right-0 px-4 z-10">
          <View className="flex-row gap-2">
            {[
              { type: 'food', label: 'Food', icon: UtensilsCrossed, color: '#27AE60' },
              { type: 'hotel', label: 'Hotels', icon: Hotel, color: '#2F80ED' },
              { type: 'gem', label: 'Gems', icon: Gem, color: '#F2994A' },
            ].map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilters.has(filter.type);
              
              return (
                <TouchableOpacity
                  key={filter.type}
                  onPress={() => toggleFilter(filter.type)}
                  className="px-3 py-2 rounded-full flex-row items-center gap-2"
                  style={{
                    backgroundColor: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                    borderLeftWidth: isActive ? 3 : 0,
                    borderLeftColor: filter.color,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                >
                  <Icon size={14} color={isActive ? filter.color : '#666'} />
                  <Text className={`text-sm ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
            onPress={() => Alert.alert('Location', 'Centering on your location...')}
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
                            <Text className="text-sm">{selectedPlace.rating}</Text>
                          </View>
                          <View className="flex-row items-center gap-1">
                            <Navigation size={12} color="#666" />
                            <Text className="text-sm text-gray-600">{selectedPlace.distance} km</Text>
                          </View>
                        </View>
                        <Text className="text-sm text-gray-600 mb-3">{selectedPlace.address}</Text>

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
                          <WanderButton variant="outline" style={{ paddingHorizontal: 16 }}>
                            <View className="flex-row items-center gap-1">
                              <DollarSign size={16} color="#3B82F6" />
                              <Text className="text-blue-500 font-semibold">{selectedPlace.price}</Text>
                            </View>
                          </WanderButton>
                        </View>
                      </View>
                    </View>

                    {/* Route Info */}
                    {showRoute && (
                      <View className="mt-4 pt-4 border-t border-gray-200">
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-sm text-gray-600">Estimated Time</Text>
                            <Text className="text-blue-500 font-semibold">12 minutes</Text>
                          </View>
                          <View>
                            <Text className="text-sm text-gray-600">Distance</Text>
                            <Text className="font-semibold">{selectedPlace.distance} km</Text>
                          </View>
                          <View>
                            <Text className="text-sm text-gray-600">Est. Fare</Text>
                            <Text className="text-orange-500 font-semibold">$8</Text>
                          </View>
                        </View>
                      </View>
                    )}
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
                    {nearbyPlaces.map((place, idx) => {
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
                                  <Navigation size={10} color="#666" />
                                  <Text className="text-xs text-gray-600">{place.distance} km</Text>
                                  <Text className="text-xs text-gray-600">•</Text>
                                  <Star size={10} color="#F59E0B" fill="#F59E0B" />
                                  <Text className="text-xs text-gray-600">{place.rating}</Text>
                                </View>
                              </View>
                            </View>
                          </WanderCard>
                        </TouchableOpacity>
                      );
                    })}
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