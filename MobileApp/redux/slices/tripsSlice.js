import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTrip: null,
  activeTripItinerary: null,
  currentDay: 1,
  isTripMode: false,
  navigationState: {
    isNavigating: false,
    currentActivityIndex: 0,
    nextActivity: null,
  },
  transportMode: 'car', // 'car' | 'bike'
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
      state.currentDay = 1;
      state.isTripMode = true;
      state.navigationState = {
        isNavigating: true,
        currentActivityIndex: 0,
        nextActivity: null,
      };
    },
    setActiveTripItinerary: (state, action) => {
      state.activeTripItinerary = action.payload;
    },
    setCurrentDay: (state, action) => {
      state.currentDay = action.payload;
      state.navigationState.currentActivityIndex = 0;
    },
    setTripMode: (state, action) => {
      state.isTripMode = Boolean(action.payload);
    },
    setTransportMode: (state, action) => {
      state.transportMode = action.payload;
    },
    updateNavigationState: (state, action) => {
      state.navigationState = {
        ...state.navigationState,
        ...action.payload,
      };
    },
    moveToNextActivity: (state) => {
      state.navigationState.currentActivityIndex += 1;
    },
    addActivityToActiveTrip: (state, action) => {
      const itinerary = state.activeTripItinerary?.itinerary;

      if (Array.isArray(itinerary)) {
        itinerary.push(action.payload);
        return;
      }

      if (itinerary?.days) {
        const dayIndex = itinerary.days.findIndex((d) => d.day === state.currentDay);
        if (dayIndex >= 0) {
          itinerary.days[dayIndex].activities.push(action.payload);
        }
      }
    },
    updateActiveTripBudget: (state, action) => {
      if (state.activeTrip) {
        const { category, amount } = action.payload;
        if (state.activeTrip.budgetBreakdown?.[category]) {
          state.activeTrip.budgetBreakdown[category].spent =
            (state.activeTrip.budgetBreakdown[category].spent || 0) + amount;
        }
        state.activeTrip.totalSpent = (state.activeTrip.totalSpent || 0) + amount;
      }
    },
    clearActiveTrip: (state) => {
      state.activeTrip = null;
      state.activeTripItinerary = null;
      state.currentDay = 1;
      state.isTripMode = false;
      state.navigationState = {
        isNavigating: false,
        currentActivityIndex: 0,
        nextActivity: null,
      };
    },
  },
});

export const {
  setActiveTrip,
  setActiveTripItinerary,
  setCurrentDay,
  setTripMode,
  setTransportMode,
  updateNavigationState,
  moveToNextActivity,
  addActivityToActiveTrip,
  updateActiveTripBudget,
  clearActiveTrip,
} = tripsSlice.actions;

// Selectors
export const selectActiveTrip = (state) => state.trips?.activeTrip;
export const selectActiveTripItinerary = (state) => state.trips?.activeTripItinerary;
export const selectCurrentDay = (state) => state.trips?.currentDay || 1;
export const selectIsTripMode = (state) => state.trips?.isTripMode || false;
export const selectTransportMode = (state) => state.trips?.transportMode || 'car';
export const selectNavigationState = (state) => state.trips?.navigationState;
export const selectCurrentDayActivities = (state) => {
  const itinerary = state.trips?.activeTripItinerary?.itinerary;
  const day = state.trips?.currentDay || 1;
  if (Array.isArray(itinerary)) {
    return itinerary.filter((item) => Number(item?.day) === Number(day));
  }
  if (!itinerary?.days) return [];
  const dayData = itinerary.days.find((d) => d.day === day);
  return dayData?.activities || [];
};

export default tripsSlice.reducer;
