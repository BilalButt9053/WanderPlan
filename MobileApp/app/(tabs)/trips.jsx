import React, { useState, useCallback } from 'react';
import { Alert, View, ActivityIndicator, Text } from 'react-native';
import TripHistoryScreen from '../screens/trip-history-screen';
import BudgetInputScreen from '../screens/budget-input-screen';
import GeneratedPlanScreen from '../screens/generated-plan-screen';
import ManualTripBuilderScreen from '../screens/manual-trip-builder-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectIsAuthenticated } from '../../redux/slices/authSlice';
import {
  useGetTripsQuery,
  useCreateTripMutation,
  useDeleteTripMutation,
} from '../../redux/api/tripsApi';
import {
  useGenerateItineraryMutation,
  useLazyGetItineraryQuery,
} from '../../redux/api/itineraryApi';

const trips = () => {
  const { colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('history');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);

  // Auth state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectCurrentToken);

  // RTK Query hooks
  const {
    data: tripsData,
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips,
  } = useGetTripsQuery({ includeItinerary: true }, { skip: !isAuthenticated });

  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [deleteTrip] = useDeleteTripMutation();
  const [generateItinerary, { isLoading: isGenerating }] = useGenerateItineraryMutation();
  const [triggerGetItinerary] = useLazyGetItineraryQuery();

  // Create new trip and generate itinerary
  const handleGeneratePlan = async (data) => {
    setBudgetData(data);

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create trips');
      return;
    }

    try {
      // Step 1: Create the trip
      const tripStartDate = data.startDate ? new Date(data.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const durationMs = parseInt(data.duration) * 24 * 60 * 60 * 1000;
      const tripEndDate = new Date(tripStartDate.getTime() + durationMs - 24 * 60 * 60 * 1000);
      
      const tripPayload = {
        title: `Trip to ${data.destination}`,
        destination: {
          name: data.destination,
          city: data.destination.split(',')[0]?.trim(),
          country: 'Pakistan',
        },
        startDate: tripStartDate.toISOString(),
        endDate: tripEndDate.toISOString(),
        totalBudget: parseInt(data.budget),
        currency: data.currency || 'PKR',
        travelers: 1,
        tripType: 'leisure',
      };

      const tripResult = await createTrip(tripPayload).unwrap();
      const tripId = tripResult.trip?._id || tripResult.data?._id;

      if (!tripId) {
        throw new Error('Trip creation failed - no ID returned');
      }

      // Refetch trips list to update display
      refetchTrips();

      setSelectedTrip({ ...tripResult.trip, _id: tripId });

      // Step 2: Generate itinerary for the trip
      Alert.alert('Success', 'Creating your personalized plan...');
      
      const itineraryResult = await generateItinerary({
        tripId,
        preferences: {
          travelStyle: 'moderate',
        },
      }).unwrap();

      setItineraryData(itineraryResult);
      setCurrentScreen('generated-plan');

    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert(
        'Error',
        error?.data?.message || error?.message || 'Failed to create trip. Please try again.'
      );
    }
  };

  const handleManualCreate = async (data) => {
    // For manual mode, we need to create the trip first, then go to builder
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to create trips');
      return;
    }

    if (!data?.destination || !data?.budget) {
      Alert.alert('Missing Info', 'Please fill in destination and budget first');
      return;
    }

    // Store budget data for the builder
    setBudgetData(data);

    try {
      // Create trip without generating itinerary
      const tripStartDate = data.startDate ? new Date(data.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const durationMs = parseInt(data.duration || 1) * 24 * 60 * 60 * 1000;
      const tripEndDate = new Date(tripStartDate.getTime() + durationMs - 24 * 60 * 60 * 1000);
      
      const tripPayload = {
        title: `Trip to ${data.destination}`,
        destination: {
          name: data.destination,
          city: data.destination.split(',')[0]?.trim(),
          country: 'Pakistan',
        },
        startDate: tripStartDate.toISOString(),
        endDate: tripEndDate.toISOString(),
        totalBudget: parseInt(data.budget),
        currency: data.currency || 'PKR',
        travelers: 1,
        tripType: 'leisure',
      };

      const tripResult = await createTrip(tripPayload).unwrap();
      const tripId = tripResult.trip?._id || tripResult.data?._id;

      if (!tripId) {
        throw new Error('Trip creation failed - no ID returned');
      }

      // Refetch trips list to update display
      refetchTrips();

      setSelectedTrip({ ...tripResult.trip, _id: tripId });
      setCurrentScreen('manual-builder');
    } catch (error) {
      console.error('Error creating trip for manual mode:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to create trip');
    }
  };

  // Handle manual itinerary saved
  const handleManualItinerarySaved = async () => {
    // Refetch trips list to show updated trip
    refetchTrips();
    
    if (selectedTrip?._id) {
      try {
        const result = await triggerGetItinerary(selectedTrip._id);
        if (result.data) {
          setItineraryData(result.data);
          setCurrentScreen('generated-plan');
        }
      } catch (error) {
        console.error('Error fetching saved itinerary:', error);
        // Still go back to history if fetch fails
        setCurrentScreen('history');
      }
    } else {
      setCurrentScreen('history');
    }
  };

  // Handle reopening an existing trip
  const handleReopenTrip = async (tripId) => {
    try {
      // Get trip details from cache or find in tripsData
      const trip = tripsData?.trips?.find(t => t._id === tripId);
      setSelectedTrip(trip);
      setBudgetData({
        budget: trip?.totalBudget?.toString() || '0',
        currency: trip?.currency || 'PKR',
        destination: trip?.destination?.name || 'Unknown',
        duration: trip?.durationDays?.toString() || '1',
      });

      // Try to fetch existing itinerary
      const result = await triggerGetItinerary(tripId);
      
      if (result.data?.itinerary) {
        setItineraryData(result.data);
        setCurrentScreen('generated-plan');
      } else {
        // No itinerary exists, offer to generate
        Alert.alert(
          'No Itinerary Found',
          'Would you like to generate an itinerary for this trip?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Generate',
              onPress: async () => {
                try {
                  const genResult = await generateItinerary({ tripId }).unwrap();
                  setItineraryData(genResult);
                  setCurrentScreen('generated-plan');
                } catch (err) {
                  Alert.alert('Error', err?.data?.message || 'Failed to generate itinerary');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening trip:', error);
      Alert.alert('Error', 'Failed to load trip details');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteTrip(tripId).unwrap();
      refetchTrips();
      Alert.alert('Deleted', 'Trip deleted successfully');
    } catch (error) {
      Alert.alert('Error', error?.data?.message || 'Failed to delete trip');
    }
  };

  const handleSaveTrip = () => {
    Alert.alert('Success', 'Trip saved successfully!');
    refetchTrips();
    setCurrentScreen('history');
    setSelectedTrip(null);
    setItineraryData(null);
  };

  const handleBack = () => {
    if (currentScreen === 'generated-plan' || currentScreen === 'manual-builder') {
      setCurrentScreen('budget-input');
      setItineraryData(null);
    } else {
      setCurrentScreen('history');
    }
  };

  const handleCreateNew = () => {
    setSelectedTrip(null);
    setItineraryData(null);
    setBudgetData(null);
    setCurrentScreen('budget-input');
  };

  // Loading overlay
  const renderLoadingOverlay = () => {
    if (!isGenerating && !isCreating) return null;
    
    return (
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <View style={{
          backgroundColor: colors.card,
          padding: 24,
          borderRadius: 16,
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 12, color: colors.text, fontSize: 16 }}>
            {isCreating ? 'Creating trip...' : 'Generating itinerary...'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {currentScreen === 'history' && (
        <TripHistoryScreen
          onCreateNew={handleCreateNew}
          onReopenTrip={handleReopenTrip}
          onDeleteTrip={handleDeleteTrip}
          trips={tripsData?.trips || []}
          isLoading={tripsLoading}
          onRefresh={refetchTrips}
          error={tripsError}
        />
      )}

      {currentScreen === 'budget-input' && (
        <BudgetInputScreen
          onGeneratePlan={handleGeneratePlan}
          onManualCreate={handleManualCreate}
          onBack={handleBack}
          isLoading={isCreating || isGenerating}
        />
      )}

      {currentScreen === 'generated-plan' && (budgetData || itineraryData) && (
        <GeneratedPlanScreen
          budgetData={budgetData}
          itineraryData={itineraryData}
          tripId={selectedTrip?._id}
          onBack={handleBack}
          onSave={handleSaveTrip}
          onRefresh={() => triggerGetItinerary(selectedTrip?._id)}
        />
      )}

      {currentScreen === 'manual-builder' && (
        <ManualTripBuilderScreen
          onBack={handleBack}
          onSave={handleSaveTrip}
          tripId={selectedTrip?._id}
          budgetData={budgetData}
          onItinerarySaved={handleManualItinerarySaved}
        />
      )}

      {renderLoadingOverlay()}
    </SafeAreaView>
  );
};

export default trips;