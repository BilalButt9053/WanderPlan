/**
 * Distance Utilities - Haversine formula and transport cost calculations
 *
 * Used for calculating distances between coordinates and estimating
 * transport costs for trip planning.
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return '--';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Calculate transport cost based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} ratePerKm - Rate per kilometer in PKR (default: 30)
 * @returns {number} Estimated cost in PKR
 */
export const calculateTransportCost = (distanceKm, ratePerKm = 30) => {
  if (distanceKm === null || distanceKm === undefined) return 0;
  // Minimum fare of 150 PKR
  const baseFare = 150;
  const distanceCost = distanceKm * ratePerKm;
  return Math.round(Math.max(baseFare, distanceCost));
};

/**
 * Calculate transport cost for a day's activities
 * @param {Array} activities - Array of activities with location.coordinates
 * @param {Object} startLocation - Starting location { lat, lng }
 * @returns {Object} { totalDistance, totalCost, segments }
 */
export const calculateDayTransportCost = (activities, startLocation) => {
  const result = {
    totalDistance: 0,
    totalCost: 0,
    segments: [],
  };

  if (!activities || activities.length === 0) return result;

  // Filter activities that have valid coordinates
  const activitiesWithCoords = activities.filter(
    (a) =>
      (a.latitude != null && a.longitude != null) ||
      (a.location?.coordinates?.lat != null && a.location?.coordinates?.lng != null)
  );

  if (activitiesWithCoords.length === 0) return result;

  let currentLat = startLocation?.lat;
  let currentLng = startLocation?.lng;

  // If no start location, use first activity as start
  if (!currentLat || !currentLng) {
    currentLat = activitiesWithCoords[0].latitude ?? activitiesWithCoords[0].location.coordinates.lat;
    currentLng = activitiesWithCoords[0].longitude ?? activitiesWithCoords[0].location.coordinates.lng;
  }

  for (const activity of activitiesWithCoords) {
    const destLat = activity.latitude ?? activity.location.coordinates.lat;
    const destLng = activity.longitude ?? activity.location.coordinates.lng;

    const distance = calculateDistance(currentLat, currentLng, destLat, destLng);

    if (distance !== null && distance > 0.1) {
      // Only count if more than 100m
      const cost = calculateTransportCost(distance);
      result.segments.push({
        from: { lat: currentLat, lng: currentLng },
        to: { lat: destLat, lng: destLng },
        activity: activity.name || activity.title,
        distance,
        cost,
      });
      result.totalDistance += distance;
      result.totalCost += cost;
    }

    // Update current location
    currentLat = destLat;
    currentLng = destLng;
  }

  return result;
};

/**
 * Calculate total trip transport cost across all days
 * @param {Array} days - Array of day objects with activities
 * @param {Object} startLocation - Starting location { lat, lng }
 * @returns {Object} { totalDistance, totalCost, dayBreakdown }
 */
export const calculateTripTransportCost = (days, startLocation) => {
  const result = {
    totalDistance: 0,
    totalCost: 0,
    dayBreakdown: [],
  };

  if (!days || days.length === 0) return result;

  let lastLocation = startLocation;

  for (const day of days) {
    const dayResult = calculateDayTransportCost(day.activities || [], lastLocation);
    result.totalDistance += dayResult.totalDistance;
    result.totalCost += dayResult.totalCost;
    result.dayBreakdown.push({
      day: day.day,
      distance: dayResult.totalDistance,
      cost: dayResult.totalCost,
      segments: dayResult.segments,
    });

    // Update last location to be the last activity of this day
    if (dayResult.segments.length > 0) {
      const lastSegment = dayResult.segments[dayResult.segments.length - 1];
      lastLocation = lastSegment.to;
    }
  }

  return result;
};

/**
 * Format currency for display (PKR)
 * @param {number} amount - Amount in PKR
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'PKR 0';
  return `PKR ${amount.toLocaleString()}`;
};

/**
 * Get estimated travel time based on distance
 * Assumes average speed of 30 km/h in city traffic
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted time string
 */
export const getEstimatedTravelTime = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return '--';

  const avgSpeedKmh = 30; // Average city speed
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  }

  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};
