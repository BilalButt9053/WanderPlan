import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import  TripHistoryScreen  from '../screens/trip-history-screen';
import  BudgetInputScreen  from '../screens/budget-input-screen';
import  GeneratedPlanScreen  from '../screens/generated-plan-screen';
import  ManualTripBuilderScreen  from '../screens/manual-trip-builder-screen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
const trips = () => {
  const { colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState('history');
  const [budgetData, setBudgetData] = useState(null);

  const handleCreateNew = () => {
    setCurrentScreen('budget-input');
  };

  const handleGeneratePlan = (data) => {
    setBudgetData(data);
    // Simulate AI generation delay
    Alert.alert('Success', 'Generating your personalized plan...');
    setTimeout(() => {
      setCurrentScreen('generated-plan');
    }, 1000);
  };

  const handleManualCreate = () => {
    setCurrentScreen('manual-builder');
  };

  const handleSaveTrip = () => {
    Alert.alert('Success', 'Trip saved successfully!');
    setCurrentScreen('history');
  };

  const handleReopenTrip = (tripId) => {
    // In a real app, would load trip data and show appropriate screen
    Alert.alert('Info', `Opening trip ${tripId}...`);
    setCurrentScreen('generated-plan');
  };

  const handleBack = () => {
    if (currentScreen === 'generated-plan' || currentScreen === 'manual-builder') {
      setCurrentScreen('budget-input');
    } else {
      setCurrentScreen('history');
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      {currentScreen === 'history' && (
        <TripHistoryScreen
          onCreateNew={handleCreateNew}
          onReopenTrip={handleReopenTrip}
        />
      )}

      {currentScreen === 'budget-input' && (
        <BudgetInputScreen
          onGeneratePlan={handleGeneratePlan}
          onManualCreate={handleManualCreate}
          onBack={handleBack}
        />
      )}

      {currentScreen === 'generated-plan' && budgetData && (
        <GeneratedPlanScreen
          budgetData={budgetData}
          onBack={handleBack}
          onSave={handleSaveTrip}
        />
      )}

      {currentScreen === 'manual-builder' && (
        <ManualTripBuilderScreen
          onBack={handleBack}
          onSave={handleSaveTrip}
        />
      )}
    </SafeAreaView>
  );
};

export default trips;