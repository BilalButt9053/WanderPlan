import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
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
  GripVertical,
  Tag,
  RefreshCw
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { WanderChip } from '../components/wander-chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import { useGetMenuItemsQuery, useGetDealsQuery } from '../../redux/api/businessItemsApi';

const getIcon = (type) => {
  switch (type) {
    case 'hotel':
      return Hotel;
    case 'restaurant':
    case 'food':
    case 'beverage':
      return UtensilsCrossed;
    case 'deal':
      return Tag;
    case 'attraction':
    default:
      return MapPin;
  }
};

const getCategoryType = (category) => {
  const foodCategories = ['food', 'beverage', 'appetizer', 'main course', 'dessert', 'drinks'];
  if (foodCategories.includes(category?.toLowerCase())) return 'restaurant';
  if (category?.toLowerCase() === 'hotel' || category?.toLowerCase() === 'accommodation') return 'hotel';
  return 'attraction';
};

export default function ManualTripBuilderScreen({ onBack, onSave }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch menu items from API
  const { 
    data: menuItemsData, 
    isLoading: isLoadingItems, 
    error: itemsError,
    refetch: refetchItems 
  } = useGetMenuItemsQuery({ limit: 100 });

  // Fetch active deals
  const { 
    data: dealsData, 
    isLoading: isLoadingDeals,
    error: dealsError,
    refetch: refetchDeals
  } = useGetDealsQuery({ limit: 50 });

  // Debug logging
  console.log('[TripBuilder] Menu items data:', menuItemsData);
  console.log('[TripBuilder] Deals data:', dealsData);
  console.log('[TripBuilder] Items error:', itemsError);
  console.log('[TripBuilder] Deals error:', dealsError);

  // Transform API data to match expected format
  const availableItems = useMemo(() => {
    const items = [];
    
    // Helper to extract image URL
    const getImageUrl = (images, fallback = 'https://images.unsplash.com/photo-1676471932681-45fa972d848a') => {
      if (!images || images.length === 0) return fallback;
      const img = images[0];
      if (typeof img === 'string') return img;
      return img?.url || fallback;
    };
    
    // Add menu items
    if (menuItemsData?.items) {
      menuItemsData.items.forEach(item => {
        items.push({
          id: item._id,
          name: item.name,
          type: getCategoryType(item.category),
          category: item.category,
          price: item.price || 0,
          rating: item.rating || 4.5,
          image: getImageUrl(item.images),
          location: item.business?.address?.city || item.business?.businessName || 'Pakistan',
          businessName: item.business?.businessName,
          description: item.description,
          itemType: 'menuItem'
        });
      });
    }
    
    // Add deals
    if (dealsData?.deals) {
      dealsData.deals.forEach(deal => {
        const discountText = deal.discountType === 'percentage' 
          ? `${deal.discountValue}% off` 
          : `Rs ${deal.discountValue} off`;
        
        // Extract deal image URL
        let dealImage = 'https://images.unsplash.com/photo-1676471932681-45fa972d848a';
        if (deal.image) {
          dealImage = typeof deal.image === 'string' ? deal.image : deal.image.url || dealImage;
        } else if (deal.menuItems?.[0]?.images) {
          dealImage = getImageUrl(deal.menuItems[0].images);
        }
        
        items.push({
          id: deal._id,
          name: `${deal.title} (${discountText})`,
          type: 'deal',
          category: 'deal',
          price: deal.menuItems?.[0]?.price || 0,
          rating: 4.8,
          image: dealImage,
          location: deal.business?.address?.city || deal.business?.businessName || 'Pakistan',
          businessName: deal.business?.businessName,
          description: deal.description,
          discountType: deal.discountType,
          discountValue: deal.discountValue,
          itemType: 'deal'
        });
      });
    }
    
    return items;
  }, [menuItemsData, dealsData]);

  const addItem = (item) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesPrice = 
      priceRange === 'all' ||
      (priceRange === 'low' && item.price < 5000) ||
      (priceRange === 'medium' && item.price >= 5000 && item.price < 20000) ||
      (priceRange === 'high' && item.price >= 20000);
    
    return matchesSearch && matchesType && matchesPrice;
  });

  const totalCost = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const isLoading = isLoadingItems || isLoadingDeals;

  const handleRefresh = () => {
    refetchItems();
    refetchDeals();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
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
                {selectedItems.length} items • Rs {totalCost.toLocaleString()}
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
            onPress={handleRefresh}
            style={{
              paddingHorizontal: 12,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F3F4F6'
            }}
          >
            <RefreshCw size={18} color={isLoading ? '#3B82F6' : '#000'} />
          </TouchableOpacity>
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
                {['all', 'restaurant', 'hotel', 'attraction', 'deal'].map((type) => (
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
                  { value: 'low', label: '< Rs 5,000' },
                  { value: 'medium', label: 'Rs 5,000-20,000' },
                  { value: 'high', label: '> Rs 20,000' },
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
                Rs {totalCost.toLocaleString()} total
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
                        Rs {item.price.toLocaleString()}
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>Available Places</Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {filteredItems.length} items
            </Text>
          </View>
          
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading items from businesses...</Text>
            </View>
          ) : (itemsError || dealsError) ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>Failed to load items</Text>
              <Text style={{ color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
                {itemsError?.message || dealsError?.message || 'Please check your connection and try again'}
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12
                }}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredItems.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>No items found</Text>
              <Text style={{ color: '#6B7280', textAlign: 'center' }}>
                {availableItems.length === 0 
                  ? 'No businesses have added items yet. Check back later!'
                  : 'Try adjusting your filters or search query'
                }
              </Text>
            </View>
          ) : (
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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Icon size={14} color="#6B7280" />
                        <Text style={{ fontSize: 13, color: '#6B7280', flex: 1 }} numberOfLines={1}>
                          {item.businessName || item.location}
                        </Text>
                      </View>
                      {item.businessName && item.location && (
                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }} numberOfLines={1}>
                          📍 {item.location}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: '#059669', fontWeight: '600' }}>
                          Rs {item.price.toLocaleString()}
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
          )}
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
