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
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { WanderChip } from '../components/wander-chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import { useTheme } from '../hooks/useTheme';

const trips = [
  {
    id: '1',
    destination: 'Hunza Valley, Gilgit-Baltistan',
    dates: 'Jun 15 - Jun 22, 2024',
    duration: '7 days',
    budget: '150000',
    spent: '135000',
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW56YSUyMHZhbGxleSUyMHBha2lzdGFufGVufDF8fHx8MTczMjYxMjAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed',
  },
  {
    id: '2',
    destination: 'Lahore, Punjab',
    dates: 'Aug 10 - Aug 17, 2024',
    duration: '7 days',
    budget: '120000',
    spent: '115000',
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1571847027516-1df28ffc1e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWhvcmUlMjBmb3J0JTIwcGFraXN0YW58ZW58MXx8fHwxNzMyNjEyMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'completed',
  },
  {
    id: '3',
    destination: 'Skardu, Gilgit-Baltistan',
    dates: 'Dec 20 - Dec 30, 2024',
    duration: '10 days',
    budget: '180000',
    spent: '0',
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWlyeSUyMG1lYWRvd3MlMjBwYWtpc3RhbnxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'upcoming',
  },
  {
    id: '4',
    destination: 'Murree, Punjab',
    dates: 'Not scheduled',
    duration: '5 days',
    budget: '80000',
    spent: '0',
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWtpc3RhbmklMjBmb29kJTIwYmlyeWFuaXxlbnwxfHx8fDE3MzI2MTIwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
  const { colors } = useTheme();
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
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, color: colors.text }} numberOfLines={1}>
            {trip.destination}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
              {trip.dates}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {trip.duration}
            </Text>
          </View>

          {/* Budget Summary */}
          {trip.status === 'completed' ? (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>Budget used</Text>
                <Text style={{ fontSize: 11, color: budgetPercentage > 100 ? '#DC2626' : '#059669', fontWeight: '600' }}>
                  {budgetPercentage}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.input, borderRadius: 3, overflow: 'hidden' }}>
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(budgetPercentage, 100)}%`,
                    backgroundColor: budgetPercentage > 100 ? '#DC2626' : '#059669'
                  }}
                />
              </View>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
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

export default function TripHistoryScreen({ onCreateNew, onReopenTrip }) {
  const { colors } = useTheme();
  const completedTrips = trips.filter(t => t.status === 'completed');
  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const draftTrips = trips.filter(t => t.status === 'draft');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 16
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>My Trips</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
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
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Upcoming Trips</Text>
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
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.text }}>Drafts</Text>
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
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.text }}>Past Trips</Text>
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
