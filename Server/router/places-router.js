/**
 * Places Routes - Google Places API endpoints
 *
 * Base path: /api/places
 *
 * Public endpoints (no auth required):
 * - GET /nearby - Search nearby places
 * - GET /search - Text search for places
 * - GET /details/:placeId - Get place details
 * - GET /autocomplete - Get place predictions
 */

const express = require('express');
const router = express.Router();
const {
    getNearbyPlaces,
    searchPlaces,
    getPlaceDetails,
    getAutocomplete
} = require('../controllers/places-controller');

/**
 * GET /api/places/nearby
 * Search for places near a location
 * Query: lat, lng, radius, type, keyword
 */
router.get('/nearby', getNearbyPlaces);

/**
 * GET /api/places/search
 * Text search for places
 * Query: query, lat, lng, radius
 */
router.get('/search', searchPlaces);

/**
 * GET /api/places/autocomplete
 * Get place predictions for autocomplete
 * Query: input, lat, lng
 */
router.get('/autocomplete', getAutocomplete);

/**
 * GET /api/places/details/:placeId
 * Get detailed information about a place
 */
router.get('/details/:placeId', getPlaceDetails);

module.exports = router;
