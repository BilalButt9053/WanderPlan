/**
 * Places Controller - Google Places API integration
 *
 * Provides endpoints to search Google Places nearby and get place details.
 * Acts as a proxy to protect the API key on the server side.
 */

const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Map Google place types to our app categories
 */
const mapPlaceType = (types) => {
    if (!types || !types.length) return 'other';

    const typeMapping = {
        restaurant: 'restaurant',
        food: 'restaurant',
        cafe: 'cafe',
        bar: 'restaurant',
        bakery: 'cafe',
        lodging: 'hotel',
        hotel: 'hotel',
        tourist_attraction: 'attraction',
        museum: 'attraction',
        park: 'attraction',
        amusement_park: 'attraction',
        zoo: 'attraction',
        aquarium: 'attraction',
        art_gallery: 'attraction',
        shopping_mall: 'shopping',
        store: 'shopping',
        clothing_store: 'shopping',
        spa: 'attraction',
        gym: 'attraction',
        mosque: 'attraction',
        church: 'attraction',
        temple: 'attraction'
    };

    for (const type of types) {
        if (typeMapping[type]) {
            return typeMapping[type];
        }
    }
    return 'other';
};

/**
 * Transform Google place to our app format
 */
const transformPlace = (place) => ({
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address || '',
    location: {
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng
    },
    rating: place.rating || 0,
    reviewCount: place.user_ratings_total || 0,
    priceLevel: place.price_level || null,
    types: place.types || [],
    category: mapPlaceType(place.types),
    photo: place.photos?.[0]?.photo_reference
        ? `${PLACES_BASE_URL}/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
        : null,
    isOpen: place.opening_hours?.open_now ?? null,
    businessStatus: place.business_status || 'OPERATIONAL'
});

/**
 * GET /api/places/nearby
 * Search for nearby places using Google Places API
 *
 * Query params:
 * - lat: Latitude (required)
 * - lng: Longitude (required)
 * - radius: Search radius in meters (default: 5000, max: 50000)
 * - type: Place type filter (restaurant, cafe, hotel, attraction, shopping)
 * - keyword: Search keyword
 */
const getNearbyPlaces = async (req, res, next) => {
    try {
        const { lat, lng, radius = 5000, type, keyword } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        if (!GOOGLE_PLACES_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Google Places API is not configured'
            });
        }

        // Map our types to Google's place types
        const googleTypeMap = {
            restaurant: 'restaurant',
            cafe: 'cafe',
            hotel: 'lodging',
            attraction: 'tourist_attraction',
            shopping: 'shopping_mall'
        };

        const params = {
            location: `${lat},${lng}`,
            radius: Math.min(Number(radius), 50000),
            key: GOOGLE_PLACES_API_KEY
        };

        if (type && googleTypeMap[type]) {
            params.type = googleTypeMap[type];
        }

        if (keyword) {
            params.keyword = keyword;
        }

        const response = await axios.get(`${PLACES_BASE_URL}/nearbysearch/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error('[places] Google API error:', response.data.status, response.data.error_message);
            return res.status(502).json({
                success: false,
                message: 'Google Places API error',
                error: response.data.status
            });
        }

        const places = (response.data.results || []).map(transformPlace);

        res.json({
            success: true,
            places,
            count: places.length,
            nextPageToken: response.data.next_page_token || null
        });
    } catch (error) {
        console.error('[places] getNearbyPlaces error:', error.message);
        next(error);
    }
};

/**
 * GET /api/places/search
 * Text search for places using Google Places API
 *
 * Query params:
 * - query: Search query (required)
 * - lat: Latitude (optional, for location bias)
 * - lng: Longitude (optional, for location bias)
 * - radius: Search radius in meters (default: 10000)
 */
const searchPlaces = async (req, res, next) => {
    try {
        const { query, lat, lng, radius = 10000 } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        if (!GOOGLE_PLACES_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Google Places API is not configured'
            });
        }

        const params = {
            query,
            key: GOOGLE_PLACES_API_KEY
        };

        if (lat && lng) {
            params.location = `${lat},${lng}`;
            params.radius = Math.min(Number(radius), 50000);
        }

        const response = await axios.get(`${PLACES_BASE_URL}/textsearch/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error('[places] Google API error:', response.data.status, response.data.error_message);
            return res.status(502).json({
                success: false,
                message: 'Google Places API error',
                error: response.data.status
            });
        }

        const places = (response.data.results || []).map(transformPlace);

        res.json({
            success: true,
            places,
            count: places.length,
            nextPageToken: response.data.next_page_token || null
        });
    } catch (error) {
        console.error('[places] searchPlaces error:', error.message);
        next(error);
    }
};

/**
 * GET /api/places/details/:placeId
 * Get detailed information about a place
 */
const getPlaceDetails = async (req, res, next) => {
    try {
        const { placeId } = req.params;

        if (!placeId) {
            return res.status(400).json({
                success: false,
                message: 'Place ID is required'
            });
        }

        if (!GOOGLE_PLACES_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Google Places API is not configured'
            });
        }

        const params = {
            place_id: placeId,
            fields: 'place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,types,photos,opening_hours,formatted_phone_number,website,reviews,business_status',
            key: GOOGLE_PLACES_API_KEY
        };

        const response = await axios.get(`${PLACES_BASE_URL}/details/json`, { params });

        if (response.data.status !== 'OK') {
            console.error('[places] Google API error:', response.data.status, response.data.error_message);
            return res.status(502).json({
                success: false,
                message: 'Google Places API error',
                error: response.data.status
            });
        }

        const place = response.data.result;
        const transformed = {
            placeId: place.place_id,
            name: place.name,
            address: place.formatted_address || '',
            location: {
                lat: place.geometry?.location?.lat,
                lng: place.geometry?.location?.lng
            },
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            priceLevel: place.price_level || null,
            types: place.types || [],
            category: mapPlaceType(place.types),
            photos: (place.photos || []).map(photo =>
                `${PLACES_BASE_URL}/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            ),
            openingHours: place.opening_hours?.weekday_text || [],
            isOpen: place.opening_hours?.open_now ?? null,
            phone: place.formatted_phone_number || null,
            website: place.website || null,
            reviews: (place.reviews || []).slice(0, 5).map(review => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.relative_time_description
            })),
            businessStatus: place.business_status || 'OPERATIONAL'
        };

        res.json({
            success: true,
            place: transformed
        });
    } catch (error) {
        console.error('[places] getPlaceDetails error:', error.message);
        next(error);
    }
};

/**
 * GET /api/places/autocomplete
 * Get place predictions for autocomplete
 *
 * Query params:
 * - input: Search input (required)
 * - lat: Latitude (optional, for location bias)
 * - lng: Longitude (optional, for location bias)
 */
const getAutocomplete = async (req, res, next) => {
    try {
        const { input, lat, lng } = req.query;

        if (!input) {
            return res.status(400).json({
                success: false,
                message: 'Input is required'
            });
        }

        if (!GOOGLE_PLACES_API_KEY) {
            return res.status(503).json({
                success: false,
                message: 'Google Places API is not configured'
            });
        }

        const params = {
            input,
            key: GOOGLE_PLACES_API_KEY,
            components: 'country:pk' // Focus on Pakistan
        };

        if (lat && lng) {
            params.location = `${lat},${lng}`;
            params.radius = 50000;
        }

        const response = await axios.get(`${PLACES_BASE_URL}/autocomplete/json`, { params });

        if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
            console.error('[places] Google API error:', response.data.status, response.data.error_message);
            return res.status(502).json({
                success: false,
                message: 'Google Places API error',
                error: response.data.status
            });
        }

        const predictions = (response.data.predictions || []).map(prediction => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting?.main_text || '',
            secondaryText: prediction.structured_formatting?.secondary_text || ''
        }));

        res.json({
            success: true,
            predictions
        });
    } catch (error) {
        console.error('[places] getAutocomplete error:', error.message);
        next(error);
    }
};

module.exports = {
    getNearbyPlaces,
    searchPlaces,
    getPlaceDetails,
    getAutocomplete
};
