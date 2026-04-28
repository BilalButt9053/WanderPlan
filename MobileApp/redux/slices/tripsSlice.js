import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTrip: null,
  activeTripItinerary: null,
  currentDay: 1,
  isTripMode: false,
  activeDayRoute: null,
  routeStatus: 'idle',
  routeError: null,
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
      state.activeDayRoute = null;
      state.routeStatus = 'idle';
      state.routeError = null;
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
      state.activeDayRoute = null;
      state.routeStatus = 'idle';
      state.routeError = null;
    },
    setTripMode: (state, action) => {
      state.isTripMode = Boolean(action.payload);
    },
    setTransportMode: (state, action) => {
      state.transportMode = action.payload;
      state.activeDayRoute = null;
      state.routeStatus = 'idle';
      state.routeError = null;
    },
    setActiveDayRoute: (state, action) => {
      state.activeDayRoute = action.payload;
      state.routeStatus = action.payload ? 'succeeded' : 'idle';
      state.routeError = null;
    },
    clearActiveDayRoute: (state) => {
      state.activeDayRoute = null;
      state.routeStatus = 'idle';
      state.routeError = null;
    },
    setRouteStatus: (state, action) => {
      state.routeStatus = action.payload;
    },
    setRouteError: (state, action) => {
      state.routeError = action.payload;
      state.routeStatus = action.payload ? 'failed' : state.routeStatus;
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
    setActiveTripBudget: (state, action) => {
      if (!state.activeTrip) return;
      const budget = action.payload || {};
      if (budget.totalSpent !== undefined) {
        state.activeTrip.totalSpent = budget.totalSpent;
      }
      if (budget.remainingBudget !== undefined) {
        state.activeTrip.remainingBudget = budget.remainingBudget;
      }
      if (budget.budgetBreakdown || budget.breakdown) {
        state.activeTrip.budgetBreakdown = budget.budgetBreakdown || budget.breakdown;
      }
    },
    clearActiveTrip: (state) => {
      state.activeTrip = null;
      state.activeTripItinerary = null;
      state.currentDay = 1;
      state.isTripMode = false;
      state.activeDayRoute = null;
      state.routeStatus = 'idle';
      state.routeError = null;
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
  setActiveDayRoute,
  clearActiveDayRoute,
  setRouteStatus,
  setRouteError,
  updateNavigationState,
  moveToNextActivity,
  addActivityToActiveTrip,
  updateActiveTripBudget,
  setActiveTripBudget,
  clearActiveTrip,
} = tripsSlice.actions;

// Selectors
export const selectActiveTrip = (state) => state.trips?.activeTrip;
export const selectActiveTripItinerary = (state) => state.trips?.activeTripItinerary;
export const selectCurrentDay = (state) => state.trips?.currentDay || 1;
export const selectIsTripMode = (state) => state.trips?.isTripMode || false;
export const selectTransportMode = (state) => state.trips?.transportMode || 'car';
export const selectActiveDayRoute = (state) => state.trips?.activeDayRoute;
export const selectRouteStatus = (state) => state.trips?.routeStatus || 'idle';
export const selectRouteError = (state) => state.trips?.routeError;
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
