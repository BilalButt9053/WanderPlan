/**
 * Route Service
 *
 * Builds real road routes for a saved itinerary day using Google Maps APIs.
 * Google calls stay on the backend so keys are never exposed to mobile clients.
 */

const axios = require('axios');
const Trip = require('../modals/trip-modal');
const SavedItinerary = require('../modals/saved-itinerary-modal');
const {
    getActivityCoordinates,
    normalizeActivityLocation,
    enrichItineraryWithCoordinates
} = require('./coordinate-service');

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

const getGoogleMapsKey = () => process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const hasCoordinates = (coordinates) =>
    toNumber(coordinates?.lat) !== null && toNumber(coordinates?.lng) !== null;

const formatLatLng = (point) => `${point.lat},${point.lng}`;

const normalizeMode = (travelMode = 'driving') => {
    const mode = String(travelMode || 'driving').toLowerCase();
    return ['driving', 'walking', 'bicycling', 'transit'].includes(mode) ? mode : 'driving';
};

const parseTime = (time = '') => {
    const value = String(time || '').trim();
    if (!value) return Number.MAX_SAFE_INTEGER;

    const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (!match) return Number.MAX_SAFE_INTEGER;

    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
};

const sortActivitiesByTime = (activities = []) =>
    activities
        .map((activity, index) => ({ activity, index, minutes: parseTime(activity.time) }))
        .sort((a, b) => {
            if (a.minutes === b.minutes) return a.index - b.index;
            if (a.minutes === Number.MAX_SAFE_INTEGER && b.minutes !== Number.MAX_SAFE_INTEGER) return 1;
            if (b.minutes === Number.MAX_SAFE_INTEGER && a.minutes !== Number.MAX_SAFE_INTEGER) return -1;
            return a.minutes - b.minutes;
        })
        .map((entry) => entry.activity);

const decodePolyline = (encodedPolyline = '') => {
    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encodedPolyline.length) {
        let shift = 0;
        let result = 0;
        let byte = null;

        do {
            byte = encodedPolyline.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
        lat += deltaLat;

        shift = 0;
        result = 0;

        do {
            byte = encodedPolyline.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
        lng += deltaLng;

        coordinates.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5
        });
    }

    return coordinates;
};

const getDirectionsRoute = async ({ origin, stops, travelMode = 'driving' }) => {
    const apiKey = getGoogleMapsKey();
    if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
    }

    if (!origin || !Array.isArray(stops) || stops.length === 0) {
        throw new Error('Origin and at least one stop are required');
    }

    const mode = normalizeMode(travelMode);
    const destination = stops[stops.length - 1];
    const waypoints = stops.slice(0, -1);

    const response = await axios.get(DIRECTIONS_URL, {
        params: {
            origin: formatLatLng(origin),
            destination: formatLatLng(destination),
            waypoints: waypoints.length ? waypoints.map(formatLatLng).join('|') : undefined,
            mode,
            key: apiKey
        },
        timeout: 15000
    });

    if (response.data?.status !== 'OK' || !response.data?.routes?.length) {
        const message = response.data?.error_message || response.data?.status || 'Directions route unavailable';
        throw new Error(message);
    }

    const route = response.data.routes[0];
    const legs = route.legs || [];

    return {
        coordinates: decodePolyline(route.overview_polyline?.points || ''),
        distanceMeters: legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0),
        durationSeconds: legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0),
        legs: legs.map((leg) => ({
            distanceMeters: leg.distance?.value || 0,
            distanceText: leg.distance?.text || '',
            durationSeconds: leg.duration?.value || 0,
            durationText: leg.duration?.text || '',
            startAddress: leg.start_address || '',
            endAddress: leg.end_address || '',
            startLocation: leg.start_location || null,
            endLocation: leg.end_location || null
        })),
        waypointOrder: route.waypoint_order || []
    };
};

const buildDayRoute = async ({ tripId, userId, day = 1, origin = null, travelMode = 'driving' }) => {
    const normalizedDay = Math.max(1, parseInt(day, 10) || 1);
    const mode = normalizeMode(travelMode);

    const [trip, itinerary] = await Promise.all([
        Trip.findOne({ _id: tripId, userId, isDeleted: false }),
        SavedItinerary.findOne({ tripId, userId, isDeleted: false })
    ]);

    if (!trip) {
        throw new Error('Trip not found');
    }

    if (!itinerary) {
        throw new Error('Saved itinerary not found');
    }

    const selectedDay = itinerary.days.find((entry) => Number(entry.day) === normalizedDay);
    if (!selectedDay || !selectedDay.activities?.length) {
        throw new Error(`No activities found for day ${normalizedDay}`);
    }

    const destinationName = itinerary.destination?.name || trip.destination?.name || '';
    const hasMissingCoordinates = selectedDay.activities.some((activity) => !getActivityCoordinates(activity));

    if (hasMissingCoordinates) {
        const enrichedDays = await enrichItineraryWithCoordinates([{
            day: selectedDay.day,
            activities: selectedDay.activities.map((activity) =>
                typeof activity.toObject === 'function' ? activity.toObject() : activity
            ),
            estimatedDayCost: selectedDay.estimatedDayCost,
            notes: selectedDay.notes,
            title: selectedDay.title,
            date: selectedDay.date
        }], destinationName);

        selectedDay.activities = enrichedDays[0]?.activities || selectedDay.activities;
        itinerary.markModified('days');
        await itinerary.save();
    }

    const sortedActivities = sortActivitiesByTime(selectedDay.activities)
        .filter((activity) => activity?.title);

    const orderedStops = [];

    for (const activity of sortedActivities) {
        const normalizedActivity = normalizeActivityLocation(
            typeof activity.toObject === 'function' ? activity.toObject() : activity,
            destinationName
        );
        const coordinates = getActivityCoordinates(normalizedActivity);

        if (!coordinates) {
            console.warn(`[route-service] Skipping ${activity.title}: missing coordinates`);
            continue;
        }

        orderedStops.push({
            id: normalizedActivity._id,
            title: normalizedActivity.title,
            time: normalizedActivity.time || '',
            type: normalizedActivity.type,
            category: normalizedActivity.category,
            location: normalizedActivity.location,
            coordinates: {
                latitude: coordinates.lat,
                longitude: coordinates.lng
            }
        });
    }

    console.log(
        `[route-service] Day ${normalizedDay} usable stops: ${orderedStops.length}/${sortedActivities.length}`
    );

    if (orderedStops.length < 1) {
        return {
            day: normalizedDay,
            travelMode: mode,
            coordinates: [],
            distanceMeters: 0,
            durationSeconds: 0,
            orderedStops: [],
            legs: [],
            routeUnavailable: true,
            warning: 'Road route unavailable. No routeable activities with coordinates were found.'
        };
    }

    const routeOrigin = hasCoordinates(origin)
        ? { lat: Number(origin.lat), lng: Number(origin.lng) }
        : {
            lat: orderedStops[0].coordinates.latitude,
            lng: orderedStops[0].coordinates.longitude
        };

    const routeStops = orderedStops.map((stop) => ({
        lat: stop.coordinates.latitude,
        lng: stop.coordinates.longitude
    }));

    const stopsForDirections = hasCoordinates(origin) ? routeStops : routeStops.slice(1);

    if (stopsForDirections.length === 0) {
        return {
            day: normalizedDay,
            travelMode: mode,
            coordinates: [{
                latitude: routeOrigin.lat,
                longitude: routeOrigin.lng
            }],
            distanceMeters: 0,
            durationSeconds: 0,
            orderedStops,
            legs: [],
            routeUnavailable: true,
            warning: 'Road route unavailable. Showing the only activity location.'
        };
    }

    let directions;
    try {
        directions = await getDirectionsRoute({
            origin: routeOrigin,
            stops: stopsForDirections,
            travelMode: mode
        });
    } catch (error) {
        console.warn(`[route-service] Directions unavailable, returning approximate route: ${error.message}`);
        return {
            day: normalizedDay,
            travelMode: mode,
            coordinates: [
                { latitude: routeOrigin.lat, longitude: routeOrigin.lng },
                ...stopsForDirections.map((stop) => ({
                    latitude: stop.lat,
                    longitude: stop.lng
                }))
            ],
            distanceMeters: 0,
            durationSeconds: 0,
            orderedStops,
            legs: [],
            routeUnavailable: true,
            warning: 'Road route unavailable, showing approximate route.'
        };
    }

    return {
        day: normalizedDay,
        travelMode: mode,
        coordinates: directions.coordinates,
        distanceMeters: directions.distanceMeters,
        durationSeconds: directions.durationSeconds,
        orderedStops,
        legs: directions.legs
    };
};

module.exports = {
    buildDayRoute,
    getActivityCoordinates,
    decodePolyline,
    getDirectionsRoute
};
