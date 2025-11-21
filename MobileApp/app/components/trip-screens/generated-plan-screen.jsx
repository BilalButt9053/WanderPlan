import React from 'react';
import { 
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share
} from 'react-native';
import { 
  ArrowLeft,
  Share2,
  MapPin,
  UtensilsCrossed,
  Hotel,
  Palmtree,
  Clock,
  DollarSign,
  Bookmark
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderButton } from '../wander-button';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';

const budgetAllocation = [
  { name: 'Travel', value: 30, color: '#2F80ED' },
  { name: 'Food', value: 25, color: '#27AE60' },
  { name: 'Stay', value: 35, color: '#F2994A' },
  { name: 'Leisure', value: 10, color: '#9B51E0' },
];

const itineraryDays = [
  {
    day: 1,
    items: [
      {
        time: '09:00 AM',
        title: 'Arrive at Hotel',
        type: 'hotel',
        icon: Hotel,
        price: 150,
        location: 'Downtown District',
      },
      {
        time: '12:30 PM',
        title: 'Local Street Food Tour',
        type: 'food',
        icon: UtensilsCrossed,
        price: 35,
        location: 'Old Town Market',
      },
      {
        time: '03:00 PM',
        title: 'City Walking Tour',
        type: 'leisure',
        icon: MapPin,
        price: 25,
        location: 'Historic Center',
      },
    ],
  },
  {
    day: 2,
    items: [
      {
        time: '08:00 AM',
        title: 'Breakfast at Cafe',
        type: 'food',
        icon: UtensilsCrossed,
        price: 20,
        location: 'City Center',
      },
      {
        time: '10:00 AM',
        title: 'Beach Day & Water Sports',
        type: 'leisure',
        icon: Palmtree,
        price: 60,
        location: 'Sunset Beach',
      },
      {
        time: '07:00 PM',
        title: 'Dinner at Seafood Restaurant',
        type: 'food',
        icon: UtensilsCrossed,
        price: 55,
        location: 'Beachfront',
      },
    ],
  },
  {
    day: 3,
    items: [
      {
        time: '09:00 AM',
        title: 'Museum & Art Gallery',
        type: 'leisure',
        icon: MapPin,
        price: 30,
        location: 'Cultural District',
      },
      {
        time: '01:00 PM',
        title: 'Traditional Lunch',
        type: 'food',
        icon: UtensilsCrossed,
        price: 40,
        location: 'Restaurant Row',
      },
    ],
  },
];

export function GeneratedPlanScreen({ budgetData, onBack, onSave }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${budgetData.duration}-day trip plan to ${budgetData.destination}!`,
        title: `Trip to ${budgetData.destination}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Text style={{ fontSize: 18, fontWeight: '600' }}>Your Trip Plan</Text>
              <Text style={{ fontSize: 13, color: '#6B7280' }}>{budgetData.destination}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 24 }}>
        {/* Budget Overview */}
        <View style={{
          backgroundColor: '#3B82F6',
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#ffffff' }}>Total Budget</Text>
            <View style={{ 
              paddingHorizontal: 12, 
              paddingVertical: 6, 
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}>
              <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: '600' }}>
                {budgetData.duration} days
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>
            {budgetData.currency} {budgetData.budget}
          </Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
            ~{budgetData.currency} {Math.round(Number(budgetData.budget) / Number(budgetData.duration))} per day
          </Text>
        </View>

        {/* Budget Allocation */}
        <WanderCard>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Budget Allocation</Text>
          
          {/* Simple bar representation */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ 
              height: 40, 
              borderRadius: 12, 
              overflow: 'hidden',
              flexDirection: 'row'
            }}>
              {budgetAllocation.map((item, index) => (
                <View 
                  key={item.name}
                  style={{ 
                    width: `${item.value}%`, 
                    backgroundColor: item.color,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>
                    {item.value}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {budgetAllocation.map((item) => (
              <View key={item.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: 6, 
                    backgroundColor: item.color 
                  }}
                />
                <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>{item.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600' }}>{item.value}%</Text>
              </View>
            ))}
          </View>
        </WanderCard>

        {/* Itinerary by Day */}
        <View>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Daily Itinerary</Text>
          <View style={{ gap: 16 }}>
            {itineraryDays.map((day) => (
              <WanderCard key={day.day}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB'
                }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#DBEAFE',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ color: '#3B82F6', fontWeight: '600' }}>D{day.day}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '600' }}>Day {day.day}</Text>
                </View>

                <View style={{ gap: 12 }}>
                  {day.items.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <View
                        key={idx}
                        style={{
                          flexDirection: 'row',
                          gap: 12,
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor: '#F9FAFB'
                        }}
                      >
                        <View style={{ alignItems: 'center', gap: 4 }}>
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            backgroundColor: '#DBEAFE',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={18} color="#3B82F6" />
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Clock size={10} color="#6B7280" />
                            <Text style={{ fontSize: 11, color: '#6B7280' }}>{item.time}</Text>
                          </View>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                            {item.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <MapPin size={12} color="#6B7280" />
                            <Text style={{ fontSize: 13, color: '#6B7280', flex: 1 }} numberOfLines={1}>
                              {item.location}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <DollarSign size={14} color="#059669" />
                            <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                              {budgetData.currency} {item.price}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </WanderCard>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={onSave}
            style={{
              flex: 1,
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
              Save Trip
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              paddingVertical: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderWidth: 2,
              borderColor: '#3B82F6'
            }}
          >
            <Share2 size={20} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', fontSize: 16, fontWeight: '600' }}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
