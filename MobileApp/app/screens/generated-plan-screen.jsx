/**
 * Generated Plan Screen - Displays itinerary from backend
 * 
 * Features:
 * - Shows day-wise itinerary with activities
 * - Displays budget breakdown and remaining budget
 * - Edit mode: add/remove activities, update costs
 * - Regenerate itinerary option
 * - Commit budget to trip
 * - Pull to refresh
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
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
  Bookmark,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Car,
  ShoppingBag,
  Music,
  Sparkles,
  Building2,
  Edit3,
  Trash2,
  Plus,
  X,
  Save,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WanderCard } from '../components/wander-card';
import { useTheme } from '../../hooks/useTheme';
import {
  useRegenerateItineraryMutation,
  useCommitBudgetMutation,
  useUpdateItineraryMutation,
} from '../../redux/api/itineraryApi';
import { useGetTripQuery } from '../../redux/api/tripsApi';

// Map activity types to icons
const getActivityIcon = (type) => {
  const iconMap = {
    hotel: Hotel,
    accommodation: Hotel,
    food: UtensilsCrossed,
    restaurant: UtensilsCrossed,
    attraction: Palmtree,
    leisure: Palmtree,
    transport: Car,
    shopping: ShoppingBag,
    entertainment: Music,
    other: MapPin,
  };
  return iconMap[type?.toLowerCase()] || MapPin;
};

// Map source to badge
const getSourceBadge = (source) => {
  if (source === 'business') {
    return { label: 'Partner', color: '#059669', bg: '#D1FAE5' };
  }
  if (source === 'user') {
    return { label: 'Custom', color: '#F59E0B', bg: '#FEF3C7' };
  }
  if (source === 'fallback') {
    return { label: 'Default', color: '#6B7280', bg: '#F3F4F6' };
  }
  return { label: 'AI', color: '#3B82F6', bg: '#DBEAFE' };
};

// Budget category colors
const categoryColors = {
  accommodation: '#F2994A',
  food: '#27AE60',
  transport: '#2F80ED',
  activities: '#9B51E0',
};

export default function GeneratedPlanScreen({ 
  budgetData, 
  itineraryData, 
  tripId,
  onBack, 
  onSave,
  onRefresh,
}) {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDays, setEditedDays] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addToDay, setAddToDay] = useState(null);
  const [newActivity, setNewActivity] = useState({ title: '', type: 'attraction', estimatedCost: '', time: '', location: '' });
  
  // RTK Query mutations
  const [regenerateItinerary, { isLoading: isRegenerating }] = useRegenerateItineraryMutation();
  const [commitBudget, { isLoading: isCommitting }] = useCommitBudgetMutation();
  const [updateItinerary, { isLoading: isUpdating }] = useUpdateItineraryMutation();
  const { data: tripData } = useGetTripQuery(tripId, { skip: !tripId });

  // Extract data from itineraryData or use budgetData as fallback
  // Handle both generate response (root level) and fetch response (in itinerary document)
  // Destination can be a string or an object with {name, city, country, coordinates}
  const rawDestination = itineraryData?.destination || itineraryData?.itinerary?.destination || budgetData?.destination || 'Unknown';
  const destination = typeof rawDestination === 'object' ? (rawDestination.name || rawDestination.city || 'Unknown') : rawDestination;
  const currency = itineraryData?.budgetInfo?.currency || itineraryData?.itinerary?.currency || budgetData?.currency || 'PKR';
  const totalBudget =
    tripData?.trip?.totalBudget ||
    itineraryData?.budgetInfo?.totalBudget ||
    itineraryData?.itinerary?.totalBudget ||
    parseInt(budgetData?.budget) ||
    0;
  const totalDays = itineraryData?.days || itineraryData?.itinerary?.totalDays || parseInt(budgetData?.duration) || 1;
  
  // Handle different API response structures:
  // - Generate/Regenerate: itinerary is the days array directly
  // - Get Existing: itinerary is a document with 'days' property
  const getItineraryDays = () => {
    if (editedDays) return editedDays;
    
    const itinerary = itineraryData?.itinerary;
    if (!itinerary) return [];
    
    // If itinerary is an array, use it directly
    if (Array.isArray(itinerary)) return itinerary;
    
    // If itinerary is a document with days property
    if (itinerary.days && Array.isArray(itinerary.days)) return itinerary.days;
    
    return [];
  };
  
  // Use edited days if in edit mode, otherwise use original
  const currentDays = getItineraryDays();
  
  // After a successful refresh (server copy updated), drop the local edited override.
  useEffect(() => {
    if (!isEditMode) setEditedDays(null);
  }, [itineraryData, isEditMode]);

  // Itinerary days from API or edited state
  const itineraryDays = useMemo(() => {
    const days = currentDays;
    return days.map(day => ({
      day: day.day,
      items: day.activities?.map((activity, idx) => {
        // Location can be string or object {name, address, coordinates}
        const rawLocation = activity.location;
        const locationStr = typeof rawLocation === 'object' 
          ? (rawLocation?.name || rawLocation?.address || '') 
          : (rawLocation || '');
        
        return {
          id: activity._id || `${day.day}_${idx}`,
          time: activity.time || '',
          title: activity.title,
          type: activity.type || activity.category || 'other',
          location: locationStr,
          price: activity.actualCost ?? activity.estimatedCost ?? 0,
          source: activity.source || 'ai',
          category: activity.category || 'activities',
          description: activity.description || '',
        };
      }) || [],
    }));
  }, [currentDays]);

  // Calculate estimated costs dynamically
  const calculatedCosts = useMemo(() => {
    const costs = { accommodation: 0, food: 0, transport: 0, activities: 0, total: 0 };
    
    for (const day of currentDays) {
      for (const activity of (day.activities || [])) {
        const category = activity.category || 'activities';
        // Activity-driven spending:
        // Use actualCost if present, otherwise estimatedCost.
        const cost = activity.actualCost ?? activity.estimatedCost ?? activity.price ?? 0;
        costs[category] = (costs[category] || 0) + cost;
        costs.total += cost;
      }
    }
    
    return costs;
  }, [currentDays]);

  const estimatedCosts = calculatedCosts;
  const plannedBreakdown = tripData?.trip?.budgetBreakdown || null;

  const categoryBreakdown = useMemo(() => {
    const categories = [
      { key: 'accommodation', label: 'Accommodation' },
      { key: 'food', label: 'Food' },
      { key: 'transport', label: 'Transport' },
      { key: 'activities', label: 'Activities' },
    ];

    const safeTotalBudget = Math.max(totalBudget, 1);

    return categories.map(({ key, label }) => {
      const spent = estimatedCosts[key] || 0;
      const actualPct = Math.round((spent / safeTotalBudget) * 100);

      const plannedPct =
        plannedBreakdown?.[key]?.percentage ??
        (key === 'accommodation' ? 40 : key === 'food' ? 25 : key === 'transport' ? 20 : 15);

      const isOver = actualPct > plannedPct;
      const overBy = isOver ? actualPct - plannedPct : 0;

      return {
        key,
        label,
        spent,
        actualPct,
        plannedPct,
        isOver,
        overBy,
        color: isOver ? '#DC2626' : '#059669',
        barColor: isOver ? '#DC2626' : (categoryColors[key] || '#3B82F6'),
      };
    });
  }, [estimatedCosts, plannedBreakdown, totalBudget]);

  const budgetWarnings = useMemo(() => {
    return categoryBreakdown
      .filter((c) => c.isOver)
      .map((c) => `⚠️ You exceeded ${c.label} budget by ${c.overBy}%`);
  }, [categoryBreakdown]);

  // Remaining budget
  const remainingBudget = totalBudget - estimatedCosts.total;
  const isOverBudget = remainingBudget < 0;
  const overByAmount = isOverBudget ? Math.abs(remainingBudget) : 0;
  const underByAmount = !isOverBudget ? remainingBudget : 0;


  // Enter edit mode
  const handleEnterEditMode = () => {
    // itineraryData.itinerary can be either:
    // - an array of days (generate/regenerate responses)
    // - a document containing { days: [...] } (get existing response)
    // Use currentDays which already normalizes both cases.
    const daysToEdit = Array.isArray(currentDays) ? currentDays : [];
    setEditedDays(daysToEdit.map((d) => ({ ...d, activities: [...(d.activities || [])] })));
    setIsEditMode(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditedDays(null);
    setIsEditMode(false);
  };

  // Save edited itinerary
  const handleSaveEdit = async () => {
    if (!tripId || !editedDays) return;

    try {
      await updateItinerary({ tripId, days: editedDays }).unwrap();
      Alert.alert('Success', 'Itinerary updated successfully!');
      setIsEditMode(false);
      // Keep editedDays as the visible source until refreshed data arrives.
      await onRefresh?.();
    } catch (error) {
      Alert.alert('Error', error?.data?.message || 'Failed to save changes');
    }
  };

  // Remove activity from a day
  const handleRemoveActivity = (dayNum, activityIndex) => {
    if (!editedDays) return;

    const newDays = editedDays.map(day => {
      if (day.day === dayNum) {
        const newActivities = [...day.activities];
        newActivities.splice(activityIndex, 1);
        return { ...day, activities: newActivities };
      }
      return day;
    });
    setEditedDays(newDays);
  };

  // Update activity cost
  const handleUpdateActivityCost = (dayNum, activityIndex, newCost) => {
    if (!editedDays) return;

    const newDays = editedDays.map(day => {
      if (day.day === dayNum) {
        const newActivities = day.activities.map((activity, idx) => {
          if (idx === activityIndex) {
            return { ...activity, estimatedCost: parseInt(newCost) || 0 };
          }
          return activity;
        });
        return { ...day, activities: newActivities };
      }
      return day;
    });
    setEditedDays(newDays);
  };

  // Open add activity modal
  const handleOpenAddModal = (dayNum) => {
    setAddToDay(dayNum);
    setNewActivity({ title: '', type: 'attraction', estimatedCost: '', time: '', location: '' });
    setShowAddModal(true);
  };

  // Add new activity to day
  const handleAddActivity = () => {
    if (!editedDays || !newActivity.title || !addToDay) return;

    const activityToAdd = {
      title: newActivity.title,
      type: newActivity.type,
      category: getCategory(newActivity.type),
      estimatedCost: parseInt(newActivity.estimatedCost) || 0,
      time: newActivity.time,
      location: newActivity.location,
      source: 'user',
      description: '',
    };

    const newDays = editedDays.map(day => {
      if (day.day === addToDay) {
        return { ...day, activities: [...day.activities, activityToAdd] };
      }
      return day;
    });

    setEditedDays(newDays);
    setShowAddModal(false);
    setAddToDay(null);
  };

  // Get category from type
  const getCategory = (type) => {
    const categoryMap = {
      hotel: 'accommodation',
      accommodation: 'accommodation',
      food: 'food',
      restaurant: 'food',
      transport: 'transport',
      car: 'transport',
    };
    return categoryMap[type?.toLowerCase()] || 'activities';
  };

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${totalDays}-day trip plan to ${destination}!`,
        title: `Trip to ${destination}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Handle regenerate
  const handleRegenerate = async () => {
    if (!tripId) {
      Alert.alert('Error', 'No trip selected');
      return;
    }

    Alert.alert(
      'Regenerate Itinerary',
      'This will create a new itinerary. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              const res = await regenerateItinerary({ tripId, forceAI: true }).unwrap();
              Alert.alert('Success', 'Itinerary regenerated!');
              onRefresh?.();
            } catch (error) {
              Alert.alert('Error', error?.data?.message || 'Failed to regenerate');
            }
          },
        },
      ]
    );
  };

  const handleRegenerateCheaper = async () => {
    if (!tripId) {
      Alert.alert('Error', 'No trip selected');
      return;
    }

    Alert.alert(
      'Regenerate Cheaper Plan',
      `We’ll regenerate using budget-friendly options to reduce the estimated cost by approximately ${currency} ${overByAmount.toLocaleString()}. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              await regenerateItinerary({ tripId, forceAI: true, travelStyle: 'budget' }).unwrap();
              Alert.alert('Success', 'Generated a cheaper itinerary!');
              onRefresh?.();
            } catch (error) {
              Alert.alert('Error', error?.data?.message || 'Failed to regenerate');
            }
          },
        },
      ]
    );
  };

  // Handle commit budget
  const handleCommitBudget = async () => {
    if (!tripId) {
      Alert.alert('Error', 'No trip selected');
      return;
    }

    Alert.alert(
      'Commit to Budget',
      `This will commit your itinerary’s activity costs (${currency} ${estimatedCosts.total || 0}) into your trip’s budget tracking. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Commit',
          onPress: async () => {
            try {
              await commitBudget(tripId).unwrap();
              Alert.alert('Success', 'Budget committed to trip!');
              onRefresh?.();
            } catch (error) {
              Alert.alert('Error', error?.data?.message || 'Failed to commit budget');
            }
          },
        },
      ]
    );
  };

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
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
                backgroundColor: colors.input,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Your Trip Plan</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{destination}</Text>
            </View>
          </View>
          
          {/* Edit / Regenerate buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {isEditMode ? (
              <>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#FEE2E2',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} color="#DC2626" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  disabled={isUpdating}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: '#D1FAE5',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Save size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleEnterEditMode}
                  disabled={!itineraryData?.itinerary}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.input,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: !itineraryData?.itinerary ? 0.5 : 1
                  }}
                >
                  <Edit3 size={20} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRegenerate}
                  disabled={isRegenerating}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: colors.input,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isRegenerating ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <RefreshCw size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Budget Overview */}
        <View style={{
          backgroundColor: isOverBudget ? '#DC2626' : '#3B82F6',
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
              backgroundColor: 'rgba(255,255,255,0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
              {isOverBudget ? (
                <AlertTriangle size={12} color="#ffffff" />
              ) : (
                <CheckCircle size={12} color="#ffffff" />
              )}
              <Text style={{ fontSize: 12, color: '#ffffff', fontWeight: '600' }}>
                {totalDays} days
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>
            {currency} {totalBudget.toLocaleString()}
          </Text>
          
          {/* Spent vs Remaining */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Total Spent</Text>
              <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '600' }}>
                {currency} {(estimatedCosts.total || 0).toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Remaining</Text>
              <Text style={{ fontSize: 16, color: '#ffffff', fontWeight: '600' }}>
                {isOverBudget
                  ? `Over by ${currency} ${overByAmount.toLocaleString()}`
                  : `${currency} ${underByAmount.toLocaleString()}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Insight Banner (AI vs Budget) */}
        {tripId && (
          <WanderCard>
            {isOverBudget ? (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={18} color="#DC2626" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                      Over budget by {currency} {overByAmount.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                      This is based on the itinerary’s estimated costs. You can regenerate a cheaper plan.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleRegenerateCheaper}
                  disabled={isRegenerating}
                  style={{
                    backgroundColor: '#DC2626',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: isRegenerating ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {isRegenerating ? 'Regenerating...' : 'Regenerate Cheaper Plan'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={18} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                      Within budget
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                      You still have {currency} {underByAmount.toLocaleString()} available based on itinerary estimates.
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    disabled={isRegenerating}
                    style={{
                      flex: 1,
                      backgroundColor: colors.input,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isRegenerating ? 0.7 : 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: '700' }}>
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => regenerateItinerary({ tripId, forceAI: true, travelStyle: 'luxury' }).unwrap()
                      .then(() => { Alert.alert('Success', 'Generated an upgraded itinerary!'); onRefresh?.(); })
                      .catch((error) => Alert.alert('Error', error?.data?.message || 'Failed to regenerate'))}
                    disabled={isRegenerating}
                    style={{
                      flex: 1,
                      backgroundColor: '#3B82F6',
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: 'center',
                      opacity: isRegenerating ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Upgrade Plan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </WanderCard>
        )}

        {/* 💰 Budget Overview (single unified budget system) */}
        <WanderCard>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text }}>
            💰 Budget Overview
          </Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.input }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Budget</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                {currency} {Number(totalBudget || 0).toLocaleString()}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.input }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Total Spent</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                {currency} {Number(estimatedCosts.total || 0).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.input }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Remaining Budget
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: isOverBudget ? '#DC2626' : '#059669' }}>
              {isOverBudget
                ? `Over by ${currency} ${Number(overByAmount || 0).toLocaleString()}`
                : `${currency} ${Number(underByAmount || 0).toLocaleString()}`}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
              Based on itinerary activities (uses actualCost if provided, otherwise estimatedCost).
            </Text>
          </View>
        </WanderCard>

        {/* Category breakdown (actual vs planned %) */}
        <WanderCard>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12, color: colors.text }}>
            📊 Category Breakdown
          </Text>

          <View style={{ gap: 12 }}>
            {categoryBreakdown.map((cat) => {
              const pctForBar = Math.min(Math.max(cat.actualPct, 0), 100);
              return (
                <View key={cat.key} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                      {cat.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: cat.isOver ? '#DC2626' : '#059669' }}>
                      {cat.actualPct}% (Planned: {cat.plannedPct}%){cat.isOver ? '  ⚠️' : '  ✅'}
                    </Text>
                  </View>

                  <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.input, overflow: 'hidden' }}>
                    <View
                      style={{
                        width: `${pctForBar}%`,
                        height: '100%',
                        backgroundColor: cat.barColor,
                      }}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Spent: {currency} {Number(cat.spent || 0).toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 12, color: cat.isOver ? '#DC2626' : colors.textSecondary }}>
                      {cat.isOver ? `Over budget by ${cat.overBy}%` : 'Within plan'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {budgetWarnings.length > 0 && (
            <View style={{ marginTop: 14, gap: 8 }}>
              {budgetWarnings.map((w, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    padding: 12,
                    backgroundColor: '#FEF3C7',
                    borderRadius: 12,
                  }}
                >
                  <AlertTriangle size={16} color="#D97706" />
                  <Text style={{ fontSize: 13, color: '#92400E', flex: 1 }}>{w}</Text>
                </View>
              ))}
            </View>
          )}
        </WanderCard>

        {/* Stats */}
        {itineraryData?.stats && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{
              flex: 1,
              backgroundColor: '#DBEAFE',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Building2 size={24} color="#3B82F6" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#1E40AF', marginTop: 4 }}>
                {itineraryData.stats.businessActivities || 0}
              </Text>
              <Text style={{ fontSize: 12, color: '#3B82F6' }}>Partner Places</Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#EDE9FE',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Sparkles size={24} color="#7C3AED" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#5B21B6', marginTop: 4 }}>
                {itineraryData.stats.aiActivities || 0}
              </Text>
              <Text style={{ fontSize: 12, color: '#7C3AED' }}>AI Suggestions</Text>
            </View>
          </View>
        )}

        {/* Itinerary by Day */}
        <View>
          <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 16, color: colors.text }}>
            Daily Itinerary
          </Text>
          
          {itineraryDays.length === 0 ? (
            <WanderCard>
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <MapPin size={48} color={colors.textSecondary} />
                <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12 }}>
                  No activities yet
                </Text>
                <TouchableOpacity
                  onPress={handleRegenerate}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    backgroundColor: '#3B82F6',
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Generate Itinerary</Text>
                </TouchableOpacity>
              </View>
            </WanderCard>
          ) : (
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
                    borderBottomColor: colors.border,
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
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Day {day.day}</Text>
                  </View>

                  <View style={{ gap: 12 }}>
                    {day.items.map((item, idx) => {
                      const Icon = getActivityIcon(item.type);
                      
                      return (
                        <View
                          key={item.id || idx}
                          style={{
                            flexDirection: 'row',
                            gap: 12,
                            padding: 12,
                            borderRadius: 12,
                            backgroundColor: colors.input,
                            borderWidth: isEditMode ? 2 : 0,
                            borderColor: isEditMode ? '#F59E0B' : 'transparent',
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
                            {item.time && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Clock size={10} color={colors.textSecondary} />
                                <Text style={{ fontSize: 11, color: colors.textSecondary }}>{item.time}</Text>
                              </View>
                            )}
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 }} numberOfLines={1}>
                                {item.title}
                              </Text>
                              {/* Delete button in edit mode */}
                              {isEditMode && (
                                <TouchableOpacity
                                  onPress={() => handleRemoveActivity(day.day, idx)}
                                  style={{
                                    padding: 4,
                                    marginLeft: 4,
                                  }}
                                >
                                  <Trash2 size={16} color="#DC2626" />
                                </TouchableOpacity>
                              )}
                            </View>
                            
                            {item.location && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <MapPin size={12} color={colors.textSecondary} />
                                <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }} numberOfLines={1}>
                                  {item.location}
                                </Text>
                              </View>
                            )}
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <DollarSign size={14} color="#059669" />
                              {isEditMode ? (
                                <TextInput
                                  value={String(item.price || 0)}
                                  onChangeText={(text) => handleUpdateActivityCost(day.day, idx, text)}
                                  keyboardType="numeric"
                                  style={{
                                    backgroundColor: '#D1FAE5',
                                    borderRadius: 6,
                                    paddingHorizontal: 8,
                                    paddingVertical: 4,
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#059669',
                                    minWidth: 70,
                                  }}
                                />
                              ) : (
                                <Text style={{ fontSize: 14, color: '#059669', fontWeight: '600' }}>
                                  {currency} {item.price?.toLocaleString() || 0}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    
                    {/* Add Activity Button in edit mode */}
                    {isEditMode && (
                      <TouchableOpacity
                        onPress={() => handleOpenAddModal(day.day)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: 12,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: '#3B82F6',
                          borderStyle: 'dashed',
                        }}
                      >
                        <Plus size={18} color="#3B82F6" />
                        <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Add Activity</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </WanderCard>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ gap: 12, paddingTop: 16 }}>
          {/* Commit Budget Button */}
          {tripId && !itineraryData?.itinerary?.budgetCommitted && (
            <TouchableOpacity
              onPress={handleCommitBudget}
              disabled={isCommitting}
              style={{
                backgroundColor: '#059669',
                paddingVertical: 16,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: isCommitting ? 0.7 : 1,
              }}
            >
              {isCommitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <CheckCircle size={20} color="#ffffff" />
              )}
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Commit to Budget
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
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
                backgroundColor: colors.card,
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
        </View>
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text }}>Add Activity</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>Activity Name *</Text>
                <TextInput
                  value={newActivity.title}
                  onChangeText={(text) => setNewActivity({ ...newActivity, title: text })}
                  placeholder="e.g., Visit Faisal Mosque"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.input,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>Type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['attraction', 'food', 'hotel', 'transport'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNewActivity({ ...newActivity, type })}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: newActivity.type === type ? '#3B82F6' : colors.input,
                        }}
                      >
                        <Text style={{
                          fontSize: 13,
                          color: newActivity.type === type ? '#fff' : colors.text,
                          textTransform: 'capitalize',
                        }}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>Estimated Cost (PKR)</Text>
                  <TextInput
                    value={newActivity.estimatedCost}
                    onChangeText={(text) => setNewActivity({ ...newActivity, estimatedCost: text })}
                    placeholder="500"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.input,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>Time (optional)</Text>
                  <TextInput
                    value={newActivity.time}
                    onChangeText={(text) => setNewActivity({ ...newActivity, time: text })}
                    placeholder="10:00 AM"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      backgroundColor: colors.input,
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 16,
                      color: colors.text,
                    }}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>Location (optional)</Text>
                <TextInput
                  value={newActivity.location}
                  onChangeText={(text) => setNewActivity({ ...newActivity, location: text })}
                  placeholder="e.g., F-6, Islamabad"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.input,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 16,
                    color: colors.text,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleAddActivity}
                disabled={!newActivity.title}
                style={{
                  backgroundColor: '#3B82F6',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  opacity: !newActivity.title ? 0.5 : 1,
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
