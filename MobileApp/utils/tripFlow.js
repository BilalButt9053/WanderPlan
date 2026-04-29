import {
  setActiveTrip,
  setActiveTripItinerary,
  setTripMode,
  setActiveDayRoute,
  setRouteError,
  setRouteStatus,
} from '../redux/slices/tripsSlice';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractLatitude = (item) =>
  toNumber(
    item?.location?.coordinates?.lat ??
      item?.location?.coordinates?.latitude ??
      item?.location?.lat ??
      item?.location?.latitude ??
      item?.latitude ??
      item?.lat ??
      item?.coordinates?.lat ??
      item?.coordinates?.latitude
  );

const extractLongitude = (item) =>
  toNumber(
    item?.location?.coordinates?.lng ??
      item?.location?.coordinates?.longitude ??
      item?.location?.lng ??
      item?.location?.longitude ??
      item?.longitude ??
      item?.lng ??
      item?.coordinates?.lng ??
      item?.coordinates?.longitude
  );

const extractCost = (item) =>
  toNumber(item?.cost ?? item?.actualCost ?? item?.estimatedCost ?? item?.price ?? 0) ?? 0;

const extractName = (item) => item?.name || item?.title || item?.activity || item?.label || 'Untitled Place';

export const getActivityCoordinate = (item) => {
  const lat = extractLatitude(item);
  const lng = extractLongitude(item);

  if (lat === null || lng === null) return null;
  return { lat, lng, latitude: lat, longitude: lng };
};

const normalizeLocation = (item, coordinates) => {
  const rawLocation = item?.location;
  const isObject = rawLocation && typeof rawLocation === 'object' && !Array.isArray(rawLocation);
  const name = isObject
    ? rawLocation.name || rawLocation.address || extractName(item)
    : rawLocation || extractName(item);

  return {
    ...(isObject ? rawLocation : {}),
    name,
    address: (isObject ? rawLocation.address : rawLocation) || item?.address || '',
    placeId: (isObject ? rawLocation.placeId : null) || item?.placeId || null,
    coordinates: {
      lat: coordinates?.lat ?? null,
      lng: coordinates?.lng ?? null,
    },
  };
};

const normalizeItem = (item, fallbackDay = 1, index = 0) => {
  const coordinates = getActivityCoordinate(item);

  return {
    ...item,
    id: item?.id || item?._id || item?.placeId || `${fallbackDay}-${index}`,
    name: extractName(item),
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
    location: normalizeLocation(item, coordinates),
    day: Number(item?.day ?? fallbackDay ?? 1),
    cost: extractCost(item),
  };
};

export function normalizeItinerary(items = []) {
  if (!items) return [];

  if (Array.isArray(items)) {
    if (items.some((item) => Array.isArray(item?.activities))) {
      return items.flatMap((day, dayIndex) => {
        const activities = Array.isArray(day?.activities) ? day.activities : [];
        return activities.map((activity, activityIndex) =>
          normalizeItem(activity, day?.day ?? dayIndex + 1, activityIndex)
        );
      });
    }

    return items.map((item, index) => normalizeItem(item, item?.day ?? 1, index));
  }

  if (Array.isArray(items?.days)) {
    return items.days.flatMap((day, dayIndex) => {
      const activities = Array.isArray(day?.activities) ? day.activities : [];
      return activities.map((activity, activityIndex) =>
        normalizeItem(activity, day?.day ?? dayIndex + 1, activityIndex)
      );
    });
  }

  if (Array.isArray(items?.itinerary)) {
    return normalizeItinerary(items.itinerary);
  }

  if (Array.isArray(items?.itinerary?.days)) {
    return normalizeItinerary(items.itinerary.days);
  }

  return [];
}

export async function startTripFlow({
  trip,
  tripId,
  itinerary,
  startTrip,
  dispatch,
  navigation,
  getDayRoute,
  currentLocation,
  day = 1,
  travelMode = 'driving',
}) {
  console.log('Trip:', trip);

  let activeTrip = trip || null;
  let normalizedItinerary = normalizeItinerary(itinerary || trip?.itinerary || trip?.days || []);

  console.log('Itinerary:', normalizedItinerary);

  if (!activeTrip?.isStarted && activeTrip?.status !== 'ongoing') {
    if (!tripId || !startTrip) {
      throw new Error('Trip cannot be started right now');
    }

    const result = await startTrip(tripId).unwrap();
    activeTrip = result?.trip || activeTrip;
    normalizedItinerary = normalizeItinerary(result?.itinerary || itinerary || activeTrip?.itinerary || []);
  }

  await dispatch(setActiveTrip(activeTrip));
  await dispatch(setActiveTripItinerary({ itinerary: normalizedItinerary }));
  dispatch(setTripMode(true));

  const dayMappedStops = normalizedItinerary.filter(
    (item) => Number(item.day) === Number(day) && !!getActivityCoordinate(item)
  );

  if (getDayRoute && (tripId || activeTrip?._id) && dayMappedStops.length >= 2) {
    const routeTripId = tripId || activeTrip?._id;
    try {
      dispatch(setRouteStatus('loading'));
      const result = await getDayRoute({
        tripId: routeTripId,
        day,
        travelMode,
        origin: currentLocation
          ? {
              lat: currentLocation.lat ?? currentLocation.latitude,
              lng: currentLocation.lng ?? currentLocation.longitude,
            }
          : null,
      }).unwrap();
      const route = result?.route || result;
      dispatch(setActiveDayRoute(route));
      if (route?.routeUnavailable) {
        dispatch(setRouteError(route.warning || 'Road route unavailable, showing approximate route.'));
      }
    } catch (error) {
      console.log('Day route unavailable:', error?.data?.message || error?.message);
      dispatch(setRouteError(error?.data?.message || 'Road route unavailable, showing approximate route.'));
    }
  } else {
    dispatch(setRouteStatus('idle'));
  }

  console.log('Trip Mode:', true);

  setTimeout(() => {
    navigation?.navigate?.('maps');
  }, 100);

  return { trip: activeTrip, itinerary: normalizedItinerary };
}
