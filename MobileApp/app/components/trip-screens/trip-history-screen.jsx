import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import {
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderButton } from '../wander-button';
import { WanderCard } from '../wander-card';
import { WanderChip } from '../wander-chip';
import ImageWithFallback from '../ImageWithFallback';

const trips = [
  {
    id: '1',
    destination: 'Paris, France',
    dates: 'Jun 15 - Jun 22, 2024',
    duration: '7 days',
    budget: '3500',
    spent: '3200',
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2MDMyODIyMnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed',
  },
  {
    id: '2',
    destination: 'Tokyo, Japan',
    dates: 'Aug 10 - Aug 17, 2024',
    duration: '7 days',
    budget: '4000',
    spent: '3850',
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1602283662099-1c6c158ee94d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjAzMjgyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed',
  },
  {
    id: '3',
    destination: 'Bali, Indonesia',
    dates: 'Dec 20 - Dec 30, 2024',
    duration: '10 days',
    budget: '2500',
    spent: '0',
    currency: 'USD',
    image: 'https://images.unsplash.com/photo-1604394089666-6d365c060c6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwdGVtcGxlJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2MDM3MDYxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'upcoming',
  },
  {
    id: '4',
    destination: 'Barcelona, Spain',
    dates: 'Not scheduled',
    duration: '5 days',
    budget: '2000',
    spent: '0',
    currency: 'EUR',
    image: 'https://images.unsplash.com/photo-1641303125338-72cd1d3e1e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwdHJhdmVsJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc2MDI3NzU1M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'draft',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return { backgroundColor: '#D1FAE5', color: '#059669' };
    case 'upcoming':
      return { backgroundColor: '#DBEAFE', color: '#2563EB' };
    case 'draft':
      return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#6B7280' };
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'upcoming':
      return 'Upcoming';
    case 'draft':
      return 'Draft';
    default:
      return status;
  }
};

function TripCard({ trip, onReopen }) {
  const budgetPercentage = trip.spent 
    ? Math.round((Number(trip.spent) / Number(trip.budget)) * 100)
    : 0;
  const statusStyle = getStatusColor(trip.status);

  return (
    <WanderCard padding="none" hover>
      <View style={{ flexDirection: 'row', gap: 12, padding: 12 }}>
        {/* Thumbnail */}
        <View style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
          <ImageWithFallback
            src={trip.image}
            alt={trip.destination}
            style={{ width: '100%', height: '100%' }}
          />
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <View style={{ 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 12,
              backgroundColor: statusStyle.backgroundColor
            }}>
              <Text style={{ fontSize: 11, color: statusStyle.color, fontWeight: '600' }}>
                {getStatusText(trip.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={{ flex: 1, minWidth: 0, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }} numberOfLines={1}>
            {trip.destination}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={12} color="#6B7280" />
            <Text style={{ fontSize: 13, color: '#6B7280' }} numberOfLines={1}>
              {trip.dates}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={12} color="#6B7280" />
            <Text style={{ fontSize: 13, color: '#6B7280' }}>
              {trip.duration}
            </Text>
          </View>

          {/* Budget Summary */}
          {trip.status === 'completed' ? (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: '#6B7280' }}>Budget used</Text>
                <Text style={{ fontSize: 11, color: budgetPercentage > 100 ? '#DC2626' : '#059669', fontWeight: '600' }}>
                  {budgetPercentage}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor: budgetPercentage > 100 ? '#DC2626' : '#059669'
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                {trip.currency} {trip.spent} / {trip.budget}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} color="#059669" />
              <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                {trip.currency} {trip.budget}
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={onReopen}
          style={{
            alignSelf: 'center',
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: '#DBEAFE',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ChevronRight size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </WanderCard>
  );
}

export function TripHistoryScreen({ onCreateNew, onReopenTrip }) {
  const completedTrips = trips.filter(t => t.status === 'completed');
  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const draftTrips = trips.filter(t => t.status === 'draft');

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
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700' }}>My Trips</Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {trips.length} total trips
            </Text>
          </View>
          <TouchableOpacity
            onPress={onCreateNew}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 5
            }}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ padding: 16, gap: 24 }}>
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Clock size={18} color="#3B82F6" />
                <Text style={{ fontSize: 18, fontWeight: '600' }}>Upcoming Trips</Text>
              </View>
              <View style={{ gap: 12 }}>
                {upcomingTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onReopen={() => onReopenTrip(trip.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Drafts */}
          {draftTrips.length > 0 && (
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Drafts</Text>
              <View style={{ gap: 12 }}>
                {draftTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onReopen={() => onReopenTrip(trip.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Completed Trips */}
          {completedTrips.length > 0 && (
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Past Trips</Text>
              <View style={{ gap: 12 }}>
                {completedTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onReopen={() => onReopenTrip(trip.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {trips.length === 0 && (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <MapPin size={32} color="#6B7280" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>No trips yet</Text>
              <Text style={{ color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>
                Start planning your first adventure!
              </Text>
              <WanderButton onPress={onCreateNew}>
                <Plus size={20} color="#ffffff" />
                <Text style={{ color: '#ffffff', marginLeft: 8 }}>Create Your First Trip</Text>
              </WanderButton>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
