import { setActiveTrip, setActiveTripItinerary, setTripMode } from '../redux/slices/tripsSlice';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractLatitude = (item) =>
  toNumber(
    item?.latitude ??
      item?.location?.lat ??
      item?.location?.latitude ??
      item?.location?.coordinates?.lat ??
      item?.location?.coordinates?.latitude ??
      item?.coordinates?.lat ??
      item?.coordinates?.latitude
  );

const extractLongitude = (item) =>
  toNumber(
    item?.longitude ??
      item?.location?.lng ??
      item?.location?.longitude ??
      item?.location?.coordinates?.lng ??
      item?.location?.coordinates?.longitude ??
      item?.coordinates?.lng ??
      item?.coordinates?.longitude
  );

const extractCost = (item) =>
  toNumber(item?.cost ?? item?.actualCost ?? item?.estimatedCost ?? item?.price ?? 0) ?? 0;

const extractName = (item) => item?.name || item?.title || item?.activity || item?.label || 'Untitled Place';

const normalizeItem = (item, fallbackDay = 1, index = 0) => ({
  ...item,
  id: item?.id || item?._id || item?.placeId || `${fallbackDay}-${index}`,
  name: extractName(item),
  latitude: extractLatitude(item),
  longitude: extractLongitude(item),
  day: Number(item?.day ?? fallbackDay ?? 1),
  cost: extractCost(item),
});

export function normalizeItinerary(items = []) {
  if (!items) return [];

  if (Array.isArray(items)) {
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

  console.log('Trip Mode:', true);

  setTimeout(() => {
    navigation?.navigate?.('maps');
  }, 100);

  return { trip: activeTrip, itinerary: normalizedItinerary };
}