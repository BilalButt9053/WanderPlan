import React from 'react';
import {
  Alert,
  Platform,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  Clock,
  Play
} from 'lucide-react-native';
import { WanderButton } from '../components/wander-button';
import { WanderCard } from '../components/wander-card';
import { WanderChip } from '../components/wander-chip';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageWithFallback from '../components/ImageWithFallback';
import { useTheme } from '../../hooks/useTheme';

// Dynamic status styles
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return { backgroundColor: '#D1FAE5', color: '#059669' };
    case 'upcoming':
    case 'confirmed':
      return { backgroundColor: '#DBEAFE', color: '#2563EB' };
    case 'in-progress':
      return { backgroundColor: '#FEF3C7', color: '#D97706' };
    case 'draft':
    case 'planning':
      return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    case 'cancelled':
      return { backgroundColor: '#FEE2E2', color: '#DC2626' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#6B7280' };
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'upcoming':
    case 'confirmed':
      return 'Upcoming';
    case 'in-progress':
      return 'In Progress';
    case 'draft':
    case 'planning':
      return 'Draft';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  }
};

function TripCard({ trip, onReopen, onDelete, onStartTrip }) {
  const { colors } = useTheme();
  const budgetPercentage = trip.spent
    ? Math.round((Number(trip.spent) / Math.max(Number(trip.totalBudget || 1), 1)) * 100)
    : 0;
  const statusStyle = getStatusColor(trip.status);

  // Check if trip can be started (upcoming/planning and start date reached)
  const canStartTrip = () => {
    if (!onStartTrip || !['upcoming', 'planning', 'confirmed'].includes(trip.status)) {
      return false;
    }
    if (trip.isStarted) return false;
    if (!trip.startDate) return false;

    const now = new Date();
    const startDate = new Date(trip.startDate);
    const oneDayBefore = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
    return now >= oneDayBefore;
  };

  const handleStartTrip = () => {
    if (canStartTrip()) {
      onStartTrip(trip.id);
    }
  };

  return (
    <WanderCard padding="none" hover>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onReopen}
        onLongPress={onDelete}
        delayLongPress={300}
      >
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
          <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 2, color: colors.text }} numberOfLines={1}>
            {trip.title}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6 }} numberOfLines={1}>
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

          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Budget: {trip.currency} {trip.totalBudget}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Remaining: {trip.currency} {trip.remainingBudget}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Activities: {trip.activitiesCount}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {canStartTrip() ? (
          <TouchableOpacity
            onPress={handleStartTrip}
            style={{
              alignSelf: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: '#DCFCE7',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Play size={20} color="#059669" fill="#059669" />
          </TouchableOpacity>
        ) : (
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
        )}
      </View>
      </TouchableOpacity>
    </WanderCard>
  );
}

export default function TripHistoryScreen({
  onCreateNew,
  onReopenTrip,
  onDeleteTrip,
  onStartTrip,
  trips = [],
  isLoading = false,
  onRefresh,
  error,
}) {
  const { colors } = useTheme();
  
  // Normalize trips data from API
  const normalizedTrips = React.useMemo(() => {
    return trips.map(trip => {
      // Safely extract image URL from various formats
      let imageUrl = 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400';
      if (trip.coverImage) {
        if (typeof trip.coverImage === 'string') {
          imageUrl = trip.coverImage;
        } else if (trip.coverImage?.url) {
          imageUrl = trip.coverImage.url;
        }
      }
      
      return {
        id: trip._id,
        title: trip.title || trip.destination?.name || 'Untitled Trip',
        destination: trip.destination?.name || trip.destination?.city || 'Unknown',
        dates: trip.startDate && trip.endDate 
          ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : 'Not scheduled',
        duration: `${trip.durationDays || Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1 || 1} days`,
        totalBudget: trip.totalBudget?.toString() || '0',
        remainingBudget: (trip.remainingBudget ?? (trip.totalBudget - (trip.totalSpent || 0)) ?? 0).toString(),
        spent: trip.totalSpent?.toString() || '0',
        activitiesCount: trip.itinerary?.totalActivities || 0,
        currency: trip.currency || 'PKR',
        image: imageUrl,
        status: trip.status || 'draft',
        startDate: trip.startDate,
        isStarted: trip.isStarted ?? false,
      };
    });
  }, [trips]);

  const handleConfirmDelete = (trip) => {
    if (!onDeleteTrip) return;
    Alert.alert(
      'Delete Trip?',
      'This action cannot be undone',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDeleteTrip(trip.id);
            if (Platform.OS === 'android') {
              ToastAndroid.show('Trip deleted successfully', ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  };

  const completedTrips = normalizedTrips.filter(t => t.status === 'completed');
  const upcomingTrips = normalizedTrips.filter(t => t.status === 'upcoming' || t.status === 'confirmed');
  const draftTrips = normalizedTrips.filter(t => t.status === 'draft' || t.status === 'planning');
  const inProgressTrips = normalizedTrips.filter(t => t.status === 'in-progress' || t.status === 'ongoing');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
              {normalizedTrips.length} total trips
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
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          ) : undefined
        }
      >
        {/* Loading State */}
        {isLoading && normalizedTrips.length === 0 && (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading trips...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: '#FEE2E2',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#DC2626',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: '#ffffff', fontSize: 18 }}>!</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#991B1B' }}>
                  Failed to load trips
                </Text>
                <Text style={{ fontSize: 12, color: '#B91C1C' }}>
                  {error?.data?.message || 'Please check your connection'}
                </Text>
              </View>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={{ color: '#DC2626', fontWeight: '600' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ padding: 16, gap: 24 }}>
          {/* In Progress Trips */}
          {inProgressTrips.length > 0 && (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MapPin size={18} color="#059669" />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Currently Traveling</Text>
              </View>
              <View style={{ gap: 12 }}>
                {inProgressTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onReopen={() => onReopenTrip(trip.id)}
                    onDelete={() => handleConfirmDelete(trip)}
                    onStartTrip={onStartTrip}
                  />
                ))}
              </View>
            </View>
          )}

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
                    onDelete={() => handleConfirmDelete(trip)}
                    onStartTrip={onStartTrip}
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
                    onDelete={() => handleConfirmDelete(trip)}
                    onStartTrip={onStartTrip}
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
                    onDelete={() => handleConfirmDelete(trip)}
                    onStartTrip={onStartTrip}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {!isLoading && normalizedTrips.length === 0 && !error && (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.input,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <MapPin size={32} color={colors.textSecondary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8, color: colors.text }}>No trips yet</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>
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
