const axios = require('axios');

const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const isValidLatLng = (lat, lng) =>
    lat !== null &&
    lng !== null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

const getGooglePlacesKey = () => process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

const getActivityCoordinates = (activity = {}) => {
    const lat = toNumber(
        activity?.location?.coordinates?.lat ??
        activity?.location?.coordinates?.latitude ??
        activity?.location?.lat ??
        activity?.location?.latitude ??
        activity?.latitude ??
        activity?.lat ??
        activity?.coordinates?.lat ??
        activity?.coordinates?.latitude
    );
    const lng = toNumber(
        activity?.location?.coordinates?.lng ??
        activity?.location?.coordinates?.longitude ??
        activity?.location?.lng ??
        activity?.location?.longitude ??
        activity?.longitude ??
        activity?.lng ??
        activity?.coordinates?.lng ??
        activity?.coordinates?.longitude
    );

    if (!isValidLatLng(lat, lng)) return null;
    return { lat, lng };
};

const getLocationParts = (activity = {}, fallbackDestination = '') => {
    const rawLocation = activity.location;
    const isLocationObject = rawLocation && typeof rawLocation === 'object' && !Array.isArray(rawLocation);
    const locationText = typeof rawLocation === 'string' ? rawLocation : '';

    return {
        name: String(
            (isLocationObject && rawLocation.name) ||
            activity.locationName ||
            activity.title ||
            activity.name ||
            locationText ||
            fallbackDestination ||
            ''
        ).trim(),
        address: String(
            (isLocationObject && rawLocation.address) ||
            activity.address ||
            locationText ||
            ''
        ).trim(),
        placeId: (isLocationObject && rawLocation.placeId) || activity.placeId || null
    };
};

const normalizeActivityLocation = (activity = {}, fallbackDestination = '') => {
    const coordinates = getActivityCoordinates(activity);
    const locationParts = getLocationParts(activity, fallbackDestination);

    return {
        ...activity,
        location: {
            name: locationParts.name,
            address: locationParts.address,
            placeId: locationParts.placeId,
            coordinates: {
                lat: coordinates?.lat ?? null,
                lng: coordinates?.lng ?? null
            }
        }
    };
};

const withResolvedCoordinateStatus = (activity, destination = '') => {
    const normalized = normalizeActivityLocation(activity, destination);
    normalized.coordinateStatus = 'resolved';
    delete normalized.coordinateError;
    return normalized;
};

const buildSearchQuery = (activity = {}, destination = '') => {
    const locationName = typeof activity.location === 'object'
        ? activity.location?.name || activity.location?.address
        : activity.location;
    return [
        activity.title || activity.name || locationName,
        destination
    ].filter(Boolean).join(' ').trim();
};

const withMissingCoordinateStatus = (activity, reason, destination = '') => ({
    ...normalizeActivityLocation(activity, destination),
    coordinateStatus: 'missing',
    coordinateError: String(reason || 'Coordinates unavailable').slice(0, 160)
});

const resolveActivityCoordinates = async (activity = {}, destination = '') => {
    const existing = getActivityCoordinates(activity);
    if (existing) {
        return withResolvedCoordinateStatus(activity, destination);
    }

    const apiKey = getGooglePlacesKey();
    if (!apiKey) {
        return withMissingCoordinateStatus(activity, 'Google Places API key is not configured', destination);
    }

    const query = buildSearchQuery(activity, destination);
    if (!query) {
        return withMissingCoordinateStatus(activity, 'No searchable activity name', destination);
    }

    try {
        const response = await axios.get(TEXT_SEARCH_URL, {
            params: {
                query,
                key: apiKey
            },
            timeout: 10000
        });

        if (response.data?.status !== 'OK' || !response.data?.results?.length) {
            const reason = response.data?.status || 'No Google Places result';
            return withMissingCoordinateStatus(activity, reason, destination);
        }

        const result = response.data.results[0];
        const location = result.geometry?.location;
        const lat = toNumber(location?.lat);
        const lng = toNumber(location?.lng);

        if (!isValidLatLng(lat, lng)) {
            return withMissingCoordinateStatus(activity, 'Google Places result had no coordinates', destination);
        }

        const normalized = withResolvedCoordinateStatus({
            ...activity,
            location: {
                name: result.name || activity.title || activity.name || '',
                address: result.formatted_address || '',
                placeId: result.place_id || activity.placeId || null,
                coordinates: { lat, lng }
            }
        }, destination);

        return normalized;
    } catch (error) {
        return withMissingCoordinateStatus(activity, error.message || 'Google lookup failed', destination);
    }
};

const getActivityCacheKey = (activity = {}, destination = '') => {
    const locationName = typeof activity.location === 'object'
        ? activity.location?.name || activity.location?.address
        : activity.location;
    return [
        activity.title || activity.name || locationName || '',
        locationName || '',
        destination || ''
    ].join('|').toLowerCase().replace(/\s+/g, ' ').trim();
};

const enrichItineraryWithCoordinates = async (itinerary, destination = '') => {
    const days = Array.isArray(itinerary) ? itinerary : itinerary?.days;
    if (!Array.isArray(days)) return itinerary;

    const lookupCache = new Map();
    const enrichedDays = [];

    for (const day of days) {
        const activities = Array.isArray(day?.activities) ? day.activities : [];
        const enrichedActivities = [];

        for (const activity of activities) {
            if (getActivityCoordinates(activity)) {
                enrichedActivities.push(withResolvedCoordinateStatus(activity, destination));
                continue;
            }

            const cacheKey = getActivityCacheKey(activity, destination);
            if (lookupCache.has(cacheKey)) {
                const cached = lookupCache.get(cacheKey);
                enrichedActivities.push({
                    ...normalizeActivityLocation({
                        ...activity,
                        location: cached.location || activity.location
                    }, destination),
                    ...(cached.coordinateStatus ? {
                        coordinateStatus: cached.coordinateStatus,
                        coordinateError: cached.coordinateError
                    } : {})
                });
                continue;
            }

            const resolved = await resolveActivityCoordinates(activity, destination);
            lookupCache.set(cacheKey, {
                location: resolved.location,
                coordinateStatus: resolved.coordinateStatus,
                coordinateError: resolved.coordinateError
            });
            enrichedActivities.push(resolved);
        }

        enrichedDays.push({
            ...day,
            activities: enrichedActivities
        });
    }

    if (Array.isArray(itinerary)) return enrichedDays;
    return {
        ...itinerary,
        days: enrichedDays
    };
};

module.exports = {
    getActivityCoordinates,
    normalizeActivityLocation,
    resolveActivityCoordinates,
    enrichItineraryWithCoordinates
};
