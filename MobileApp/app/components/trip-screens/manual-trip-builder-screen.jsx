import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Plus,
  Hotel,
  UtensilsCrossed,
  MapPin,
  X,
  Filter,
  Bookmark,
  GripVertical
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderButton } from '../wander-button';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';
import ImageWithFallback from '../ImageWithFallback';

const availableItems = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    type: 'hotel',
    price: 150,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1729605411476-defbdab14c54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGx1eHVyeSUyMHJvb218ZW58MXx8fHwxNzYwMzc0MzI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Downtown',
  },
  {
    id: '2',
    name: 'La Bella Vista Restaurant',
    type: 'restaurant',
    price: 45,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1676471932681-45fa972d848a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NjAyNTkyMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Old Town',
  },
  {
    id: '3',
    name: 'Historic City Tour',
    type: 'attraction',
    price: 30,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1641303125338-72cd1d3e1e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdHJhdmVsJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MDI3NzU1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'City Center',
  },
  {
    id: '4',
    name: 'Seaside Cafe',
    type: 'restaurant',
    price: 25,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1628565350863-533a3c174b85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FmZXxlbnwxfHx8fDE3NjAzMzg3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Beach Area',
  },
  {
    id: '5',
    name: 'Beach Resort',
    type: 'hotel',
    price: 200,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1752436632465-57f537d386f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGJlYWNofGVufDF8fHx8MTc2MDM2ODU4Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Beachfront',
  },
  {
    id: '6',
    name: 'Mountain View Point',
    type: 'attraction',
    price: 15,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1543169564-be8896b30cdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMGhpa2luZ3xlbnwxfHx8fDE3NjAzMzI2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    location: 'Highland',
  },
];

const getIcon = (type) => {
  switch (type) {
    case 'hotel':
      return Hotel;
    case 'restaurant':
      return UtensilsCrossed;
    case 'attraction':
      return MapPin;
    default:
      return MapPin;
  }
};

export function ManualTripBuilderScreen({ onBack, onSave }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const addItem = (item) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPrice = 
      priceRange === 'all' ||
      (priceRange === 'low' && item.price < 50) ||
      (priceRange === 'medium' && item.price >= 50 && item.price < 150) ||
      (priceRange === 'high' && item.price >= 150);
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const totalCost = selectedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={onBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Build Your Trip</Text>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>
                {selectedItems.length} items • ${totalCost}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ 
            flex: 1, 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 8, 
            backgroundColor: '#F3F4F6', 
            borderRadius: 16, 
            paddingHorizontal: 16, 
            paddingVertical: 8 
          }}>
            <Search size={18} color="#6B7280" />
            <TextInput
              placeholder="Search places..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, fontSize: 14 }}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              paddingHorizontal: 16,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: showFilters ? '#3B82F6' : '#F3F4F6'
            }}
          >
            <Filter size={18} color={showFilters ? '#ffffff' : '#000'} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={{ marginTop: 12, gap: 12 }}>
            <View>
              <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>Type</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {['all', 'hotel', 'restaurant', 'attraction'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFilterType(type)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: filterType === type ? '#3B82F6' : '#F3F4F6'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      color: filterType === type ? '#ffffff' : '#000',
                      fontWeight: filterType === type ? '600' : '400'
                    }}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>Price Range</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'low', label: '< $50' },
                  { value: 'medium', label: '$50-150' },
                  { value: 'high', label: '> $150' },
                ].map((range) => (
                  <TouchableOpacity
                    key={range.value}
                    onPress={() => setPriceRange(range.value)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      backgroundColor: priceRange === range.value ? '#3B82F6' : '#F3F4F6'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 13, 
                      color: priceRange === range.value ? '#ffffff' : '#000',
                      fontWeight: priceRange === range.value ? '600' : '400'
                    }}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: selectedItems.length > 0 ? 180 : 100, gap: 24 }}>
        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Your Itinerary</Text>
              <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                ${totalCost} total
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {selectedItems.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 16
                    }}
                  >
                    <GripVertical size={18} color="#6B7280" />
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: '#DBEAFE',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={20} color="#3B82F6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600' }} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                        ${item.price}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: '#FEE2E2',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Available Items */}
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Available Places</Text>
          <View style={{ gap: 12 }}>
            {filteredItems.map((item) => {
              const Icon = getIcon(item.type);
              const isAdded = selectedItems.some(i => i.id === item.id);
              
              return (
                <WanderCard key={item.id} padding="none" hover>
                  <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden' }}>
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={{ 
                          paddingHorizontal: 8, 
                          paddingVertical: 4, 
                          borderRadius: 12,
                          backgroundColor: '#F3F4F6',
                          marginLeft: 8
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '600' }}>
                            ⭐ {item.rating}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Icon size={14} color="#6B7280" />
                        <Text style={{ fontSize: 13, color: '#6B7280', flex: 1 }} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#059669', fontWeight: '600' }}>
                          ${item.price}
                        </Text>
                        <TouchableOpacity
                          onPress={() => addItem(item)}
                          disabled={isAdded}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            backgroundColor: isAdded ? '#F3F4F6' : '#3B82F6',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {!isAdded && <Plus size={14} color="#ffffff" />}
                          <Text style={{ 
                            fontSize: 13, 
                            color: isAdded ? '#6B7280' : '#ffffff',
                            fontWeight: '600'
                          }}>
                            {isAdded ? 'Added' : 'Add'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </WanderCard>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      {selectedItems.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          zIndex: 30
        }}>
          <TouchableOpacity
            onPress={onSave}
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <Bookmark size={20} color="#ffffff" />
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              Save Trip ({selectedItems.length} items)
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
